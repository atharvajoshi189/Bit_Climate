# backend/gee_utils.py

import ee
import os
import sys # For better error output
from google.oauth2 import service_account
from google.auth import exceptions as google_auth_exceptions
from datetime import datetime, timedelta

# --- Earth Engine Initialization (Robust Version) ---
try:
    GCP_PROJECT_ID = 'psychic-rush-470109-r9' # Your Google Cloud Project ID
    CREDENTIALS_ENV_VAR = 'GOOGLE_APPLICATION_CREDENTIALS' # Env var Render sets
    
    credentials_path_on_server = os.getenv(CREDENTIALS_ENV_VAR)

    # --- Server/Render Path ---
    if credentials_path_on_server:
        print(f"INFO: Found {CREDENTIALS_ENV_VAR}. Initializing Earth Engine in Server Mode.")
        print(f"DEBUG: Credentials path from env var: '{credentials_path_on_server}'")

        if not os.path.exists(credentials_path_on_server):
            print(f"ERROR: Service account key file NOT found at the specified path: '{credentials_path_on_server}'")
            # Attempt to list directory for debugging (might fail due to permissions)
            try:
                secrets_dir = os.path.dirname(credentials_path_on_server)
                print(f"DEBUG: Listing contents of directory '{secrets_dir}': {os.listdir(secrets_dir)}")
            except Exception as list_e:
                print(f"DEBUG: Could not list contents of '{secrets_dir}': {list_e}")
            raise FileNotFoundError(f"Service account key file not found at: {credentials_path_on_server}")

        try:
            print(f"INFO: Loading credentials from: {credentials_path_on_server}")
            # Explicitly load credentials using google-auth library
            credentials = service_account.Credentials.from_service_account_file(
                credentials_path_on_server,
                # Define necessary scopes for your EE operations
                scopes=[
                    'https://www.googleapis.com/auth/earthengine',
                    'https://www.googleapis.com/auth/cloud-platform'
                ]
            )
            print("INFO: Credentials loaded successfully.")

            print("INFO: Initializing Earth Engine with loaded credentials and project ID...")
            # Initialize using the loaded credential OBJECT and project ID
            # opt_url might be needed for high volume requests with service accounts
            ee.Initialize(credentials=credentials, project=GCP_PROJECT_ID, opt_url='https://earthengine-highvolume.googleapis.com')
            print("INFO: Earth Engine Initialized Successfully (Server Mode).")

        except Exception as init_e:
            print(f"ERROR: Failed to initialize Earth Engine using service account credentials: {init_e}", file=sys.stderr)
            raise init_e # Re-raise the exception after logging

    # --- Local Development Path ---
    else:
        print(f"INFO: {CREDENTIALS_ENV_VAR} not found. Attempting initialization in Local Mode.")
        try:
            # First, try initializing directly. Works if gcloud default login is set.
            print("INFO: Attempting ee.Initialize() with project ID...")
            ee.Initialize(project=GCP_PROJECT_ID)
            print("INFO: Earth Engine Initialized Successfully (Local Mode - Default Credentials).")
        except (ee.EEException, google_auth_exceptions.DefaultCredentialsError, Exception) as e1:
            # Catch a broader range of potential default init errors
            print(f"WARN: Default initialization failed ({type(e1).__name__}: {e1}). Falling back to ee.Authenticate() flow.")
            try:
                # If default fails, try the interactive authentication flow
                print("INFO: Attempting ee.Authenticate()...")
                ee.Authenticate(project_id=GCP_PROJECT_ID) # Authenticate first
                print("INFO: ee.Authenticate() completed. Attempting ee.Initialize() again...")
                ee.Initialize(project=GCP_PROJECT_ID) # Initialize after authentication
                print("INFO: Earth Engine Initialized Successfully (Local Mode - Authenticate Flow).")
            except Exception as e2:
                print(f"ERROR: Interactive authentication/initialization also failed: {e2}", file=sys.stderr)
                raise e2 # Re-raise the exception after logging

except Exception as final_e:
    # Catch any unexpected error during the entire process
    print(f"CRITICAL ERROR: Failed during Earth Engine setup phase: {final_e}", file=sys.stderr)
    # Raising here might stop the server from starting if EE is critical
    raise final_e
# --- END Earth Engine Initialization ---


# --- YOUR EXISTING analyze_area FUNCTION ---
# (Ensure this function definition is AFTER the initialization block)
def analyze_area(geojson, start_date_str, end_date_str):
    """
    Analyzes deforestation in a given GeoJSON area between two dates.
    Returns start map URL, end map URL with overlay, and statistics.
    """
    print(f"INFO: Analyzing area for dates: {start_date_str} to {end_date_str}")
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
        print(f"DEBUG: Found {start_size} images for start period, {end_size} images for end period.")
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
        # Convert sq meters to hectares, use .get(key, 0) for safety, round
        deforested_hectares = round(ee.Number(deforested_stats.get('NDVI', 0)).divide(10000).getInfo(), 2)

        # Calculate initial forest area
        initial_forest_area_image = initial_forest.updateMask(initial_forest).multiply(pixel_area) # Mask to count only forest pixels
        initial_stats = initial_forest_area_image.reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=region,
            scale=30,
            maxPixels=1e9
        )
        initial_forest_hectares = round(ee.Number(initial_stats.get('NDVI', 0)).divide(10000).getInfo(), 2)

        # Calculate percentage loss, ensure initial_forest_hectares is not None or 0
        percentage_loss = 0
        if initial_forest_hectares is not None and initial_forest_hectares > 0:
             deforested_hectares_safe = deforested_hectares if deforested_hectares is not None else 0
             percentage_loss = round((deforested_hectares_safe / initial_forest_hectares) * 100, 2)
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
        end_map_with_overlay_image = ee.Image().blend(after_image_visualized).blend(deforestation_mask_visualized)
        end_map_with_overlay_url = end_map_with_overlay_image.getThumbURL(thumb_params)
        # --- End Thumbnail Generation ---

        # Structure the final statistics result, handle potential None values
        final_stats = {
            "Initial Forest Area (ha)": initial_forest_hectares if initial_forest_hectares is not None else 0,
            "Deforested Area (ha)": deforested_hectares if deforested_hectares is not None else 0,
            "Percentage Loss (%)": percentage_loss if percentage_loss is not None else 0
        }
        print("INFO: Analysis Stats:", final_stats) # Log the calculated stats

        return start_map_url, end_map_with_overlay_url, final_stats

    except ee.EEException as e: # Catch EE specific errors first
        error_message = f"Earth Engine specific error during analysis: {e}"
        print(f"ERROR: {error_message}", file=sys.stderr)
        # Provide a more user-friendly message if possible
        raise ValueError("Earth Engine analysis failed. This might be due to the selected area size, date range, or temporary EE issues. Please try again or adjust parameters.")
    except ValueError as e: # Catch specific ValueErrors (like bad dates or no imagery)
        error_message = f"Value error during analysis: {e}"
        print(f"WARN: {error_message}", file=sys.stderr)
        raise e # Re-raise the specific ValueError
    except Exception as e: # Catch any other unexpected errors
        error_message = f"Unexpected error during Earth Engine analysis: {e}"
        print(f"ERROR: {error_message}", file=sys.stderr)
        raise ValueError(f"Analysis failed unexpectedly: {e}") # Raise a standard error type

# --- Add any other utility functions you have in this file ---