import numpy as np
from typing import List
from backend.models.schemas import SimulationRequest, SimulationResponse, TimeStep, LCAMetrics
from backend.engine.battery import BatteryEngine
from backend.engine.solar import SolarEngine
from backend.engine.lca import LCAEngine

class DroneSimulator:
    def __init__(self, request: SimulationRequest):
        self.request = request
        self.battery_engine = BatteryEngine(request.battery)
        self.solar_engine = SolarEngine(request.solar)
        self.lca_engine = LCAEngine(request.lca)
        self.dt = 1.0 # 1 second time step

    def run(self) -> SimulationResponse:
        # 1. Prepare mission profile
        total_duration_s = int(sum(p.duration_min for p in self.request.mission) * 60)
        t_arr = np.arange(0, total_duration_s, self.dt)
        
        p_load_profile = np.zeros(len(t_arr))
        phase_profile = [""] * len(t_arr)
        
        t_cursor = 0
        for phase in self.request.mission:
            duration_s = int(phase.duration_min * 60)
            p_load_profile[t_cursor:t_cursor + duration_s] = phase.power_w
            for i in range(t_cursor, min(t_cursor + duration_s, len(t_arr))):
                phase_profile[i] = phase.name
            t_cursor += duration_s

        # 2. Prepare Irradiance profile
        g_profile = np.linspace(self.request.environment.g_min, self.request.environment.g_max, len(t_arr))
        cloud_start_s = self.request.environment.cloud_start_min * 60
        cloud_end_s = self.request.environment.cloud_end_min * 60
        cloud_mask = (t_arr >= cloud_start_s) & (t_arr <= cloud_end_s)
        g_profile[cloud_mask] *= self.request.environment.cloud_factor

        # 3. Run Simulation
        time_series = []
        soc = 1.0
        v_rc = 0.0
        
        e_decharge_mission = 0.0
        e_solaire_mission = 0.0
        
        for k in range(len(t_arr)):
            p_load = p_load_profile[k]
            g = g_profile[k]
            
            p_solar = self.solar_engine.get_mppt_power(g, self.dt)
            p_solar_actual = min(p_solar, p_load) # MPPT limited to load as per notebook
            
            p_bat = p_load - p_solar_actual
            
            step_result = self.battery_engine.simulate_step(p_bat, soc, v_rc, self.dt)
            
            time_series.append(TimeStep(
                t=float(t_arr[k]),
                soc=float(step_result["new_soc"] * 100),
                v_bat=float(step_result["v_bat"]),
                i_bat=float(step_result["i_bat"]),
                p_load=float(p_load),
                p_solar=float(p_solar_actual),
                p_bat=float(p_bat),
                phase=phase_profile[k]
            ))
            
            soc = step_result["new_soc"]
            v_rc = step_result["new_v_rc"]
            
            e_decharge_mission += p_bat * self.dt / 3600
            e_solaire_mission += p_solar_actual * self.dt / 3600
            
            if step_result["v_bat"] < self.request.battery.v_min:
                break

        # 4. LCA Calculations
        e_nom = self.request.battery.v_nom * self.request.battery.q_nom
        # Simplified recharge calculation (similar to notebook trapezoid)
        # In a real app we might simulate the recharge too, but for now we follow the logic
        e_recharge_grille = (e_decharge_mission / self.request.lca.eta_charge)
        
        lca_metrics_dict = self.lca_engine.calculate_metrics(
            e_nom, e_decharge_mission, e_solaire_mission, e_recharge_grille
        )
        
        lca_metrics = LCAMetrics(**lca_metrics_dict)
        
        summary = {
            "duration_min": total_duration_s / 60,
            "final_soc": soc * 100,
            "energy_used_wh": e_decharge_mission,
            "solar_energy_wh": e_solaire_mission,
            "max_current_a": max(ts.i_bat for ts in time_series) if time_series else 0
        }

        return SimulationResponse(
            time_series=time_series,
            lca_metrics=lca_metrics,
            summary=summary
        )
