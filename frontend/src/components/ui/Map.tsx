"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import styles from "./Map.module.css";

interface MapProps {
  onShapeDrawn: (shape: GeoJSON.Geometry) => void;
}

export default function Map({ onShapeDrawn }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      const drawnItems = new L.FeatureGroup();
      mapRef.current.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        draw: {
          polygon: {},
          rectangle: {},
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: { featureGroup: drawnItems },
      });
      mapRef.current.addControl(drawControl);

      mapRef.current.on(L.Draw.Event.CREATED, (event: any) => {
        drawnItems.clearLayers();
        drawnItems.addLayer(event.layer);
        const geojson = (event.layer as L.Polygon).toGeoJSON();
        onShapeDrawn(geojson.geometry);
      });
    }
  }, [onShapeDrawn]);

  return <div id="map" className={styles.map} />;
}