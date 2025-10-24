import ee
from datetime import datetime, timedelta

try:
    ee.Initialize()
except Exception:
    ee.Authenticate()
    ee.Initialize()

def analyze_area(geojson, start_date_str, end_date_str):
    region = ee.Geometry(geojson)
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    start_range_begin = (start_date - timedelta(days=90)).strftime('%Y-%m-%d')
    end_range_begin = (end_date - timedelta(days=90)).strftime('%Y-%m-%d')

    LANDSAT_COLLECTION = "LANDSAT/LC08/C02/T1_L2"

    def maskL8sr(image):
        cloudShadowBitMask = 1 << 4
        cloudsBitMask = 1 << 3
        qa = image.select('QA_PIXEL')
        mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0).And(qa.bitwiseAnd(cloudsBitMask).eq(0))
        return image.updateMask(mask).multiply(0.0000275).add(-0.2).select("SR_B.*").copyProperties(image, ["system:time_start"])

    start_collection = ee.ImageCollection(LANDSAT_COLLECTION).filterBounds(region).filterDate(start_range_begin, start_date_str).map(maskL8sr)
    end_collection = ee.ImageCollection(LANDSAT_COLLECTION).filterBounds(region).filterDate(end_range_begin, end_date_str).map(maskL8sr)

    if start_collection.size().getInfo() == 0 or end_collection.size().getInfo() == 0:
        raise Exception("No cloud-free satellite imagery found for the selected date range(s). Please try different dates or a larger area.")
    
    start_image = start_collection.median()
    end_image = end_collection.median()

    def get_ndvi(img):
        return img.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')

    start_ndvi = get_ndvi(start_image)
    end_ndvi = get_ndvi(end_image)
    
    deforestation = start_ndvi.subtract(end_ndvi).gt(0.25).selfMask()
    initial_forest = start_ndvi.gte(0.4) # Mask for initial forest
    
    pixel_area = ee.Image.pixelArea()
    
    # Calculate deforested area
    deforested_area_image = deforestation.multiply(pixel_area)
    deforested_stats = deforested_area_image.reduceRegion(reducer=ee.Reducer.sum(), geometry=region, scale=30, maxPixels=1e9)
    deforested_hectares = round(ee.Number(deforested_stats.get('NDVI')).divide(10000).getInfo(), 2)
    
    # NEW: Calculate initial forest area
    initial_forest_area_image = initial_forest.multiply(pixel_area)
    initial_stats = initial_forest_area_image.reduceRegion(reducer=ee.Reducer.sum(), geometry=region, scale=30, maxPixels=1e9)
    initial_forest_hectares = round(ee.Number(initial_stats.get('NDVI')).divide(10000).getInfo(), 2)
    
    # NEW: Calculate percentage loss
    percentage_loss = 0
    if initial_forest_hectares > 0:
        percentage_loss = round((deforested_hectares / initial_forest_hectares) * 100, 2)
    
    region_info = region.bounds().getInfo()['coordinates']
    thumb_params = {'dimensions': 512, 'region': region_info, 'format': 'png'}
    true_color_vis = {'bands': ['SR_B4', 'SR_B3', 'SR_B2'], 'min': 0, 'max': 0.3}
    deforestation_vis = {'palette': 'FF0000', 'opacity': 0.5}
    
    start_map_url = start_image.visualize(**true_color_vis).getThumbURL(thumb_params)
    after_image_visualized = end_image.visualize(**true_color_vis)
    deforestation_mask_visualized = deforestation.visualize(**deforestation_vis)
    end_map_with_overlay_url = ee.Image().blend(after_image_visualized).blend(deforestation_mask_visualized).getThumbURL(thumb_params)
    
    # NEW: Add all stats to the final result
    final_stats = {
        "Initial Forest (ha)": initial_forest_hectares,
        "Deforested Area (ha)": deforested_hectares,
        "Percentage Loss (%)": percentage_loss
    }
    
    return start_map_url, end_map_with_overlay_url, final_stats