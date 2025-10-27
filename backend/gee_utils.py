# backend/gee_utils.py

import ee
import os # Import os to check environment variables
from google.auth import exceptions as google_auth_exceptions # To catch credential errors specifically
from datetime import datetime, timedelta

# --- CORRECTED CONDITIONAL EARTH ENGINE INITIALIZATION ---
# --- FINAL CORRECTED CONDITIONAL EARTH ENGINE INITIALIZATION ---
try:
    GCP_PROJECT_ID = 'psychic-rush-470109-r9' # Store your Project ID
    CREDENTIALS_PATH_ENV_VAR = 'GOOGLE_APPLICATION_CREDENTIALS'

    # Check if running on server (Render)
    if os.getenv(CREDENTIALS_PATH_ENV_VAR):
        print(f"Found {CREDENTIALS_PATH_ENV_VAR}. Initializing Earth Engine with service account...")
        credentials_path = os.getenv(CREDENTIALS_PATH_ENV_VAR)

        # Check if the credentials file actually exists at the path
        if not os.path.exists(credentials_path):
            raise FileNotFoundError(f"Service account key file not found at: {credentials_path}")

        print(f"Loading credentials from: {credentials_path}")
        # Load credentials manually from the JSON file
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path, 
            scopes=['https://www.googleapis.com/auth/earthengine.readonly'] # Add necessary scopes
        )

        print("Credentials loaded. Initializing Earth Engine...")
        # Initialize with the credential OBJECT and project ID
        ee.Initialize(credentials=credentials, project=GCP_PROJECT_ID) 
        print("Earth Engine Initialized Successfully (Server Mode).")

    else:
        # Assume local development
        print(f"{CREDENTIALS_PATH_ENV_VAR} not found. Attempting default initialization (Local Mode)...")
        try:
            # Try initializing directly (uses gcloud default login or local service account file if GOOGLE_APPLICATION_CREDENTIALS is set locally outside Render)
            # Pass project ID here too for consistency
            ee.Initialize(project=GCP_PROJECT_ID) 
            print("Earth Engine Initialized Successfully (Local Mode - Default Credentials).")
        except (ee.EEException, google_auth_exceptions.DefaultCredentialsError) as e:
            print(f"Default initialization failed ({type(e).__name__}). Falling back to ee.Authenticate() for interactive login...")
            ee.Authenticate(project_id=GCP_PROJECT_ID) # Pass project ID to Authenticate as well
            ee.Initialize(project=GCP_PROJECT_ID)   # Initialize after authentication
            print("Earth Engine Initialized Successfully (Local Mode - Authenticate Flow).")

except Exception as final_e:
    print(f"CRITICAL ERROR: Failed to initialize Earth Engine: {final_e}")
    raise final_e
