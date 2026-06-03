import numpy as np
from backend.models.schemas import LCAConfig

class LCAEngine:
    def __init__(self, config: LCAConfig):
        self.config = config

    def calculate_metrics(self, e_nom: float, e_decharge_mission: float, e_solaire_mission: float, e_recharge_grille: float):
        """
        Calculates LCE and CO2 metrics.
        """
        n_cycles = self.config.n_cycles
        
        # LCE
        e_fabrication_kwh = (self.config.ee_batterie * e_nom) / 1000
        e_recharge_totale_kwh = (e_recharge_grille * n_cycles) / 1000
        e_solaire_totale_kwh = (e_solaire_mission * n_cycles) / 1000
        
        lce_no_solar = e_fabrication_kwh + e_recharge_totale_kwh
        lce_with_solar = e_fabrication_kwh + (e_recharge_totale_kwh - e_solaire_totale_kwh)
        lce_with_solar = max(lce_with_solar, e_fabrication_kwh)
        
        # CO2
        co2_fabrication = self.config.fe_bat_mfg * e_nom
        co2_recharge_tot = (e_recharge_grille / 1000) * self.config.fe_grid * n_cycles
        co2_solaire_tot = (e_solaire_mission / 1000) * self.config.fe_solar * n_cycles
        
        cf_no_solar = co2_fabrication + co2_recharge_tot
        cf_with_solar = co2_fabrication + co2_solaire_tot + \
                         ((e_recharge_grille - e_solaire_mission) / 1000 * self.config.fe_grid * n_cycles)
        
        reduction_pct = (1 - cf_with_solar / cf_no_solar) * 100 if cf_no_solar > 0 else 0
        
        return {
            "lce_no_solar": round(lce_no_solar, 2),
            "lce_with_solar": round(lce_with_solar, 2),
            "co2_no_solar": round(cf_no_solar, 2),
            "co2_with_solar": round(cf_with_solar, 2),
            "reduction_pct": round(reduction_pct, 1)
        }
