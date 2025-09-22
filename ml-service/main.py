from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import math
import random
from typing import List, Optional

app = FastAPI(
    title="Dwarka Temple ML Prediction Service",
    description="Machine Learning service for predicting temple visitor inflow",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    templeId: str
    date: str
    festivalMode: Optional[bool] = False

class HourlyPrediction(BaseModel):
    hour: int
    visitors: int
    confidence: float

class PredictionResponse(BaseModel):
    templeId: str
    date: str
    predictions: List[HourlyPrediction]
    totalPredicted: int
    peakHour: int
    peakVisitors: int

class TempleStatus(BaseModel):
    templeId: str
    currentVisitors: int
    queueLength: int
    occupancyPercent: int
    avgWaitTime: int

# Temple capacity mapping
TEMPLE_CAPACITIES = {
    "dwarka": 50000,
    "ambaji": 30000,
    "somnath": 40000
}

def generate_hourly_predictions(temple_id: str, date_str: str, festival_mode: bool = False) -> List[HourlyPrediction]:
    """
    Generate 24-hour visitor predictions using a deterministic model
    Based on:
    - Time of day (morning and evening peaks)
    - Day of week (weekends higher)
    - Festival mode multiplier
    - Temple-specific base capacity
    """
    
    base_capacity = TEMPLE_CAPACITIES.get(temple_id, 30000)
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    
    # Weekend multiplier (Saturday=5, Sunday=6)
    weekend_multiplier = 1.3 if date_obj.weekday() >= 5 else 1.0
    
    # Festival multiplier
    festival_multiplier = 2.0 if festival_mode else 1.0
    
    predictions = []
    
    for hour in range(24):
        # Base pattern: low at night, peaks at 6-8 AM and 6-8 PM
        if 5 <= hour <= 9:  # Morning peak
            base_factor = 0.6 + 0.4 * math.sin((hour - 5) * math.pi / 4)
        elif 17 <= hour <= 21:  # Evening peak
            base_factor = 0.7 + 0.3 * math.sin((hour - 17) * math.pi / 4)
        elif 10 <= hour <= 16:  # Afternoon moderate
            base_factor = 0.4 + 0.2 * math.sin((hour - 10) * math.pi / 6)
        else:  # Night/early morning low
            base_factor = 0.1 + 0.1 * random.random()
        
        # Calculate visitors with some randomness
        visitors = int(
            base_capacity * base_factor * weekend_multiplier * festival_multiplier
            * (0.8 + 0.4 * random.random())  # ±20% randomness
        )
        
        # Confidence based on time of day (higher during peak hours)
        confidence = 0.9 if 6 <= hour <= 9 or 17 <= hour <= 20 else 0.7
        
        predictions.append(HourlyPrediction(
            hour=hour,
            visitors=max(100, visitors),  # Minimum 100 visitors
            confidence=confidence
        ))
    
    return predictions

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker"""
    return {"status": "healthy", "service": "ml-prediction"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_visitors(request: PredictionRequest):
    """
    Predict 24-hour visitor inflow for a temple
    """
    try:
        if request.templeId not in TEMPLE_CAPACITIES:
            raise HTTPException(status_code=400, detail=f"Unknown temple: {request.templeId}")
        
        # Validate date format
        try:
            datetime.strptime(request.date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        predictions = generate_hourly_predictions(
            request.templeId, 
            request.date, 
            request.festivalMode
        )
        
        # Calculate summary statistics
        total_predicted = sum(p.visitors for p in predictions)
        peak_prediction = max(predictions, key=lambda x: x.visitors)
        
        return PredictionResponse(
            templeId=request.templeId,
            date=request.date,
            predictions=predictions,
            totalPredicted=total_predicted,
            peakHour=peak_prediction.hour,
            peakVisitors=peak_prediction.visitors
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/temples/{temple_id}/current-status")
async def get_current_status(temple_id: str):
    """
    Get current temple status (simulated real-time data)
    """
    if temple_id not in TEMPLE_CAPACITIES:
        raise HTTPException(status_code=404, detail="Temple not found")
    
    capacity = TEMPLE_CAPACITIES[temple_id]
    
    # Simulate current status with some randomness
    current_visitors = int(capacity * (0.5 + 0.3 * random.random()))
    queue_length = int(current_visitors * (0.02 + 0.03 * random.random()))
    occupancy_percent = int((current_visitors / capacity) * 100)
    avg_wait_time = int(queue_length * (0.03 + 0.02 * random.random()))
    
    return TempleStatus(
        templeId=temple_id,
        currentVisitors=current_visitors,
        queueLength=queue_length,
        occupancyPercent=occupancy_percent,
        avgWaitTime=avg_wait_time
    )

@app.post("/simulate/surge/{temple_id}")
async def simulate_surge(temple_id: str):
    """
    Simulate a crowd surge for testing purposes
    """
    if temple_id not in TEMPLE_CAPACITIES:
        raise HTTPException(status_code=404, detail="Temple not found")
    
    capacity = TEMPLE_CAPACITIES[temple_id]
    surge_visitors = int(capacity * 0.9)  # 90% capacity surge
    
    return {
        "templeId": temple_id,
        "surgeTriggered": True,
        "newVisitorCount": surge_visitors,
        "occupancyPercent": 90,
        "alert": "Crowd surge simulation activated"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)