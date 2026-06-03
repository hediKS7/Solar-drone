import numpy as np
from backend.models.schemas import SolarConfig

class SolarEngine:
    """
    Simulates a solar panel with a Perturb & Observe (P&O) MPPT controller.
    """
    def __init__(self, config: SolarConfig):
        self.config = config
        # Initial guess: MPP is often around 75-80% of Open Circuit Voltage
        self.v_ref = 0.75 * config.v_oc_stc
        self.v_prev = self.v_ref
        self.p_prev = 0.0

    def get_mppt_power(self, g: float, dt: float, d_v: float = 0.1) -> float:
        """
        Calculates MPPT power using the P&O algorithm.
        
        Args:
            g: Solar irradiance in W/m^2
            dt: Time step in seconds
            d_v: Voltage perturbation step
        """
        # Solar panel model using Area and Efficiency
        # i_sc at STC = (1000 * Area * Efficiency) / V_oc_stc
        i_sc_stc_eff = (1000.0 * self.config.a_panel * self.config.eta_panel) / self.config.v_oc_stc
        i_sc = i_sc_stc_eff * (g / 1000.0)
        v_oc = self.config.v_oc_stc * (1 + 0.00025 * (g - 1000))
        
        # Current at V_ref (simplified linear/polynomial model)
        i_ref = i_sc * (1 - (self.v_ref / v_oc)**2.5)
        i_ref = max(0, i_ref)
        p_ref = self.v_ref * i_ref
        
        # P&O Logic
        dp = p_ref - self.p_prev
        dv_sign = np.sign(self.v_ref - self.v_prev)
        
        if dp > 0:
            self.v_ref += d_v * dv_sign if dv_sign != 0 else d_v
        elif dp < 0:
            self.v_ref -= d_v * dv_sign if dv_sign != 0 else d_v
            
        self.v_ref = np.clip(self.v_ref, 0.3 * v_oc, 0.95 * v_oc)
        
        self.v_prev = self.v_ref
        self.p_prev = p_ref
        
        return p_ref * self.config.eta_mppt
