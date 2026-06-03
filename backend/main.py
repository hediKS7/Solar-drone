from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models.schemas import SimulationRequest, SimulationResponse
from backend.engine.orchestrator import DroneSimulator
import uvicorn

app = FastAPI(title="SolarDroneSim Pro API")

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
        print(f"Received Simulation Request: Battery S={request.battery.n_series}, P={request.battery.n_parallel}, Capacity={request.battery.q_nom}Ah")
        simulator = DroneSimulator(request)
        result = simulator.run()
        return result
    except Exception as e:
        print(f"Simulation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
