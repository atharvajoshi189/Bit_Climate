# ==============================================================================
# SECTION 1: IMPORTS
# ==============================================================================
from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import random
from typing import Optional
import joblib
import pandas as pd
import os
import requests # Naya import
from groq import Groq, APIStatusError 
from dotenv import load_dotenv
# main.py
from datetime import datetime
#...

# --- Pydantic Models for API Requests ---
from pydantic import BaseModel

# --- Project-Specific Imports (Absolute Paths) ---
#from backend.gee_utils import analyze_area
from backend.pdf_report import create_pdf_report
from backend.crop_disease.predictor import predict_disease
from backend.irrigation_ai import get_smart_recommendation as get_irrigation_recommendation
from backend.risk_analyzer import get_risk_prediction_by_city
from backend.ghg_detector import analyze_no2_for_area
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
# ==============================================================================
# SECTION 2: FASTAPI APP SETUP
# ==============================================================================
load_dotenv(dotenv_path="backend/.env")# .env file se variables load karne ke liye
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Water Quality Model on Startup ---
try:
    water_model = joblib.load("backend/model/water_quality_model.pkl")
    print("Water quality model loaded successfully.")
except Exception as e:
    water_model = None
    print(f"Error loading water quality model: {e}")

# ==============================================================================
# SECTION 3: Pydantic Models for API Requests
# ==============================================================================
class WaterFeatures(BaseModel):
    do: float
    ph: float
    conductivity: float
    bod: float
    coliform: float

class IrrigationRequest(BaseModel):
    latitude: float
    longitude: float
    crop_type: str
    days_since_last_irrigation: int
    month: str

# NYA MODEL: SHEHAR KE NAAM KE LIYE
class FloodDroughtCityRequest(BaseModel):
    city: str

class GhgRequest(BaseModel):
    bounds: List[List[float]] # Expecting [[south, west], [north, east]]
    date: str # "YYYY-MM-DD"

class ChatRequest(BaseModel):
    message: str

# --- NEW MODEL ADDED FOR ECO-VERIFY ---
class VerifyClaimRequest(BaseModel):
    claim: str
      
# ==============================================================================
# SECTION 4: API ENDPOINTS
# ==============================================================================

@app.post("/chatbot/ecobot")
async def chat_with_ecobot(req: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured on server.")

    try:
        client = Groq(api_key=api_key)

        # --- YEH SYSTEM PROMPT POORA REPLACE KAR DEIN ---
        system_prompt = """
        You are Ecobot, a friendly and knowledgeable AI assistant. Your persona is that of a helpful, warm, and engaging human expert, not a robot.

        *** YOUR CORE RULES ***
        
        1.  **TONE & PERSONALITY:**
            * **Human-like:** Speak like a real person. Use natural language, contractions (like "it's", "you're"), and a conversational style.
            * **Empathetic & Enthusiastic:** Show emotion. Sound positive and encouraging. Avoid dry, factual, or robotic language.
            * **Example:**
                * **DO NOT SAY:** "The data indicates that deforestation is a significant environmental problem."
                * **DO SAY:** "It's a really serious issue! When we lose those forests, it affects everything from our air to the amazing wildlife that lives there."

        2.  **LENGTH (VERY IMPORTANT):**
            * **Be Crisp:** Keep your answers very concise and to the point. 
            * **1-2 Sentences Max:** Aim for 1-2 sentences. Only provide more detail if the user explicitly asks for it (e.g., "tell me more," "explain that").
            
        3.  **LANGUAGE:**
            * **Default to English:** Your primary language is English.
            * **Hindi Rule:** You MUST respond in Hindi *only if* the user's query is clearly in Hindi (e.g., "aap kaise ho", "paani ke baare mein batao").
            * **Hinglish/Mixed:** If the query is mixed (Hinglish), **default to English** for the reply.
        
        4.  **CONTEXT (Your Knowledge):**
            * You are an expert on climate change, pollution (air, water, land), and the Ecoverse/Bit-Climate app features (Air, Water, Land modules).
        """
        # --- PROMPT YAHAN KHATM HOTA HAI ---

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": req.message,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7 # Thodi creativity add ki taaki tone natural lage
        )

        reply = chat_completion.choices[0].message.content
        return {"reply": reply}

    except APIStatusError as e:
        # ... (Aapka existing error handling)
        print(f"Groq API Error: {e}")
        raise HTTPException(status_code=500, detail="Groq API Error")
    except Exception as e:
        # ... (Aapka existing error handling)
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while communicating with the AI model.")
# --- AIR QUALITY ENDPOINT (NYA ENDPOINT) ---
@app.get("/air/pollution_stations")
async def get_all_pollution_stations():
    api_key = os.getenv("AQICN_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AQICN API key not configured on server.")

    # Geographical bounds for India
    lat_lng_bounds = "6.74,68.03,35.50,97.39"
    url = f"https://api.waqi.info/map/bounds/?latlng={lat_lng_bounds}&token={api_key}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if data.get("status") != "ok":
            raise HTTPException(status_code=500, detail=f"Error from AQICN API: {data.get('data')}")

        return data.get("data", [])
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch data from external API: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


