from pydantic import BaseModel, Field
from typing import List, Optional

class BatteryConfig(BaseModel):
    n_series: int = Field(4, alias="nSeries")
    n_parallel: int = Field(2, alias="nParallel")
    v_nom: float = Field(14.8, alias="vNom")
    v_max: float = Field(16.8, alias="vMax")
    v_min: float = Field(12.0, alias="vMin")
    q_nom: float = Field(10.0, alias="qNom")
    r0: float = Field(0.050, alias="r0")
    r1: float = Field(0.010, alias="r1")
    c1: float = Field(2000.0, alias="c1")

class SolarConfig(BaseModel):
    a_panel: float = Field(0.42, alias="aPanel")
    eta_panel: float = Field(0.20, alias="etaPanel")
    eta_mppt: float = Field(0.95, alias="etaMppt")
    v_oc_stc: float = Field(21.0, alias="vOcStc")
    i_sc_stc: float = Field(4.8, alias="iScStc")

class MissionPhase(BaseModel):
    name: str
    duration_min: float = Field(..., alias="durationMin")
    power_w: float = Field(..., alias="powerW")

class EnvironmentalConfig(BaseModel):
    g_min: float = Field(400, alias="gMin")
    g_max: float = Field(850, alias="gMax")
    cloud_factor: float = Field(0.5, alias="cloudFactor")
    cloud_start_min: float = Field(25, alias="cloudStartMin")
    cloud_end_min: float = Field(30, alias="cloudEndMin")

class LCAConfig(BaseModel):
    fe_grid: float = Field(0.58, alias="feGrid")
    fe_solar: float = Field(0.041, alias="feSolar")
    n_cycles: int = Field(500, alias="nCycles")
    ee_batterie: float = Field(250.0, alias="eeBatterie")
    fe_bat_mfg: float = Field(0.120, alias="feBatMfg")
    eta_charge: float = Field(0.90, alias="etaCharge")

class SimulationRequest(BaseModel):
    battery: BatteryConfig
    solar: SolarConfig
    mission: List[MissionPhase]
    environment: EnvironmentalConfig
    lca: LCAConfig

class TimeStep(BaseModel):
    t: float
    soc: float
    v_bat: float
    i_bat: float
    p_load: float
    p_solar: float
    p_bat: float
    phase: str

class LCAMetrics(BaseModel):
    lce_no_solar: float
    lce_with_solar: float
    co2_no_solar: float
    co2_with_solar: float
    reduction_pct: float

class SimulationResponse(BaseModel):
    time_series: List[TimeStep]
    lca_metrics: LCAMetrics
    summary: dict
