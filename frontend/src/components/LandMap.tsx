// src/components/LandMap.tsx

'use client'; // <-- Bahut zaroori hai

import { useEffect, useRef } from 'react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

// Props interface ko bhi yahan le aayein
interface MapProps {
  onShapeDrawn: (shape: any) => void;
}

// Ye aapka original Map component hai
const LandMap = ({ onShapeDrawn }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Yahan 'typeof window' check ki zaroorat nahi hai,
    // kyunki 'use client' aur dynamic import yeh solve kar dete hain.
    
    if (!mapRef.current) {
      mapRef.current = L.map("map-container").setView([20.5937, 78.9629], 5);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
      
      const drawnItems = new L.FeatureGroup();
      mapRef.current.addLayer(drawnItems);
      
      const drawControl = new L.Control.Draw({
        draw: { polygon: {}, rectangle: {}, polyline: false, circle: false, marker: false, circlemarker: false },
        edit: { featureGroup: drawnItems },
      });
      
      mapRef.current.addControl(drawControl);
      
      mapRef.current.on((L.Draw.Event as any).CREATED, (event: any) => {
        drawnItems.clearLayers();
        const layer = event.layer;
        drawnItems.addLayer(layer);
        const geojson = layer.toGeoJSON();
        onShapeDrawn(geojson.geometry);
      });
    }
  }, [onShapeDrawn]); // Dependency array ko khali rakhein ya onShapeDrawn daalein

  return <div id="map-container" className="map-container" />;
};

export default LandMap;