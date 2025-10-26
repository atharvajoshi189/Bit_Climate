// src/app/water/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs"; // <-- IMPORT useAuth
import { useRouter } from 'next/navigation'; // <-- IMPORT useRouter
import { Waves, TestTube, Leaf, ArrowLeft, Droplet, Calendar, BarChart, Search } from "lucide-react";
import StorySection from "@/components/StorySection";
import { waterStories } from "@/lib/storiesData";
import { awardPointsClientSide } from '@/lib/awardPoints'; // <-- IMPORT HELPER
// Removed: logActivity import is no longer needed

// ============================================================
// TYPES (Unchanged)
// ============================================================
interface RiskPrediction {
  risk_level: string;
  reason: string;
  recommendation: string;
  station_info: {
    name: string;
    current_level: number;
    warning_level: number;
    danger_level: number;
  };
  detail?: any;
}

interface WaterQualityPrediction {
  predicted_quality: string;
  detail?: any;
}

interface Recommendation {
  recommendation: string;
  soil_moisture_prediction: number;
  reason: string;
  next_irrigation_in_days?: number;
  detail?: any;
}

// ============================================================
// FLOOD & DROUGHT PREDICTOR (WITH LOGIN CHECK & POINTS)
// ============================================================
const FloodDroughtPredictor = () => {
  const { userId } = useAuth(); // <-- Get userId
  const router = useRouter(); // <-- Initialize router
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>("Nagpur");

  const handleAnalyzeLocation = async () => {
    // --- ADD LOGIN CHECK ---
    if (!userId) {
        router.push('/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname));
        return;
    }
    // --- END LOGIN CHECK ---

    if (!city) {
      setError("Please enter a city name.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/predict/flood_drought_by_city`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
      if (!response.ok) {
        let errorMsg = "Failed to get prediction";
        try { const errData = await response.json(); errorMsg = errData.detail || errorMsg;} catch (_) {}
        throw new Error(errorMsg);
      }
      const data: RiskPrediction = await response.json();
      if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }
      setPrediction(data);

      // --- AWARD POINTS ---
      const pointsToGive = 10;
      const activityType = "Water: Flood & Drought Check";
      const activityDetails = `Analysis for ${city}: ${data.risk_level} (Station: ${data.station_info.name})`;
      awardPointsClientSide(pointsToGive, activityType, activityDetails); // This also handles logging
      // --- END POINTS ---

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = () => { /* ... */ if (!prediction) return "text-gray-400"; if (prediction.risk_level.includes("High Flood")) return "text-red-500"; if (prediction.risk_level.includes("Moderate Flood")) return "text-orange-400"; if (prediction.risk_level.includes("Drought")) return "text-yellow-400"; return "text-green-400"; };

  return (
    // --- JSX ---
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="text-center"> <h2 className="text-4xl font-bold text-white mb-2">Nationwide Flood & Drought Assessment</h2> <p className="text-gray-400 mb-8"> Enter a city name to analyze risks based on the nearest major river station. </p> </div>
        <div className="bg-[#161B22]/80 p-8 rounded-2xl border border-gray-700"> <div className="flex flex-col md:flex-row gap-4"> <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter your city name..." className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-400 flex-grow" id="city" aria-label="City name" /> <button onClick={handleAnalyzeLocation} disabled={isLoading || !city} className="flex items-center justify-center gap-3 py-3 px-6 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"> <Search className="h-6 w-6" /> {isLoading ? "Analyzing..." : "Analyze"} </button> </div> </div>
        {error && ( <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">{error}</div> )}
        {prediction && !error && ( <div className="mt-8 p-6 bg-[#161B22]/80 rounded-2xl border border-gray-700 text-left"> <div className="text-center mb-6"> <h3 className="text-lg text-gray-400"> Analysis for the nearest station to <span className="text-white font-bold">{city}</span>: </h3> <p className="text-2xl font-bold text-teal-400">{prediction.station_info.name}</p> </div> <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6"> <div className="bg-gray-800 p-4 rounded-lg"> <p className="text-sm text-gray-400">Current Level</p> <p className="text-2xl font-bold text-white">{prediction.station_info.current_level} m</p> </div> <div className="bg-yellow-900/50 p-4 rounded-lg"> <p className="text-sm text-yellow-300">Warning Level</p> <p className="text-2xl font-bold text-white">{prediction.station_info.warning_level} m</p> </div> <div className="bg-red-900/50 p-4 rounded-lg"> <p className="text-sm text-red-300">Danger Level</p> <p className="text-2xl font-bold text-white">{prediction.station_info.danger_level} m</p> </div> </div> <div className="border-t border-gray-700 pt-6"> <h3 className="text-lg text-center text-gray-400 mb-2">AI Risk Assessment</h3> <p className={`text-3xl text-center font-bold mb-4 ${getRiskColor()}`}>{prediction.risk_level}</p> <div className="bg-gray-800 p-4 rounded-lg"> <h4 className="font-bold text-white text-md mb-2">Reasoning:</h4> <p className="text-gray-400">{prediction.reason}</p> <h4 className="font-bold text-white text-md mt-4 mb-2">Recommendation:</h4> <p className="text-gray-400">{prediction.recommendation}</p> </div> </div> </div> )}
    </div>
  );
};

// ============================================================
// WATER QUALITY MONITOR (WITH LOGIN CHECK & POINTS)
// ============================================================
const WaterQualityMonitor = () => {
  const { userId } = useAuth(); // <-- Get userId
  const router = useRouter(); // <-- Initialize router
  const [features, setFeatures] = useState({ do: "6.5", ph: "7.2", conductivity: "1500", bod: "4.8", coliform: "80", });
  const [prediction, setPrediction] = useState<WaterQualityPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setFeatures({ ...features, [e.target.name]: e.target.value }); };

  const handlePredict = async () => {
    // --- ADD LOGIN CHECK ---
     if (!userId) {
         router.push('/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname));
         return;
     }
     // --- END LOGIN CHECK ---

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    for (const key in features) { /* ... Validation ... */ if (features[key as keyof typeof features] === '' || isNaN(parseFloat(features[key as keyof typeof features]))) { setError(`Please enter a valid number for ${key.toUpperCase()}.`); setIsLoading(false); return; } }

    try {
      const response = await fetch(`http://127.0.0.1:8000/predict/water_quality`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ do: parseFloat(features.do), ph: parseFloat(features.ph), conductivity: parseFloat(features.conductivity), bod: parseFloat(features.bod), coliform: parseFloat(features.coliform), }), });
      if (!response.ok) { let errorMsg = "Prediction failed"; try { const errData = await response.json(); errorMsg = errData.detail || errorMsg; } catch (_) {} throw new Error(errorMsg); }
      const data: WaterQualityPrediction = await response.json();
      if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }
      setPrediction(data);

      // --- AWARD POINTS ---
      const pointsToGive = 10;
      const activityType = "Water: Quality Check";
      const detailsString = Object.entries(features).map(([key, value]) => `${key.toUpperCase()}:${value}`).join(', ');
      const activityDetails = `Predicted: ${data.predicted_quality} (${detailsString})`;
      awardPointsClientSide(pointsToGive, activityType, activityDetails); // This also logs activity
      // --- END POINTS ---

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [ /* ... */ { name: "do", label: "Dissolved Oxygen (do)" }, { name: "ph", label: "pH Level (ph)" }, { name: "conductivity", label: "Conductivity (μmhos/cm)" }, { name: "bod", label: "B.O.D. (mg/l)" }, { name: "coliform", label: "Total Coliform (MPN/100ml)" }, ];

  return (
    // --- JSX ---
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
        <div className="text-center"> <h2 className="text-4xl font-bold text-white mb-2">Predict Water Quality</h2> <p className="text-gray-400 mb-8"> Enter the measured parameters of a water sample to get an instant AI-powered quality prediction. </p> </div>
        <div className="bg-[#161B22]/80 p-8 rounded-2xl border border-gray-700"> <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> {inputFields.map(({ name, label }) => ( <div key={name}> <label htmlFor={`input-${name}`} className="block text-sm font-medium text-gray-300 mb-2">{label}</label> <input type="number" step="0.01" name={name} value={features[name as keyof typeof features]} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-400" id={`input-${name}`} placeholder={label} /> </div> ))} </div> <button onClick={handlePredict} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-teal-500 text-black font-bold text-lg rounded-lg hover:bg-teal-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"> <BarChart className="h-6 w-6" /> {isLoading ? "Predicting..." : "Predict Quality"} </button> </div>
        {error && <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">{error}</div>}
        {prediction && !error && ( <div className="mt-8 p-6 bg-[#161B22]/80 rounded-2xl border border-gray-700 text-center"> <h3 className="text-lg text-gray-400">AI Prediction Result</h3> <p className={`text-4xl font-bold ${ prediction.predicted_quality.toLowerCase() === "good" ? "text-green-400" : "text-orange-400" }`} > {prediction.predicted_quality} </p> </div> )}
    </div>
  );
};

// ============================================================
// IRRIGATION ADVISOR (WITH LOGIN CHECK & POINTS)
// ============================================================
const IrrigationAdvisor = () => {
  const { userId } = useAuth(); // <-- Get userId
  const router = useRouter(); // <-- Initialize router
  const [cropType, setCropType] = useState("");
  const [daysSince, setDaysSince] = useState(3);
  const [month, setMonth] = useState("July");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendation = async () => {
     // --- ADD LOGIN CHECK ---
     if (!userId) {
         router.push('/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname));
         return;
     }
     // --- END LOGIN CHECK ---

    if (!cropType) { setError("Please enter a crop type."); return; }
    if (daysSince < 0) { setError("Days since last irrigation cannot be negative."); return; }
    setIsLoading(true); setError(null); setRecommendation(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`http://127.0.0.1:8000/irrigation/get_recommendation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ latitude, longitude, crop_type: cropType, days_since_last_irrigation: daysSince, month }), });
          if (!response.ok) { let errorMsg = "An error occurred getting recommendation"; try { const errData = await response.json(); errorMsg = errData.detail || errorMsg;} catch (_) {} throw new Error(errorMsg); }
          const data: Recommendation = await response.json();
          if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }
          setRecommendation(data);

          // --- AWARD POINTS ---
          const pointsToGive = 10;
          const activityType = "Water: Irrigation Advisor";
          const activityDetails = `Advised for ${cropType}: ${data.recommendation} (Moisture: ${data.soil_moisture_prediction.toFixed(1)}%)`;
          awardPointsClientSide(pointsToGive, activityType, activityDetails); // This also logs activity
          // --- END POINTS ---

        } catch (err: any) {
          setError(err.message || "An unknown error occurred.");
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => { /* ... Geolocation error handling ... */ console.error("Geolocation Error:", geoError); setError(`Location Error: ${geoError.message}. Please allow location access or check browser settings.`); setIsLoading(false); },
      { /* ... Geolocation options ... */ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    // --- JSX ---
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="text-center"> <h2 className="text-4xl font-bold text-white mb-2">AI Precision Irrigation Advisor</h2> <p className="text-gray-400 mb-8">Provide details about your farm to get a personalized irrigation schedule.</p> </div>
        <div className="bg-[#161B22]/80 p-8 rounded-2xl border border-gray-700"> <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"> <div> <label htmlFor="crop-type" className="block text-sm font-medium text-gray-300 mb-2"> <Leaf className="inline-block mr-2 h-4 w-4" /> Crop Type </label> <input type="text" value={cropType} onChange={(e) => setCropType(e.target.value)} placeholder="e.g., Cotton, Wheat" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-400" id="crop-type" /> </div> <div> <label htmlFor="days-since" className="block text-sm font-medium text-gray-300 mb-2"> <Droplet className="inline-block mr-2 h-4 w-4" /> Days Since Last Irrigation </label> <input type="number" value={daysSince} onChange={(e) => setDaysSince(isNaN(parseInt(e.target.value)) ? 0 : Math.max(0, parseInt(e.target.value)))} min="0" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-400" id="days-since" /> </div> <div> <label htmlFor="month" className="block text-sm font-medium text-gray-300 mb-2"> <Calendar className="inline-block mr-2 h-4 w-4" /> Current Month </label> <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-400 appearance-none pr-8 bg-no-repeat bg-right" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")` }} id="month" > {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => ( <option key={m} value={m}>{m}</option> ))} </select> </div> </div> <button onClick={handleGetRecommendation} disabled={isLoading || !cropType} className="w-full py-3 px-6 bg-teal-500 text-black font-bold rounded-lg hover:bg-teal-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"> {isLoading ? "Analyzing..." : "Get Recommendation"} </button> </div>
        {error && <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">{error}</div>}
        {recommendation && !error && ( <div className="mt-8 p-6 bg-[#161B22]/80 rounded-2xl border border-gray-700"> <div className="text-center mb-6"> <h3 className="text-lg text-gray-400">AI Recommendation</h3> <p className={`text-3xl font-bold ${recommendation.recommendation === "Irrigate Now" ? "text-red-400" : "text-green-400"}`}> {recommendation.recommendation} </p> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="p-4 bg-gray-800 rounded-lg text-center"> <p className="text-sm font-medium text-gray-400">Predicted Soil Moisture</p> <p className="text-2xl font-bold text-white">{recommendation.soil_moisture_prediction.toFixed(2)}%</p> </div> <div className="p-4 bg-gray-800 rounded-lg text-center"> <p className="text-sm font-medium text-gray-400">Reason</p> <p className="text-md font-bold text-white">{recommendation.reason}</p> </div> </div> {recommendation.recommendation === "Sufficient Moisture" && recommendation.next_irrigation_in_days != null && ( <div className="mt-4 p-4 bg-blue-900/50 rounded-lg text-center border border-blue-700"> <p className="text-md font-medium text-blue-300">Next Recommended Irrigation</p> <p className="text-2xl font-bold text-white">In approximately {recommendation.next_irrigation_in_days} days</p> </div> )} </div> )}
    </div>
  );
};

// ============================================================
// MAIN WATER PAGE (Corrected Logging Strategy & Login Check on Open)
// ============================================================
export default function WaterPage() {
  const [activeView, setActiveView] = useState<"main" | "monitoring" | "irrigation" | "prediction">("main");
  const { userId } = useAuth(); // <-- Get userId for opening check
  const router = useRouter(); // <-- Initialize router
  const handleBackClick = () => setActiveView("main");

  // --- MODIFIED: ADDED Login Check Here ---
  // Check login status BEFORE opening a tool
  const onOpenTool = (view: "monitoring" | "irrigation" | "prediction") => {
     // --- ADD LOGIN CHECK ---
     if (!userId) {
         router.push('/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname));
         return;
     }
     // --- END LOGIN CHECK ---

     // If logged in, proceed to set the view
     setActiveView(view);
     // REMOVED: No premature logging when opening
   };
   // --- END MODIFICATION ---

  return (
    <>
      {/* Background Video (Unchanged) */}
      <div className="fixed top-0 left-0 w-full h-full -z-10"> <video autoPlay loop muted className="w-full h-full object-cover"> <source src="/videos/water-background.mp4" type="video/mp4" /> Your browser does not support the video tag. </video> <div className="absolute inset-0 bg-black opacity-60"></div> </div>

      {/* Main Content */}
      <main className="min-h-screen w-full flex items-center justify-center relative pt-24 pb-20">
        <div className="container mx-auto px-6 text-center animate-fade-in">
          {activeView === "main" && (
            <div>
              {/* Header */}
              <div className="max-w-4xl mx-auto"> <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">Aquatic Intelligence</h1> <p className="mt-4 text-lg text-gray-300">AI-driven solutions for preserving our most precious resource: water.</p> </div>
              {/* Cards */}
              <div className="mt-16 grid md:grid-cols-3 gap-8">
                {/* Cards now call onOpenTool which includes login check */}
                <div onClick={() => onOpenTool("prediction")} className="card-base cursor-pointer"> <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-6 mx-auto"><Waves className="h-8 w-8 text-[#3B82F6]" /></div> <h3 className="text-2xl font-bold text-white mb-3">Flood & Drought</h3> <p className="text-gray-400">Nationwide risk analysis based on nearest river station data.</p> </div>
                <div onClick={() => onOpenTool("monitoring")} className="card-base cursor-pointer"> <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-6 mx-auto"><TestTube className="h-8 w-8 text-[#3B82F6]" /></div> <h3 className="text-2xl font-bold text-white mb-3">Water Quality</h3> <p className="text-gray-400">Predict water quality using measured sensor data.</p> </div>
                <div onClick={() => onOpenTool("irrigation")} className="card-base cursor-pointer"> <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-6 mx-auto"><Leaf className="h-8 w-8 text-[#3B82F6]" /></div> <h3 className="text-2xl font-bold text-white mb-3">Precision Irrigation</h3> <p className="text-gray-400">Optimize water usage in agriculture for maximum efficiency.</p> </div>
              </div>
              {/* Stories */}
              <div className="mt-16"> <StorySection title="Inspired Action for Water" stories={waterStories} /> </div>
            </div>
          )}
          {/* Active Tool View */}
          {activeView !== "main" && (
            <div className="w-full">
              <button onClick={handleBackClick} className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"> <ArrowLeft className="h-5 w-5" /> Back to Water Menu </button>
              {activeView === "prediction" && <FloodDroughtPredictor />}
              {activeView === "monitoring" && <WaterQualityMonitor />}
              {activeView === "irrigation" && <IrrigationAdvisor />}
            </div>
          )}
        </div>
      </main>

      {/* Styles (Unchanged) */}
      <style>{` .card-base { background-color: rgba(22, 27, 34, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 1rem; padding: 2rem; text-align: center; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; height: 100%; cursor: pointer; } .card-base:hover { transform: translateY(-8px); box-shadow: 0 0 25px rgba(59, 130, 246, 0.5); border-color: rgba(59, 130, 246, 0.6); } .animate-fade-in { animation: fadeIn 0.5s ease-in-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>
    </>
  );
}