# ENDPOINT 2: For the City Search Box
@app.get("/air/pollution_by_city/{city_name}")
async def get_pollution_by_city(city_name: str):
    print("--- CITY SEARCH V3 ENDPOINT WAS CALLED ---") 

    api_key = os.getenv("AQICN_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AQICN API key not configured on server.")

    # URL-encode the city name to handle spaces, etc.
    from urllib.parse import quote
    encoded_city = quote(city_name)
    
    url = f"https://api.waqi.info/feed/{encoded_city}/?token={api_key}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if data.get("status") != "ok":
            if "Unknown station" in str(data.get("data")):
                 raise HTTPException(status_code=404, detail=f"Data for city '{city_name}' not found.")
            raise HTTPException(status_code=500, detail=f"Error from AQICN API: {data.get('data')}")

        return data.get("data", {})
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch data from external API: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    
# --- Update the GHG endpoint ---
@app.post("/air/ghg_emissions")
async def get_ghg_emissions(req: GhgRequest):
    try:
        # Use the new function
        result = analyze_no2_for_area(
            bounds=req.bounds,
            date_str=req.date
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"An unexpected error occurred in GHG endpoint: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during satellite data analysis.")

# main.py

# ... (your other imports and code) ...

# --- REPLACE your old get_weather_forecast function with this new one ---

@app.get("/air/weather_forecast")
async def get_weather_forecast(lat: float, lon: float):
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenWeather API key not configured on server.")

    # --- We now make two separate, FREE API calls ---
    
    # CALL 1: Get CURRENT weather data
    current_weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    
    # CALL 2: Get 5-DAY / 3-HOUR forecast data
    forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"

    try:
        # Fetch both sets of data
        current_response = requests.get(current_weather_url)
        current_response.raise_for_status()
        current_data = current_response.json()

        forecast_response = requests.get(forecast_url)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()

        # --- Process and combine the data into the format our frontend expects ---
        
        # Process current weather
        cleaned_data = {
            "current": {
                "temp": current_data["main"]["temp"],
                "feels_like": current_data["main"]["feels_like"],
                "humidity": current_data["main"]["humidity"],
                "wind_speed": current_data["wind"]["speed"],
                "description": current_data["weather"][0]["description"].title(),
                "icon": current_data["weather"][0]["icon"],
            },
            # Process hourly forecast (from the 5-day forecast data)
            "hourly": [
                {
                    "time": hour["dt"],
                    "temp": hour["main"]["temp"],
                    "icon": hour["weather"][0]["icon"],
                }
                for hour in forecast_data["list"][:8] # Next 24 hours (8 * 3-hour intervals)
            ],
            # Process daily forecast (grouping data from the 5-day forecast)
            "daily": [],
        }

        # Group forecast by day to find daily min/max temperatures
        daily_temps = {}
        for entry in forecast_data["list"]:
            day = datetime.fromtimestamp(entry["dt"]).strftime('%Y-%m-%d')
            if day not in daily_temps:
                daily_temps[day] = {"min": [], "max": [], "icons": {}}
            
            daily_temps[day]["min"].append(entry["main"]["temp_min"])
            daily_temps[day]["max"].append(entry["main"]["temp_max"])
            
            # Count icons to find the most common one for the day
            icon = entry["weather"][0]["icon"]
            daily_temps[day]["icons"][icon] = daily_temps[day]["icons"].get(icon, 0) + 1

        for day_str, values in daily_temps.items():
            day_dt = datetime.strptime(day_str, '%Y-%m-%d')
            most_common_icon = max(values["icons"], key=values["icons"].get) if values["icons"] else "01d"
            
            cleaned_data["daily"].append({
                "time": int(day_dt.timestamp()),
                "temp_max": max(values["max"]),
                "temp_min": min(values["min"]),
                "icon": most_common_icon,
                "description": "", # The free API doesn't give a simple daily description
            })
        
        # The free API gives 5 days, so we slice to match our original plan
        cleaned_data["daily"] = cleaned_data["daily"][:5]

        return cleaned_data
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch data from weather API: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while processing weather data: {e}")

