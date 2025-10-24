import requests
import math

# ==============================================================================
# SECTION 1: EXPANDED CROP DATABASE (No Changes)
# ==============================================================================

VALID_CROPS = [
    # Anaaj (Grains)
    "wheat", "rice", "maize", "jowar", "bajra", "ragi",
    # Daalein (Pulses)
    "chickpea", "lentil", "pigeon pea", "moong bean",
    # Sabziyan (Vegetables)
    "potato", "tomato", "onion", "brinjal", "cabbage", "cauliflower", "okra", "spinach",
    # Fal (Fruits)
    "mango", "banana", "orange", "apple", "grapes", "pomegranate",
    # Nagdi Faslein (Cash Crops)
    "sugarcane", "cotton", "soybean", "groundnut", "turmeric", "mustard"
]
CROP_WATER_NEEDS = {
    "wheat": 0.9, "rice": 1.8, "maize": 1.1, "jowar": 0.7, "bajra": 0.6, "ragi": 0.8,
    "chickpea": 0.7, "lentil": 0.6, "pigeon pea": 0.8, "moong bean": 0.7,
    "potato": 1.0, "tomato": 1.1, "onion": 0.9, "brinjal": 1.2, "cabbage": 1.3, "cauliflower": 1.3, "okra": 1.0, "spinach": 0.9,
    "mango": 1.2, "banana": 1.6, "orange": 1.3, "apple": 1.1, "grapes": 1.2, "pomegranate": 1.0,
    "sugarcane": 1.5, "cotton": 1.2, "soybean": 1.1, "groundnut": 0.8, "turmeric": 1.0, "mustard": 0.7,
    "default": 1.0
}

# ==============================================================================
# SECTION 2: CORE FUNCTIONS (This code is already correct)
# ==============================================================================

def get_live_weather_data(lat, lon):
    API_KEY = "bcaee639e6c48c093e70c0552db6c020" # Replace with your actual key if needed
    URL = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    try:
        response = requests.get(URL)
        response.raise_for_status()
        data = response.json()
        return {"temperature": data["main"]["temp"], "rainfall_today": data.get("rain", {}).get("1h", 0)}
    except requests.exceptions.RequestException as e:
        print(f"Weather API Error: {e}")
        # Return a default value for testing if the API fails
        return {"temperature": 30.0, "rainfall_today": 0}

def get_smart_recommendation(lat, lon, crop_type, days_since_last_irrigation, month):
    clean_crop_type = crop_type.lower().strip()
    if clean_crop_type not in VALID_CROPS:
        raise ValueError(f"'{crop_type}' is not a recognized crop. Please enter a valid crop name.")

    weather_data = get_live_weather_data(lat, lon)
    temp = weather_data["temperature"]
    rainfall = weather_data["rainfall_today"]
    crop_factor = CROP_WATER_NEEDS.get(clean_crop_type, CROP_WATER_NEEDS["default"])

    # This is a simplified model. A real-world scenario would be more complex.
    initial_moisture = 80.0
    evaporation_loss = (temp / 10) * crop_factor * days_since_last_irrigation
    rain_gain = rainfall * 5
    predicted_moisture = max(0, min(100, initial_moisture - evaporation_loss + rain_gain))

    recommendation = ""
    reason = ""
    next_irrigation_in_days = None

    if predicted_moisture < 35:
        recommendation = "Irrigate Now"
        reason = f"Soil is very dry ({predicted_moisture:.1f}%) for {crop_type.title()}."
    elif predicted_moisture < 50:
        recommendation = "Consider Irrigating Soon"
        reason = f"Soil moisture is getting low ({predicted_moisture:.1f}%) for {crop_type.title()}."
    else:
        recommendation = "Sufficient Moisture"
        reason = f"Soil has enough moisture ({predicted_moisture:.1f}%) for {crop_type.title()}."
        # Estimate when the next irrigation might be needed
        daily_moisture_loss = (temp / 10) * crop_factor
        if daily_moisture_loss > 0:
            moisture_surplus = predicted_moisture - 50 # Target a 50% threshold
            days_to_next_irrigation = moisture_surplus / daily_moisture_loss
            next_irrigation_in_days = math.ceil(days_to_next_irrigation)

    return {
        "recommendation": recommendation,
        "soil_moisture_prediction": predicted_moisture,
        "reason": reason,
        "next_irrigation_in_days": next_irrigation_in_days
    }
