# SolarDrone Pro - Project Simulator

A high-performance, modern web simulator for Solar-Assisted Agricultural Drones. This project simulates Battery Management Systems (BMS) using an ECM 1RC model, Solar MPPT efficiency, and Life Cycle Assessment (LCA) environmental impact.

## Architecture

- **Backend**: FastAPI (Python)
  - Mathematical Engine (ECM 1RC, MPPT P&O)
  - Pydantic models for strict typing
  - NumPy for vectorized calculations
- **Frontend**: Next.js 15 (React)
  - Tailwind CSS 4 & Shadcn UI
  - Zustand for State Management
  - Recharts for interactive data visualization
  - Framer Motion for smooth animations

## Getting Started

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python -m backend.main
```
The API will be available at `http://localhost:8000`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The interface will be available at `http://localhost:3000`.

## Features
- **Dynamic Simulation**: Move sliders to see real-time updates to State of Charge (SoC) and Voltage.
- **Mission Planning**: Adjust power consumption for different flight phases.
- **Environmental Insight**: Instantly see how solar panels reduce the carbon footprint of your drone.
- **MPPT Simulation**: Realistic modeling of solar energy harvesting under variable irradiance.
