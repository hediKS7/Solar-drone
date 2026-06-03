import numpy as np
from scipy.interpolate import interp1d
from backend.models.schemas import BatteryConfig

class BatteryEngine:
    def __init__(self, config: BatteryConfig):
        self.config = config
        
        # Base OCV per cell (interpolated from 3.0V to 4.2V)
        self.soc_table = np.array([0.0, 0.1, 0.2, 0.3, 0.4, 0.5,
                                   0.6, 0.7, 0.8, 0.9, 1.0])
        # Per-cell OCV values
        self.ocv_table_per_cell = np.array([3.0, 3.2, 3.3, 3.4, 3.475, 3.55,
                                            3.625, 3.7, 3.8, 3.95, 4.2])
        
    def get_ocv(self, soc: float) -> float:
        # Scale for the whole pack dynamically based on current config
        ocv_table = self.ocv_table_per_cell * self.config.n_series
        ocv_interp = interp1d(self.soc_table, ocv_table, kind='cubic',
                                   bounds_error=False, fill_value=(ocv_table[0], ocv_table[-1]))
        return float(ocv_interp(np.clip(soc, 0, 1)))


    def simulate_step(self, p_bat: float, soc: float, v_rc: float, dt: float):
        """
        Simulates one time step of the ECM 1RC model.
        """
        ocv = self.get_ocv(soc)
        
        # Scale resistances and capacitance based on pack configuration
        # R_pack = R_cell * n_series / n_parallel
        # C_pack = C_cell * n_parallel / n_series
        r0_pack = self.config.r0 * self.config.n_series / self.config.n_parallel
        r1_pack = self.config.r1 * self.config.n_series / self.config.n_parallel
        c1_pack = self.config.c1 * self.config.n_parallel / self.config.n_series

        # Solve quadratic: R0*I^2 - (OCV - V_RC)*I + P = 0
        a = r0_pack
        b = -(ocv - v_rc)
        c = p_bat
        
        discriminant = b**2 - 4*a*c
        if discriminant < 0:
            discriminant = 0
            
        # Physical root
        i_bat = (-b - np.sqrt(discriminant)) / (2*a) if a > 0 else (p_bat / b if b != 0 else 0)
        
        v_bat = ocv - r0_pack * i_bat - v_rc
        
        # Update states
        # Total capacity Q_pack = Q_cell * n_parallel
        q_nom_pack_c = self.config.q_nom * self.config.n_parallel * 3600
        
        dv_rc = (i_bat / c1_pack - v_rc / (r1_pack * c1_pack)) * dt if (r1_pack * c1_pack) > 0 else 0
        new_v_rc = v_rc + dv_rc
        
        new_soc = soc - (i_bat * dt) / q_nom_pack_c
        new_soc = np.clip(new_soc, 0.0, 1.0)
        
        return {
            "v_bat": v_bat,
            "i_bat": i_bat,
            "new_soc": new_soc,
            "new_v_rc": new_v_rc
        }
