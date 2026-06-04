from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models.schemas import SimulationRequest, SimulationResponse, AIAnalysisRequest, AIAnalysisResponse
from backend.engine.orchestrator import DroneSimulator
import uvicorn
import requests
import json
import os

app = FastAPI(title="SolarDroneSim Pro API")

# API Key - In production, this should be in an environment variable
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "8tk56dLjlI8dSlOr9WH06yphzOzGpxgI")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest):
    try:
        simulator = DroneSimulator(request)
        result = simulator.run()
        return result
    except Exception as e:
        print(f"Simulation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=AIAnalysisResponse)
def analyze(data: AIAnalysisRequest):
    if not MISTRAL_API_KEY:
        raise HTTPException(status_code=500, detail="Mistral API Key not configured.")
    
    try:
        req = data.request
        res = data.results
        
        # Prepare context for the prompt
        prompt = f"""
You are the 'SolarDrone Pro' Intelligent Assistant, an expert in Solar-Assisted Agricultural Drones and Power Systems.
Analyze the following simulation results and provide technical feedback.

### DRONE CONFIGURATION:
- Battery: {req.battery.n_series}S {req.battery.n_parallel}P, {req.battery.q_nom}Ah
- Solar: {req.solar.a_panel}m2 area, {req.solar.eta_panel*100}% efficiency
- Mission: {sum(p.duration_min for p in req.mission)} minutes total

### SIMULATION RESULTS:
- Final SoC: {res.summary['final_soc']:.1f}%
- Total Energy Used: {res.summary['energy_used_wh']:.1f} Wh
- Solar Energy Harvested: {res.summary['solar_energy_wh']:.1f} Wh
- CO2 Reduction: {res.lca_metrics.reduction_pct}%

### INSTRUCTIONS:
Provide a **very concise** technical analysis. Use bullet points and bold text for readability.
Max total length: 150 words.
Structure:
1. **Summary**: One sentence on mission success.
2. **Key Findings**: 2-3 bullet points on energy/battery health.
3. **Action Items**: 2 bullet points for optimization.

Keep the tone expert, direct, and elite. Use minimal icons.
"""

        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}"
        }
        payload = {
            "model": "mistral-tiny",
            "messages": [
                {"role": "system", "content": "You are a specialized drone engineering assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"Mistral Error: {response.text}")
            raise HTTPException(status_code=500, detail="Failed to communicate with Mistral AI.")
            
        result = response.json()
        analysis = result['choices'][0]['message']['content']
        
        return AIAnalysisResponse(analysis=analysis)
        
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
