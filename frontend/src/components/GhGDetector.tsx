// src/components/GhGDetector.tsx

"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

// Import CSS files
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { Calendar, Search, Trash2 } from 'lucide-react';

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

// Type for the backend response, now including stats
interface GhgResult {
    mapId: string;
    token: string;
    urlTemplate: string;
    stats: {
        min: string;
        max: string;
        mean: string;
        unit: string;
    };
}

// Helper function to interpret the average pollution level
const getInterpretation = (meanAqi: number) => {
    if (meanAqi <= 30) return { level: "Low", color: "text-cyan-400", description: "Air quality is good. NO₂ pollution levels are low in this area." };
    if (meanAqi <= 60) return { level: "Moderate", color: "text-green-400", description: "Air quality is acceptable. There may be some presence of NO₂ from local sources." };
    if (meanAqi <= 90) return { level: "Elevated", color: "text-yellow-400", description: "NO₂ levels are elevated, likely due to traffic, industrial, or urban activity." };
    if (meanAqi <= 120) return { level: "High", color: "text-orange-500", description: "NO₂ levels are high. This indicates significant pollution sources in the area." };
    return { level: "Very High", color: "text-red-500", description: "NO₂ levels are very high, indicating a major pollution hotspot." };
};

// --- The Main Component ---
export default function GhGDetector() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const defaultDate = yesterday.toISOString().split('T')[0];

    const [date, setDate] = useState(defaultDate);
    const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
    const [result, setResult] = useState<GhgResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAreaSelected = (e: any) => {
        setBounds(e.layer.getBounds());
        // Clear previous results when a new area is drawn
        setResult(null);
        setError(null);
    };
    
    const handleClear = () => {
        // Simple reload to reset the map state cleanly
        window.location.reload(); 
    };

    const handleAnalyze = async () => {
        if (!bounds) {
            setError("Please draw a rectangle on the map to select an area.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        
        try {
            const boundsAsArray = [
                [bounds.getSouth(), bounds.getWest()],
                [bounds.getNorth(), bounds.getEast()]
            ];
            const response = await fetch('http://127.0.0.1:8000/air/ghg_emissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bounds: boundsAsArray, date: date }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to analyze emissions.');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const interpretation = result ? getInterpretation(parseFloat(result.stats.mean)) : null;

    return (
        <div className="bg-[#161B22]/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30">
            <h3 className="text-xl font-bold text-white mb-2">Draw an Area to Analyze NO₂ Emissions</h3>
            <p className="text-gray-400 mb-4">Use the rectangle tool on the map to select your area of interest for a 7-day average analysis.</p>

            {/* --- MAP & CONTROLS --- */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start mb-6">
                <div className="md:col-span-4 relative" style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                    <MapContainer center={[22.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <FeatureGroup>
                            <EditControl
                                position="topright"
                                onCreated={handleAreaSelected}
                                draw={{ rectangle: true, circle: false, polygon: false, polyline: false, marker: false, circlemarker: false }}
                                edit={{ edit: false, remove: false }}
                            />
                        </FeatureGroup>
                        {result && <TileLayer url={result.urlTemplate} zIndex={10} />}
                    </MapContainer>
                </div>
                <div className="md:col-span-1 flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-400 flex items-center gap-2 mb-2"><Calendar size={16} /> End Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600"
                            placeholder="Select end date"
                            title="Select end date"
                        />
                    </div>
                    <button onClick={handleAnalyze} disabled={isLoading || !bounds} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-500">
                        <Search size={20} />
                        {isLoading ? 'Analyzing...' : 'Analyze Area'}
                    </button>
                    <button onClick={handleClear} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-2">
                        <Trash2 size={20} />
                        Clear
                    </button>
                    {/* --- NEW: COLOR LEGEND --- */}
                    <div className="bg-gray-800 p-3 rounded-lg text-xs text-gray-300">
                        <h4 className="font-bold mb-2 text-center text-white">NO₂ Legend</h4>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Low</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Moderate</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> High</div>
                    </div>
                </div>
            </div>
            
            {/* --- RESULTS SECTION --- */}
            {isLoading && <p className="text-white text-center mt-4">Analyzing 7 days of satellite data... This may take a moment.</p>}
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            {result && interpretation && (
                <div className="mt-6 bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-2xl font-bold text-white text-center mb-4">Analysis Summary</h3>
                    <div className="text-center mb-6">
                        <p className="text-lg text-gray-400">Average Pollution Level</p>
                        <p className={`text-4xl font-bold ${interpretation.color}`}>{interpretation.level}</p>
                        <p className="text-gray-400 mt-2">{interpretation.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-800 p-4 rounded-lg"><p className="text-sm text-gray-400">Min Concentration</p><p className="text-2xl font-bold text-white">{result.stats.min} <span className="text-sm text-gray-400">{result.stats.unit}</span></p></div>
                        <div className="bg-gray-800 p-4 rounded-lg"><p className="text-sm text-gray-400">Average Concentration</p><p className="text-2xl font-bold text-white">{result.stats.mean} <span className="text-sm text-gray-400">{result.stats.unit}</span></p></div>
                        <div className="bg-gray-800 p-4 rounded-lg"><p className="text-sm text-gray-400">Max Concentration</p><p className="text-2xl font-bold text-white">{result.stats.max} <span className="text-sm text-gray-400">{result.stats.unit}</span></p></div>
                    </div>
                </div>
            )}
        </div>
    );
}