# --- YOUR EXISTING analyze_area FUNCTION ---
def analyze_area(geojson, start_date_str, end_date_str):
    """
    Analyzes deforestation in a given GeoJSON area between two dates.
    Returns start map URL, end map URL with overlay, and statistics.
    """
    print(f"Analyzing area for dates: {start_date_str} to {end_date_str}")
    try:
        region = ee.Geometry(geojson) # Convert GeoJSON dict/string to ee.Geometry
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')

        # Define date ranges (e.g., 90 days before each date for clearer imagery)
        start_range_begin = (start_date - timedelta(days=90)).strftime('%Y-%m-%d')
        end_range_begin = (end_date - timedelta(days=90)).strftime('%Y-%m-%d')

        # Using Landsat 8 Surface Reflectance collection
        LANDSAT_COLLECTION = "LANDSAT/LC08/C02/T1_L2"

        # Function to mask clouds, scale, and select bands
        def maskL8sr(image):
            # Bits 3 (cloud) and 4 (cloud shadow) are mask bits.
            cloudShadowBitMask = 1 << 4
            cloudsBitMask = 1 << 3
            qa = image.select('QA_PIXEL')
            # Both flags should be set to zero, indicating clear conditions.
            mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0).And(qa.bitwiseAnd(cloudsBitMask).eq(0))
            # Apply scaling factors and select spectral bands.
            return image.updateMask(mask).multiply(0.0000275).add(-0.2)\
                .select("SR_B.*")\
                .copyProperties(image, ["system:time_start"])

        # Filter collections and apply mask
        start_collection = ee.ImageCollection(LANDSAT_COLLECTION)\
            .filterBounds(region)\
            .filterDate(start_range_begin, start_date_str)\
            .map(maskL8sr)

        end_collection = ee.ImageCollection(LANDSAT_COLLECTION)\
            .filterBounds(region)\
            .filterDate(end_range_begin, end_date_str)\
            .map(maskL8sr)

        # Check if collections are empty after filtering
        start_size = start_collection.size().getInfo()
        end_size = end_collection.size().getInfo()
        print(f"Found {start_size} images for start period, {end_size} images for end period.")
        if start_size == 0 or end_size == 0:
            raise ValueError("No cloud-free satellite imagery found for the selected date range(s). Please try different dates or a larger area.")

        # Create median composite images
        start_image = start_collection.median()
        end_image = end_collection.median()

        # Function to calculate NDVI
        def get_ndvi(img):
            # Landsat 8 uses B5 (NIR) and B4 (Red)
            return img.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')

        # Calculate NDVI for both images
        start_ndvi = get_ndvi(start_image)
        end_ndvi = get_ndvi(end_image)

        # Identify potential deforestation: NDVI decrease > threshold (e.g., 0.25)
        # and where it was initially forest (e.g., start NDVI >= 0.4)
        initial_forest = start_ndvi.gte(0.4) # Mask for initial forest
        deforestation = start_ndvi.subtract(end_ndvi).gt(0.25).And(initial_forest).selfMask()

        # Image representing area of each pixel in square meters
        pixel_area = ee.Image.pixelArea()

        # --- Calculate Areas ---
        # Calculate deforested area
        deforested_area_image = deforestation.multiply(pixel_area)
        deforested_stats = deforested_area_image.reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=region,
            scale=30, # Landsat scale
            maxPixels=1e9
        )
        # Convert sq meters to hectares, getInfo() retrieves the value, round it
        deforested_hectares = round(ee.Number(deforested_stats.get('NDVI')).divide(10000).getInfo(), 2)

        # Calculate initial forest area
        initial_forest_area_image = initial_forest.updateMask(initial_forest).multiply(pixel_area) # Mask to count only forest pixels
        initial_stats = initial_forest_area_image.reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=region,
            scale=30,
            maxPixels=1e9
        )
        initial_forest_hectares = round(ee.Number(initial_stats.get('NDVI')).divide(10000).getInfo(), 2)

        # Calculate percentage loss
        percentage_loss = 0
        if initial_forest_hectares > 0: # Avoid division by zero
            percentage_loss = round((deforested_hectares / initial_forest_hectares) * 100, 2)
        # --- End Area Calculation ---

        # --- Generate Thumbnail URLs ---
        # Get bounds for thumbnail region
        region_info = region.bounds(maxError=1).getInfo()['coordinates'] # Use bounds() for efficiency
        thumb_params = {'dimensions': 512, 'region': region_info, 'format': 'png'}

        # Define visualization parameters
        true_color_vis = {'bands': ['SR_B4', 'SR_B3', 'SR_B2'], 'min': 0, 'max': 0.3} # Adjusted max for SR
        deforestation_vis = {'palette': 'FF0000', 'opacity': 0.6} # Slightly more opaque red

        # Generate URLs
        start_map_url = start_image.visualize(**true_color_vis).getThumbURL(thumb_params)

        # Create the 'after' image with deforestation overlay blended on top
        after_image_visualized = end_image.visualize(**true_color_vis)
        deforestation_mask_visualized = deforestation.visualize(**deforestation_vis)
        # Blend the deforestation mask onto the 'after' image
        end_map_with_overlay_image = ee.Image().blend(after_image_visualized).blend(deforestation_mask_visualized)
        end_map_with_overlay_url = end_map_with_overlay_image.getThumbURL(thumb_params)
        # --- End Thumbnail Generation ---

        # Structure the final statistics result
        final_stats = {
            "Initial Forest Area (ha)": initial_forest_hectares if initial_forest_hectares is not None else 0, # Handle potential None
            "Deforested Area (ha)": deforested_hectares if deforested_hectares is not None else 0, # Handle potential None
            "Percentage Loss (%)": percentage_loss if percentage_loss is not None else 0 # Handle potential None
        }
        print("Analysis Stats:", final_stats) # Log the calculated stats

        return start_map_url, end_map_with_overlay_url, final_stats

    except Exception as e:
        print(f"Error during Earth Engine analysis in analyze_area: {e}")
        # Re-raise or return an error structure suitable for your FastAPI response
        # It's often better to raise a specific error type if possible
        raise ValueError(f"Earth Engine analysis failed: {e}")

# --- Add any other utility functions you have in this file ---