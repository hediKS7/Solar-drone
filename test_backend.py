import requests
import json

def test_simulation():
    url = "http://127.0.0.1:8000/simulate"
    
    payload = {
        "battery": {
            "nSeries": 4,
            "nParallel": 2,
            "vNom": 14.8,
            "vMax": 16.8,
            "vMin": 12.0,
            "qNom": 10.0,
            "r0": 0.050,
            "r1": 0.010,
            "c1": 2000.0
        },
        "solar": {
            "aPanel": 0.42,
            "etaPanel": 0.20,
            "etaMppt": 0.95,
            "vOcStc": 21.0,
            "iScStc": 4.8
        },
        "mission": [
            {"name": "Décollage", "durationMin": 3, "powerW": 120.0},
            {"name": "Montée", "durationMin": 5, "powerW": 90.0},
            {"name": "Croisière", "durationMin": 37, "powerW": 55.0},
            {"name": "Retour", "durationMin": 5, "powerW": 65.0}
        ],
        "environment": {
            "gMin": 400,
            "gMax": 850,
            "cloudFactor": 0.5,
            "cloudStartMin": 25,
            "cloudEndMin": 30
        },
        "lca": {
            "feGrid": 0.58,
            "feSolar": 0.041,
            "nCycles": 500,
            "eeBatterie": 250.0,
            "feBatMfg": 0.120,
            "etaCharge": 0.90
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        
        print("Simulation Successful!")
        print(f"Time series points: {len(result['time_series'])}")
        print(f"Final SoC: {result['summary']['final_soc']:.2f}%")
        print(f"CO2 reduction: {result['lca_metrics']['reduction_pct']}%")
        
    except Exception as e:
        print(f"Simulation Failed: {e}")
        if 'response' in locals() and response.text:
            print(f"Response: {response.text}")

if __name__ == "__main__":
    test_simulation()
