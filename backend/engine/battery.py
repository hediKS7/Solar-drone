import numpy as np
from scipy.interpolate import interp1d
from backend.models.schemas import BatteryConfig

class BatteryEngine:
    def __init__(self, config: BatteryConfig):
        self.config = config
        
        # Table OCV vs SoC (from notebook)
        self.soc_table = np.array([0.0, 0.1, 0.2, 0.3, 0.4, 0.5,
                                   0.6, 0.7, 0.8, 0.9, 1.0])
        self.ocv_table = np.array([12.0, 12.8, 13.2, 13.6, 13.9, 14.2,
                                   14.5, 14.8, 15.2, 15.8, 16.8])
        
        self.ocv_interp = interp1d(self.soc_table, self.ocv_table, kind='cubic',
                                   bounds_error=False, fill_value=(12.0, 16.8))

    def get_ocv(self, soc: float) -> float:
        return float(self.ocv_interp(np.clip(soc, 0, 1)))

    def simulate_step(self, p_bat: float, soc: float, v_rc: float, dt: float):
        """
        Simulates one time step of the ECM 1RC model.
        """
        ocv = self.get_ocv(soc)
        
        # Solve quadratic: R0*I^2 - (OCV - V_RC)*I + P = 0
        a = self.config.r0
        b = -(ocv - v_rc)
        c = p_bat
        
        discriminant = b**2 - 4*a*c
        if discriminant < 0:
            discriminant = 0
            
        # Physical root
        i_bat = (-b - np.sqrt(discriminant)) / (2*a)
        
        v_bat = ocv - self.config.r0 * i_bat - v_rc
        
        # Update states
        q_nom_c = self.config.q_nom * 3600
        dv_rc = (i_bat / self.config.c1 - v_rc / (self.config.r1 * self.config.c1)) * dt
        new_v_rc = v_rc + dv_rc
        
        new_soc = soc - (i_bat * dt) / q_nom_c
        new_soc = np.clip(new_soc, 0.0, 1.0)
        
        return {
            "v_bat": v_bat,
            "i_bat": i_bat,
            "new_soc": new_soc,
            "new_v_rc": new_v_rc
        }