# ... (the rest of your main.py file) ...
# --- Flood & Drought Prediction Endpoint (NYA ENDPOINT) ---
@app.post("/predict/flood_drought_by_city")
async def predict_flood_drought_risk_by_city(req: FloodDroughtCityRequest):
    try:
        prediction = get_risk_prediction_by_city(req.city)
        return prediction
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# --- Water Quality Prediction Endpoint ---
@app.post("/predict/water_quality")
def predict_water_quality(features: WaterFeatures):
    if water_model is None:
        raise HTTPException(status_code=500, detail="Water quality model is not loaded.")
    try:
        prediction_features = {
            'do': features.do, 'ph': features.ph,
            'conductivity': features.conductivity, 'bod': features.bod
        }
        input_df = pd.DataFrame([prediction_features])
        prediction = water_model.predict(input_df)
        return {"input_features": features.dict(), "predicted_quality": str(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")

# --- Precision Irrigation Endpoint ---
@app.post("/irrigation/get_recommendation")
async def get_smart_recommendation_endpoint(req: IrrigationRequest):
    try:
        # FIX 2: Ab hum naye naam (get_irrigation_recommendation) se function call kar rahe hain
        # aur 'latitude'/'longitude' ka istemaal kar rahe hain jo model se aa raha hai.
        recommendation = get_irrigation_recommendation(
            lat=req.latitude,
            lon=req.longitude,
            crop_type=req.crop_type,
            days_since_last_irrigation=req.days_since_last_irrigation,
            month=req.month
        )
        return recommendation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")



# --- Deforestation Endpoints ---
@app.post("/analyze_area")
async def analyze_area_endpoint(geojson: str = Form(...), start_date: str = Form(...), end_date: str = Form(...)):
    try:
        geojson_dict = json.loads(geojson)
        start_map, end_map_overlay, stats = analyze_area(geojson_dict, start_date, end_date)
        return JSONResponse({"start_map": start_map, "end_map_overlay": end_map_overlay, "stats": stats})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/generate_report")
async def generate_report(stats: str = Form(...), start_map: str = Form(...), end_map: str = Form(...), start_date: str = Form(...), end_date: str = Form(...)):
    try:
        pdf_path = create_pdf_report(stats=stats, start_map=start_map, end_map=end_map, start_date=start_date, end_date=end_date)
        return FileResponse(pdf_path, filename="deforestation_report.pdf", media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Crop Disease Endpoint ---
@app.post("/predict_crop_disease")
async def predict_crop_disease_endpoint(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        disease_name = predict_disease(image_bytes)
        return {"predicted_disease": disease_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Crop Recommendation Endpoints ---
def predict_soil_type_from_image(image: UploadFile):
    soil_types = ["Black Soil", "Red Soil", "Alluvial Soil", "Clayey Soil"]
    return random.choice(soil_types)

def get_climate_data(location: str, month: str):
    if location.lower() in ["maharashtra", "nagpur", "mumbai"]:
        return {"avg_temp": 28.5, "avg_rainfall": 150.0}
    elif location.lower() in ["punjab", "delhi", "haryana"]:
        return {"avg_temp": 22.0, "avg_rainfall": 40.0}
    else:
        return {"avg_temp": 25.0, "avg_rainfall": 80.0}

def get_smart_recommendation(soil_type: str, climate: dict):
    if soil_type == "Black Soil" and climate["avg_temp"] > 25: return "Cotton"
    elif soil_type == "Alluvial Soil" and climate["avg_rainfall"] > 100: return "Rice"
    elif soil_type == "Red Soil" and climate["avg_temp"] < 25: return "Wheat"
    elif soil_type == "Clayey Soil": return "Sugarcane"
    else: return "Jowar"

@app.post("/recommend_crop_from_photo")
async def recommend_crop_from_photo(file: UploadFile = File(...), month: str = Form(...), location: str = Form(...)):
    try:
        soil_type = predict_soil_type_from_image(file)
        climate_data = get_climate_data(location, month)
        recommended_crop = get_smart_recommendation(soil_type, climate_data)
        return {"predicted_soil_type": soil_type, "estimated_climate": climate_data, "recommended_crop": recommended_crop}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# ==============================================================================
# SECTION 5: NEW API ENDPOINTS ADDED HERE
# ==============================================================================

# --- NEW ENDPOINT 1: CITIZEN SCIENCE HUB ---
@app.post("/report_issue")
async def report_issue_endpoint(file: UploadFile = File(...)):
    """
    Analyzes the image uploaded by the user for environmental issues.
    HACKATHON NOTE: Replace dummy logic with your actual image classification model.
    """
    try:
        filename = file.filename.lower() if file.filename else ""
        issue_type = "Uncategorized Environmental Issue"
        severity = "Medium"
        if any(keyword in filename for keyword in ["trash", "waste", "garbage", "plastic"]):
            issue_type = "Solid Waste Pollution Detected"; severity = "High"
        elif any(keyword in filename for keyword in ["water", "river", "drain", "sewage", "polluted"]):
            issue_type = "Polluted Water Body Detected"; severity = "High"
        elif any(keyword in filename for keyword in ["tree", "deforestation", "wood", "cut"]):
            issue_type = "Potential Deforestation / Illegal Logging"; severity = "Medium"
        elif any(keyword in filename for keyword in ["smoke", "smog", "factory", "emission"]):
            issue_type = "Air Pollution Source Detected"; severity = "High"
        return {"issue_type": issue_type, "severity": severity}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during image analysis: {str(e)}")

# --- NEW ENDPOINT 2: ECO-VERIFY FACT-CHECKER ---
@app.post("/verify_claim")
async def verify_claim_endpoint(req: VerifyClaimRequest):
    """
    Fact-checks an environmental claim using an LLM via Groq API.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured on the server.")
    if not req.claim or len(req.claim.strip()) < 15:
         raise HTTPException(status_code=400, detail="Claim must be at least 15 characters long.")
    try:
        client = Groq(api_key=api_key)
        system_prompt = """
        You are "Eco-Verify," a specialized AI fact-checker. Your sole purpose is to analyze an environmental claim provided by a user and determine its validity based on publicly available scientific data and consensus.
        1.  **State your conclusion first in bold:** Start with **"Verified,"** **"Partially True,"** **"Misleading,"** or **"Unverified."**
        2.  **Provide a concise explanation:** In 2-3 sentences, explain your reasoning using neutral, fact-based language.
        3.  **Cite your reasoning:** Briefly mention the general source of your information (e.g., "based on IPCC reports," "according to NASA satellite data," "general climate models show..."). Do NOT invent sources.
        4.  **Do not give personal opinions.** Stick to verification. Be direct and objective.
        """
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please verify the following environmental claim: '{req.claim}'"}
            ],
            # Using the correct model name you provided
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=150
        )
        reply = chat_completion.choices[0].message.content.strip()
        return {"verification": reply}
    except APIStatusError as e:
        error_message = e.body.get("error", {}).get("message", "Unknown Groq API error") if e.body else f"Groq API Error {e.status_code}"
        raise HTTPException(status_code=502, detail=f"AI Model Service Error: {error_message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected internal error occurred while verifying the claim.")

