'use client';

import { useState, useEffect } from 'react';
import { Leaf, MapPin, Sun, Calendar, AlertTriangle } from 'lucide-react';

// --- NEW: Define a type for the API response ---
interface RecommendationResponse {
  recommendation: string;
  soil_moisture_prediction: number;
  reason: string;
  next_irrigation_in_days: number | null;
}

export default function IrrigationPage() {
  // --- State for form inputs ---
  const [cropType, setCropType] = useState('Cotton');
  const [daysSince, setDaysSince] = useState(3);
  const [month, setMonth] = useState('July');

  // --- NEW: State for location, loading, error, and API response ---
  const [location, setLocation] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<RecommendationResponse | null>(null);

  // --- NEW: Function to get user's location from the browser ---
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setError(null); // Clear previous location errors
        },
        () => {
          setError('Location access was denied. Please enable it in your browser settings.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // --- Try to get location automatically on component load ---
  useEffect(() => {
    handleGetLocation();
  }, []);

  // --- Function to call the backend API ---
  const getRecommendation = async () => {
    if (location.lat == null || location.lon == null) {
      setError('Location is required. Please allow access.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      // Your backend API endpoint
      const response = await fetch('http://127.0.0.1:8000/irrigation/get_recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send all required data in the body
        body: JSON.stringify({
          crop_type: cropType,
          days_since_last_irrigation: Number(daysSince),
          month: month,
          lat: location.lat,
          lon: location.lon,
        }),
      });

      if (!response.ok) {
        // Try to get a more specific error from the backend
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An unknown error occurred on the server.');
      }

      const data: RecommendationResponse = await response.json();
      setApiResponse(data);

    } catch (err: any) {
      console.error(err);
      // Display the actual error message from the backend
      setError(err.message || 'Failed to connect to the backend. Is it running?');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <button onClick={() => window.history.back()} className="mb-6 text-teal-400 hover:text-teal-300 transition-colors">
          &larr; Back to Water Menu
        </button>

        <div className="text-center">
            <h1 className="text-4xl font-bold text-white">AI Precision Irrigation Advisor</h1>
            <p className="text-gray-400 mt-2">Provide details about your farm for a personalized irrigation schedule.</p>
        </div>

        {/* --- INPUT FORM --- */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mt-8 space-y-6">
            {/* Location Display */}
            <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                <div className="flex items-center">
                    <MapPin className="text-teal-400 mr-3" size={20} />
                    <span className="text-gray-300">
                        {location.lat != null && location.lon != null ? `Lat: ${location.lat.toFixed(4)}, Lon: ${location.lon.toFixed(4)}` : 'Location not available'}
                    </span>
                </div>
                <button onClick={handleGetLocation} className="text-xs text-teal-500 hover:underline">Refresh</button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="crop-type" className="block text-sm font-medium text-gray-400 mb-2">Crop Type</label>
                    <input id="crop-type" placeholder="e.g., Cotton" type="text" value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"/>
                </div>
                <div>
                    <label htmlFor="days-since" className="block text-sm font-medium text-gray-400 mb-2">Days Since Last Irrigation</label>
                    <input id="days-since" placeholder="e.g., 3" type="number" value={daysSince} onChange={(e) => setDaysSince(Number(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"/>
                </div>
                 <div>
                    <label htmlFor="month" className="block text-sm font-medium text-gray-400 mb-2">Current Month</label>
                    <select id="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none">
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            <button
                onClick={getRecommendation}
                disabled={isLoading || location.lat == null || location.lon == null}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : 'Get Recommendation'}
            </button>
        </div>

        {/* --- ERROR DISPLAY --- */}
        {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center">
                <AlertTriangle className="mr-3" />
                {error}
            </div>
        )}

        {/* --- RESULTS DISPLAY --- */}
        {apiResponse && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mt-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-center mb-6">AI Recommendation</h2>
                <div className="text-center p-6 rounded-lg bg-teal-900/50 border border-teal-700">
                    <p className="text-4xl font-bold text-teal-300">{apiResponse.recommendation}</p>
                    <p className="text-gray-300 mt-2">{apiResponse.reason}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-center">
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-400">Predicted Soil Moisture</p>
                        <p className="text-2xl font-bold">{apiResponse.soil_moisture_prediction.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-400">Next Ideal Irrigation</p>
                        <p className="text-2xl font-bold">
                            {apiResponse.next_irrigation_in_days ? `In ${apiResponse.next_irrigation_in_days} days` : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>
       <style jsx global>{`
            .animate-fade-in {
                animation: fadeIn 0.5s ease-out forwards;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
    </div>
  );
}
