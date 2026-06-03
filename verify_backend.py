import requests
import json

def run_sim(n_series, capacity):
    url = "http://127.0.0.1:8000/simulate"
    payload = {
        "battery": {
            "nSeries": n_series,
            "nParallel": 2,
            "vNom": n_series * 3.7,
            "vMax": n_series * 4.2,
            "vMin": n_series * 3.0,
            "qNom": capacity,
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
            {"name": "Test", "durationMin": 10, "powerW": 100.0}
        ],
        "environment": {
            "gMin": 400,
            "gMax": 850,
            "cloudFactor": 0.5,
            "cloudStartMin": 5,
            "cloudEndMin": 7
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
    response = requests.post(url, json=payload)
    return response.json()

def verify_sync():
    print("--- Backend Synchronization Test ---")
    
    # Test 1: 4S Battery
    res_4s = run_sim(4, 10.0)
    v_start_4s = res_4s['time_series'][0]['v_bat']
    soc_end_4s = res_4s['summary']['final_soc']
    
    # Test 2: 8S Battery (Should have double voltage)
    res_8s = run_sim(8, 10.0)
    v_start_8s = res_8s['time_series'][0]['v_bat']
    soc_end_8s = res_8s['summary']['final_soc']
    
    # Test 3: 4S Battery but 20Ah (Should have higher final SoC)
    res_4s_20ah = run_sim(4, 20.0)
    soc_end_4s_20ah = res_4s_20ah['summary']['final_soc']

    print(f"4S Start Voltage: {v_start_4s:.2f}V")
    print(f"8S Start Voltage: {v_start_8s:.2f}V")
    print(f"4S (10Ah) Final SoC: {soc_end_4s:.2f}%")
    print(f"4S (20Ah) Final SoC: {soc_end_4s_20ah:.2f}%")

    if abs(v_start_8s - 2*v_start_4s) < 1.0:
        print("✅ SUCCESS: Voltage scales correctly with nSeries.")
    else:
        print("❌ FAILURE: Voltage does NOT scale correctly.")

    if soc_end_4s_20ah > soc_end_4s:
        print("✅ SUCCESS: Capacity change affects final SoC.")
    else:
        print("❌ FAILURE: Capacity change has NO effect.")

if __name__ == "__main__":
    verify_sync()
