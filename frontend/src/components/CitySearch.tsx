// src/components/CitySearch.tsx

"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';

// Type definitions for the API response
interface CityAqiData {
  aqi: number;
  city: { name: string; };
  dominentpol: string;
  iaqi: {
    pm25?: { v: number };
    pm10?: { v: number };
    o3?: { v: number };
    no2?: { v: number };
    so2?: { v: number };
    co?: { v: number };
  };
  time: { s: string; };
}

const getAqiInfo = (aqi: number) => {
  if (aqi <= 50) return { level: "Good", color: "bg-green-500", advice: "Air quality is considered satisfactory, and air pollution poses little or no risk." };
  if (aqi <= 100) return { level: "Moderate", color: "bg-yellow-500", advice: "Some pollutants may be a moderate health concern for a very small number of people." };
  if (aqi <= 150) return { level: "Unhealthy for Sensitive Groups", color: "bg-orange-500", advice: "Members of sensitive groups may experience health effects. The general public is not likely to be affected." };
  if (aqi <= 200) return { level: "Unhealthy", color: "bg-red-500", advice: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects." };
  if (aqi <= 300) return { level: "Very Unhealthy", color: "bg-purple-700", advice: "Health alert: everyone may experience more serious health effects." };
  return { level: "Hazardous", color: "bg-red-900", advice: "Health warnings of emergency conditions. The entire population is more likely to be affected." };
};

export default function CitySearch() {
  const [city, setCity] = useState('');
  const [data, setData] = useState<CityAqiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setData(null);
    setError(null);

    try {
      // NOTE: We are calling the FastAPI backend here!
      const response = await fetch(`http://127.0.0.1:8000/air/pollution_by_city/${city}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'City not found or error fetching data.');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#161B22]/70 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30 mb-8">
      <h3 className="text-2xl font-bold text-white mb-4 text-center">Search Air Quality by City</h3>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g., Mumbai, Delhi, Nagpur..."
          className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-500">
          <Search size={20} />
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      {data && (
        <div className="mt-6 text-white text-left">
          <h4 className="text-3xl font-bold text-center mb-4">{data.city.name}</h4>
          <div className={`p-4 rounded-lg text-center ${getAqiInfo(data.aqi).color}`}>
            <p className="text-lg font-semibold">AQI: <span className="text-4xl font-bold">{data.aqi}</span></p>
            <p className="text-2xl font-bold mt-1">{getAqiInfo(data.aqi).level}</p>
          </div>
          <p className="text-gray-300 mt-4 text-center text-sm">{getAqiInfo(data.aqi).advice}</p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {data.iaqi.pm25 && <div className="bg-gray-800 p-3 rounded-lg"><p className="text-gray-400">PM2.5</p><p className="font-bold text-lg">{data.iaqi.pm25.v}</p></div>}
            {data.iaqi.pm10 && <div className="bg-gray-800 p-3 rounded-lg"><p className="text-gray-400">PM10</p><p className="font-bold text-lg">{data.iaqi.pm10.v}</p></div>}
            {data.iaqi.o3 && <div className="bg-gray-800 p-3 rounded-lg"><p className="text-gray-400">Ozone (O₃)</p><p className="font-bold text-lg">{data.iaqi.o3.v}</p></div>}
            {data.iaqi.no2 && <div className="bg-gray-800 p-3 rounded-lg"><p className="text-gray-400">NO₂</p><p className="font-bold text-lg">{data.iaqi.no2.v}</p></div>}
            {data.iaqi.so2 && <div className="bg-gray-800 p-3 rounded-lg"><p className="text-gray-400">SO₂</p><p className="font-bold text-lg">{data.iaqi.so2.v}</p></div>}
            {data.iaqi.co && <div className="bg-gray-800 p-3 rounded-lg"><p className="text-gray-400">CO</p><p className="font-bold text-lg">{data.iaqi.co.v}</p></div>}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">Last updated: {new Date(data.time.s).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}