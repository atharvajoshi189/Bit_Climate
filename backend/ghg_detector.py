# backend/ghg_detector.py

import ee
from datetime import datetime, timedelta

try:
    ee.Initialize()
    print("Google Earth Engine initialized successfully.")
except Exception as e:
    print(f"Error initializing Google Earth Engine: {e}")

# backend/ghg_detector.py

def analyze_no2_for_area(bounds: list, date_str: str):
    """
    Analyzes the 7-day average NO2 concentration and calculates statistics.
    Returns GEE map layer credentials and a stats object.
    """
    try:
        west, south = bounds[0][1], bounds[0][0]
        east, north = bounds[1][1], bounds[1][0]
        area_of_interest = ee.Geometry.Rectangle([west, south, east, north])

        end_date = datetime.strptime(date_str, '%Y-%m-%d')
        start_date = end_date - timedelta(days=7)

        no2_image = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_NO2') \
            .select('tropospheric_NO2_column_number_density') \
            .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
            .filterBounds(area_of_interest) \
            .mean().clip(area_of_interest)

        if not no2_image.bandNames().size().getInfo():
             raise ValueError(f"No satellite data found for the week ending on {date_str}.")

        viz_params = {
            'min': 0,
            'max': 0.0002,
            'palette': ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
        }

        gee_map = no2_image.getMapId(viz_params)

        # NEW: Calculate statistics (min, max, mean) for the area
        stats = no2_image.reduceRegion(
            reducer=ee.Reducer.minMax().combine(ee.Reducer.mean(), '', True),
            geometry=area_of_interest,
            scale=1000, # Resolution in meters
            maxPixels=1e9
        ).getInfo()
        
        # Extract and clean the stats data
        band_name = 'tropospheric_NO2_column_number_density'
        min_val = stats.get(f'{band_name}_min', 0) or 0
        max_val = stats.get(f'{band_name}_max', 0) or 0
        mean_val = stats.get(f'{band_name}_mean', 0) or 0
        
        # Convert to a more readable unit (micromoles per square meter)
        conversion_factor = 1e6
        
        clean_stats = {
            "min": f"{min_val * conversion_factor:.2f}",
            "max": f"{max_val * conversion_factor:.2f}",
            "mean": f"{mean_val * conversion_factor:.2f}",
            "unit": "μmol/m²"
        }

        return {
            "mapId": gee_map['mapid'],
            "token": gee_map['token'],
            "urlTemplate": gee_map['tile_fetcher'].url_format,
            "stats": clean_stats # Return the new stats object
        }

    except Exception as e:
        raise e