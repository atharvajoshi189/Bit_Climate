import json
import math
from datetime import datetime
import random

def load_city_data():
    """city_data.json se shehron ka data load karta hai."""
    try:
        with open("backend/city_data.json", "r", encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: city_data.json not found!")
        return []
    except json.JSONDecodeError:
        print("Error: city_data.json is not a valid JSON file!")
        return []

CITY_DATA = load_city_data()

def get_coords_from_city(city_name: str):
    """Shehar ke naam se uske Latitude aur Longitude nikaalta hai (local database se)."""
    # Shehar ke naam ko case-insensitive banayein aur extra space hatayein
    city_name_lower = city_name.lower().strip()
    for city_info in CITY_DATA:
        if city_info["city"].lower() == city_name_lower:
            return city_info['lat'], city_info['lon']
    
    # Agar shehar nahi milta hai, toh error dein
    raise ValueError(f"Could not find coordinates for city: '{city_name}'. Please enter a major Indian city name.")

def haversine(lat1, lon1, lat2, lon2):
    """Do coordinates ke beech ki doori (distance) calculate karta hai."""
    R = 6371  # Earth radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def load_river_data():
    """river_data.json se nadiyon ka data load karta hai."""
    try:
        with open("backend/river_data.json", "r", encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: river_data.json not found!")
        return []
    except json.JSONDecodeError:
        print("Error: river_data.json is not a valid JSON file!")
        return []

RIVER_STATIONS = load_river_data()

def get_risk_prediction_by_city(city: str):
    """Shehar ke naam ke aadhar par Flood/Drought ka risk batata hai."""
    if not RIVER_STATIONS:
        raise ValueError("River station data could not be loaded.")
    if not CITY_DATA:
        raise ValueError("City data could not be loaded.")

    # Step 1: Shehar ke naam se coordinates nikalo (local data se)
    user_lat, user_lon = get_coords_from_city(city)
    
    # Step 2: Sabse nazdeek waala river station dhoondho
    nearest_station = min(
        RIVER_STATIONS,
        key=lambda station: haversine(user_lat, user_lon, station['lat'], station['lon'])
    )

    # Step 3: Paani ka level mausam ke hisab se anumanit (simulate) karo
    current_month = datetime.now().month
    danger_level = nearest_station['danger_level']
    warning_level = nearest_station['warning_level']
    base_level = warning_level * 0.8  # Normal level ka anuman

    if 6 <= current_month <= 9:  # Monsoon season
        simulated_level = random.uniform(base_level, danger_level * 1.05)
    elif 4 <= current_month <= 5:  # Summer/Dry season
        simulated_level = random.uniform(base_level * 0.6, base_level * 0.9)
    else:  # Other months
        simulated_level = random.uniform(base_level * 0.8, warning_level * 0.95)

    simulated_level = round(simulated_level, 2)

    # Step 4: Risk ka vishleshan karo
    if simulated_level > danger_level:
        risk = "High Flood Risk"
        reason = f"The simulated water level at {nearest_station['station_name']} is {simulated_level}m, which is above the danger mark of {danger_level}m for this region during this season."
        recommendation = "Evacuate low-lying areas immediately. Follow instructions from local authorities and monitor news alerts."
    elif simulated_level > warning_level:
        risk = "Moderate Flood Risk"
        reason = f"The water level ({simulated_level}m) has crossed the warning level of {warning_level}m at {nearest_station['station_name']}. This is unusual for the season and indicates a potential flood situation."
        recommendation = "Be prepared to move to a safer location. Keep emergency kits ready and stay informed about weather updates."
    elif simulated_level < base_level * 0.7:
        risk = "Potential Drought Condition"
        reason = f"Water level ({simulated_level}m) is significantly below the normal seasonal level at {nearest_station['station_name']}. This indicates a lack of rainfall."
        recommendation = "Conserve water. Practice rainwater harvesting and use water-efficient appliances. Check for government advisories on water usage."
    else:
        risk = "Low Risk"
        reason = f"The water level at {nearest_station['station_name']} is {simulated_level}m, which is within the safe zone for this time of year."
        recommendation = "Continue to monitor water levels and use water responsibly. No immediate threat detected."

    return {
        "risk_level": risk,
        "reason": reason,
        "recommendation": recommendation,
        "station_info": {
            "name": nearest_station['station_name'],
            "current_level": simulated_level,
            "warning_level": warning_level,
            "danger_level": danger_level
        }
    }

