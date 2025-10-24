// src/components/IndiaPollutionMap.tsx

"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet's CSS - VERY IMPORTANT
import 'leaflet/dist/leaflet.css';

// Type for our station data
interface Station {
  lat: number;
  lon: number;
  uid: number;
  aqi: string; // AQI is a string, can be "-"
  station: {
    name: string;
    time: string;
  };
}

// Function to determine marker color based on AQI
const getMarkerColor = (aqiValue: number): string => {
  if (aqiValue <= 50) return '#55A84F'; // Good (Green)
  if (aqiValue <= 100) return '#A3C853'; // Moderate (Light Green)
  if (aqiValue <= 150) return '#FFF833'; // Unhealthy for Sensitive (Yellow)
  if (aqiValue <= 200) return '#F29C33'; // Unhealthy (Orange)
  if (aqiValue <= 300) return '#E93F33'; // Very Unhealthy (Red)
  return '#AF2D24'; // Hazardous (Dark Red)
};

// Custom icon function
const createCustomIcon = (aqi: number) => {
  const color = getMarkerColor(aqi);
  const iconHtml = `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">${aqi}</div>`;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

export default function IndiaPollutionMap() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pollution-stations')
      .then(res => res.json())
      .then(data => {
        // Filter out stations with no valid AQI data
        const validStations = data.filter((s: Station) => s.aqi !== '-' && !isNaN(Number(s.aqi)));
        setStations(validStations);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch stations:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading pollution map of India...</p>;
  }

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stations.map(station => {
        const aqiValue = parseInt(station.aqi, 10);
        return (
          <Marker
            key={station.uid}
            position={[station.lat, station.lon]}
            icon={createCustomIcon(aqiValue)}
          >
            <Popup>
              <b>{station.station.name}</b>
              <br />
              AQI: <b>{station.aqi}</b>
              <br />
              Last updated: {new Date(station.station.time).toLocaleString()}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}