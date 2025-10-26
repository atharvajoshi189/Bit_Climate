// src/app/land/page.tsx
"use client";

import dynamic from 'next/dynamic';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs"; // <-- IMPORT useAuth
import { useRouter } from 'next/navigation'; // <-- IMPORT useRouter
import { Trees, Sprout, ScanLine, Wheat, ArrowLeft, Upload, Aperture } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import StorySection from '@/components/StorySection';
import { landStories } from '@/lib/storiesData';
// Removed: saveActivity import (logging handled by awardPoints)
import { awardPointsClientSide } from '@/lib/awardPoints'; // <-- IMPORT HELPER

// Helper Components
const FadeInSection = ({ children }: { children: React.ReactNode }) => {
    const domRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        const { current } = domRef;
        if (current) observer.observe(current);
        return () => { if (current) observer.unobserve(current); };
    }, []);
    return <div className="fade-in-section" ref={domRef}>{children}</div>;
};

// ============================================================
// DEFORESTATION TOOL (WITH LOGIN CHECK & POINTS)
// ============================================================
const DeforestationTool = ({ onBack }: { onBack: () => void }) => {
    const { userId } = useAuth(); // <-- Get userId
    const router = useRouter(); // <-- Initialize router
    const [geometry, setGeometry] = useState<any>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const Map = useMemo(() => dynamic(() => import('@/components/LandMap'), {
        loading: () => <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">Loading Map...</div>,
        ssr: false
    }), []);

    const handleShapeDrawn = useCallback((geom: any) => { setGeometry(geom); setAnalysisResult(null); }, []);

    const handleAnalyse = async () => {
        // --- ADD LOGIN CHECK ---
        if (!userId) {
            router.push('/sign-in');
            return;
        }
        // --- END LOGIN CHECK ---

        if (!geometry || !startDate || !endDate) { alert("Please draw a shape and select both start and end dates."); return; }
        if (new Date(startDate) >= new Date(endDate)) {
             alert("Start date must be before end date.");
             return;
        }
        setLoading(true); setError(null); setAnalysisResult(null);
        try {
            const formData = new FormData();
            formData.append("geojson", JSON.stringify(geometry));
            formData.append("start_date", startDate);
            formData.append("end_date", endDate);
            const res = await fetch("http://127.0.0.1:8000/analyze_area", { method: "POST", body: formData });
            
            if (!res.ok) { 
                let errorMsg = "Analysis failed";
                try { const data = await res.json(); errorMsg = data.detail || errorMsg;} catch (_) {}
                throw new Error(errorMsg); 
            }
            const data = await res.json();
            if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }

            setAnalysisResult(data);

            // --- AWARD POINTS & LOG ON SUCCESS ---
            const activityType = "Land: Deforestation Analysis";
            const activityDetails = `Analyzed area between ${startDate} and ${endDate}.`;
            const pointsToGive = 15; 
            awardPointsClientSide(pointsToGive, activityType, activityDetails); // Handles both points and logging
            // --- END ---

        } catch (err: any) { 
            setError(err.message || "An unknown error occurred."); 
            console.error("Deforestation analysis error:", err);
        } finally { setLoading(false); }
    };

    const handleDownloadReport = async () => { /* ... */ };
    
    return (
        // --- JSX ---
        <div className="w-full max-w-7xl mx-auto animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="h-5 w-5" /> Back to Land Menu
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[80vh]">
                <div className="lg:col-span-1 bg-[#161B22] p-6 rounded-2xl border border-gray-700 flex flex-col overflow-y-auto">
                    <h3 className="text-2xl font-bold text-white mb-4">Analysis Controls</h3>
                    <div className="space-y-6 flex-grow">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                            <input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-[#C026D3] focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                            <input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-[#C026D3] focus:outline-none" />
                        </div>
                        <button onClick={handleAnalyse} disabled={loading || !geometry || !startDate || !endDate} className="w-full bg-[#C026D3] text-white font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed">
                            {loading ? "Analyzing..." : "Analyze Area"}
                        </button>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        {analysisResult && !error && (
                            <div className="space-y-4 pt-4 border-t border-gray-700">
                                <h3 className="font-semibold text-white">Visual Comparison:</h3>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {analysisResult.start_map && <img src={analysisResult.start_map} alt="Start Map" className="border border-gray-700 rounded" />}
                                    {analysisResult.end_map_overlay && <img src={analysisResult.end_map_overlay} alt="End Map" className="border border-gray-700 rounded" />}
                                </div>
                                <h3 className="font-semibold mt-4 text-white">Statistics:</h3>
                                <pre className="text-xs p-2 mt-2 bg-gray-900 rounded text-gray-300">{JSON.stringify(analysisResult.stats, null, 2)}</pre>
                                <div className="pt-4 border-t border-gray-700">
                                    <FadeInSection>
                                        <div className="text-center max-w-3xl mx-auto">
                                            <h2 className="text-2xl font-bold text-white">Visualize the Impact</h2>
                                            <p className="text-md text-gray-400 mt-2">Drag the slider to see the change.</p>
                                        </div>
                                        {analysisResult.start_map && analysisResult.end_map_overlay && (
                                            <div className="w-full max-w-5xl mx-auto rounded-lg overflow-hidden border-2 border-teal-400/50 shadow-lg shadow-teal-500/10 mt-6 aspect-video">
                                                <ReactCompareSlider
                                                    itemOne={<ReactCompareSliderImage src={analysisResult.start_map} alt="Before" />}
                                                    itemTwo={<ReactCompareSliderImage src={analysisResult.end_map_overlay} alt="After" />}
                                                />
                                            </div>
                                        )}
                                    </FadeInSection>
                                </div>
                                {/* <button onClick={handleDownloadReport} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors mt-4">Download Report</button> */}
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 h-full rounded-lg overflow-hidden">
                    <Map onShapeDrawn={handleShapeDrawn} />
                </div>
            </div>
        </div>
    );
};

// ============================================================
// CROP DISEASE TOOL (WITH LOGIN CHECK & POINTS)
// ============================================================
const CropDiseaseTool = ({ onBack }: { onBack: () => void }) => {
    const { userId } = useAuth(); // <-- Get userId
    const router = useRouter(); // <-- Initialize router
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { 
                setError('File too large (max 5MB)');
                setFile(null); setPreview(null); return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
            setResult(null); setError(null);
        }
    };

    const handlePredict = async () => {
        // --- ADD LOGIN CHECK ---
        if (!userId) {
            router.push('/sign-in');
            return;
        }
        // --- END LOGIN CHECK ---

        if (!file) return;
        setLoading(true); setError(null); setResult("Analyzing...");
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("http://127.0.0.1:8000/predict_crop_disease", { method: "POST", body: formData });
            if (!res.ok) { 
                let errorMsg = "Prediction failed";
                try { const data = await res.json(); errorMsg = data.detail || errorMsg;} catch (_) {}
                throw new Error(errorMsg); 
            }
            const data = await res.json();
            if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }

            const formattedResult = data.predicted_disease.replace(/___/g, " - ").replace(/_/g, " ");
            setResult(formattedResult);

            // --- AWARD POINTS & LOG ON SUCCESS ---
            const activityType = "Land: Crop Disease Check";
            const activityDetails = `Detected: ${formattedResult}`;
            const pointsToGive = 10;
            awardPointsClientSide(pointsToGive, activityType, activityDetails); // Handles both
            // --- END ---

        } catch (err: any) { 
            setError(err.message || "An unknown error occurred."); 
            setResult(null); 
            console.error("Crop disease error:", err); 
        } finally { setLoading(false); }
    };

    return (
        // --- JSX ---
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
             <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="h-5 w-5" /> Back to Land Menu
            </button>
            <div className="bg-[#161B22] p-8 rounded-2xl border border-gray-700 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Plant Disease Detector</h3>
                <p className="text-gray-400 mb-6">Upload a clear image of a plant leaf to get an instant AI-powered diagnosis.</p>
                <div className="w-full h-48 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center mb-6 bg-gray-900/50 relative">
                    {preview ? <img src={preview} alt="Leaf preview" className="h-full w-full object-contain rounded-lg" /> : <div className="text-center text-gray-500"><Upload className="h-10 w-10 mx-auto mb-2" /><p>Image preview will appear here</p></div>}
                </div>
                <div className="flex items-center justify-center gap-4">
                    <label htmlFor="leaf-upload" className="cursor-pointer bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">Choose File</label>
                    <input id="leaf-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button onClick={handlePredict} disabled={!file || loading} className="bg-[#C026D3] text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Analyzing..." : "Analyze Leaf"}
                    </button>
                </div>
                {error && <p className="mt-6 text-red-500">Error: {error}</p>}
                {result && !loading && !error && <p className="mt-6 text-lg text-white">Result: <span className="font-bold text-[#C026D3]">{result}</span></p>}
                {loading && <p className="mt-6 text-lg text-white">Result: <span className="font-bold text-[#C026D3]">Analyzing...</span></p>}
            </div>
        </div>
    );
};

// ============================================================
// CROP RECOMMENDATION TOOL (WITH LOGIN CHECK & POINTS)
// ============================================================
const CropRecommendationTool = ({ onBack }: { onBack: () => void }) => {
    const { userId } = useAuth(); // <-- Get userId
    const router = useRouter(); // <-- Initialize router
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [month, setMonth] = useState<string>("January"); // Default to January
    const [location, setLocation] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
             if (selectedFile.size > 5 * 1024 * 1024) { 
                setError('File too large (max 5MB)');
                setFile(null); setPreview(null); return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
            setResult(null); setError(null);
        }
    };

    const handleRecommend = async () => {
        // --- ADD LOGIN CHECK ---
        if (!userId) {
            router.push('/sign-in');
            return;
        }
        // --- END LOGIN CHECK ---

        if (!file || !month || !location) { alert("Please provide all three inputs: soil image, month, and location."); return; }
        setLoading(true); setError(null); setResult(null);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("month", month);
        formData.append("location", location);
        try {
            const res = await fetch("http://127.0.0.1:8000/recommend_crop_from_photo", { method: "POST", body: formData });
            if (!res.ok) { 
                let errorMsg = "Recommendation failed";
                try { const data = await res.json(); errorMsg = data.detail || errorMsg;} catch (_) {}
                throw new Error(errorMsg); 
            }
            const data = await res.json();
            if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }
            
            setResult(data);

            // --- AWARD POINTS & LOG ON SUCCESS ---
            const activityType = "Land: Crop Recommendation";
            const activityDetails = `Recommended: ${data.recommended_crop} for ${data.predicted_soil_type} soil in ${location}.`;
            const pointsToGive = 10;
            awardPointsClientSide(pointsToGive, activityType, activityDetails); // Handles both
            // --- END ---

        } catch (err: any) { 
            setError(err.message || "An unknown error occurred."); 
            console.error("Crop recommendation error:", err); 
        } finally { setLoading(false); }
    };

    return (
        // --- JSX ---
         <div className="w-full max-w-2xl mx-auto animate-fade-in">
             <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="h-5 w-5" /> Back to Land Menu
            </button>
            <div className="bg-[#161B22] p-8 rounded-2xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Smart Crop Recommendation</h3>
                <p className="text-gray-400 mb-6 text-center">Get crop suggestions based on your soil's picture and local climate.</p>
                <div className="space-y-6">
                    <div className="w-full h-40 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center bg-gray-900/50 relative">
                        {preview ? <img src={preview} alt="Soil preview" className="h-full w-full object-contain rounded-lg p-1" /> : <div className="text-center text-gray-500"><Aperture className="h-10 w-10 mx-auto mb-2" /><p>Upload Soil Image</p></div>}
                    </div>
                    <label htmlFor="soil-upload" className="w-full text-center block cursor-pointer bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">Choose Soil Photo</label>
                    <input id="soil-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <Select onValueChange={setMonth} defaultValue={month}>
                        <SelectTrigger className="w-full bg-gray-900 border-gray-700 rounded-md p-3 text-lg h-auto">
                            <SelectValue placeholder="Select Planting Month..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161B22] text-white border-gray-600">
                            {months.map(m => <SelectItem key={m} value={m} className="cursor-pointer hover:bg-gray-700">{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <input type="text" placeholder="Enter Your Location (e.g., Nagpur)" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-[#C026D3] focus:outline-none" />
                    <button onClick={handleRecommend} disabled={!file || !month || !location || loading} className="w-full bg-[#C026D3] text-white font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Analyzing..." : "Get Recommendation"}
                    </button>
                    {error && <p className="mt-4 text-red-500 text-center">Error: {error}</p>}
                    {result && !error && (
                        <div className="mt-4 text-center bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400">Based on our analysis of <span className="font-semibold text-gray-200">{result.predicted_soil_type}</span> soil:</p>
                            <h4 className="text-lg text-white mt-2">Recommended Crop:</h4>
                            <p className="font-bold text-3xl text-[#C026D3] capitalize mt-1">{result.recommended_crop}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================
// MAIN LAND PAGE COMPONENT (Corrected Logging Strategy)
// ============================================================
export default function LandPage() {
    const [activeTool, setActiveTool] = useState<string | null>(null);

     // --- MODIFIED: REMOVED logActivity call from here ---
     // Only change the view state when a tool is opened
    const onOpenTool = (toolName: 'deforestation' | 'plant-disease' | 'crop-recommendation') => {
        setActiveTool(toolName);
        // REMOVED: No premature logging when opening
        // try { ... saveActivity(...) ... } catch { ... }
    };
    // --- END MODIFICATION ---

    const renderContent = () => {
        // ... (keep existing switch case structure) ...
        switch (activeTool) {
            case 'deforestation': return <DeforestationTool onBack={() => setActiveTool(null)} />;
            case 'plant-disease': return <CropDiseaseTool onBack={() => setActiveTool(null)} />;
            case 'crop-recommendation': return <CropRecommendationTool onBack={() => setActiveTool(null)} />;
            default:
                return ( // Main Menu View
                    <>
                        <div className="animate-fade-in">
                            <div className="max-w-4xl mx-auto">
                                <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">Terrestrial Intelligence</h1>
                                <p className="mt-4 text-lg text-gray-300">Applying AI to understand and preserve our land, from vast forests to individual crops.</p>
                            </div>
                            <div className="mt-16 grid lg:grid-cols-2 gap-8">
                                {/* Deforestation Card */}
                                <div onClick={() => onOpenTool('deforestation')} className="cursor-pointer bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-fuchsia-500/30 card-glow-magenta flex flex-col justify-center">
                                    <div className="w-16 h-16 rounded-full bg-fuchsia-900/50 flex items-center justify-center mb-6 mx-auto"><Trees className="h-8 w-8 text-[#C026D3]"/></div>
                                    <h3 className="text-3xl font-bold text-white mb-3">Deforestation Detection</h3>
                                    <p className="text-gray-400">High-resolution satellite image analysis to monitor forest cover and detect illegal logging activities in near real-time.</p>
                                </div>
                                {/* Sustainable Agriculture Card Group */}
                                <div className="bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-fuchsia-500/30 card-glow-magenta space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-fuchsia-900/50 flex items-center justify-center mb-6 mx-auto"><Sprout className="h-8 w-8 text-[#C026D3]"/></div>
                                        <h3 className="text-3xl font-bold text-white mb-3">Sustainable Agriculture</h3>
                                        <p className="text-gray-400">AI-powered tools for modern farming, enhancing crop yield and promoting eco-friendly practices.</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-fuchsia-500/20">
                                        {/* Plant Disease Sub-Card */}
                                        <div onClick={() => onOpenTool('plant-disease')} className="p-4 rounded-lg sub-card cursor-pointer">
                                            <div className="flex items-center gap-3 mb-2"><ScanLine className="h-6 w-6 text-[#C026D3]"/><h4 className="font-bold text-white">Plant Diseases Detection</h4></div>
                                            <p className="text-sm text-gray-400">Instantly diagnose plant diseases by uploading a leaf image.</p>
                                        </div>
                                        {/* Crop Recommendation Sub-Card */}
                                        <div onClick={() => onOpenTool('crop-recommendation')} className="p-4 rounded-lg sub-card cursor-pointer">
                                            <div className="flex items-center gap-3 mb-2"><Wheat className="h-6 w-6 text-[#C026D3]"/><h4 className="font-bold text-white">Crop Recommendation</h4></div>
                                            <p className="text-sm text-gray-400">Get AI-based suggestions for the best crops based on soil and weather data.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Stories Section */}
                        <div className="mt-16">
                            <StorySection title="Inspired Action for Our Land" stories={landStories} />
                        </div>
                    </>
                );
        }
    };

    return (
        <>
            {/* Styles (Unchanged) */}
            <style>{`
                .card-glow-magenta:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(192, 38, 211, 0.5), 0 0 40px rgba(192, 38, 211, 0.4); }
                .sub-card:hover { background-color: rgba(255, 255, 255, 0.05); }
                .animate-fade-in { animation: fadeIn 0.5s ease-in-out forwards; } /* Ensure forwards */
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-section { opacity: 0; transform: translateY(10vh); transition: opacity 1s ease-out, transform 1s ease-out; }
                .fade-in-section.is-visible { opacity: 1; transform: translateY(0); }
                .map-container { height: 100%; width: 100%; }
            `}</style>
            {/* Background Video (Unchanged) */}
            <div className="fixed top-0 left-0 w-full h-full -z-10">
                <video autoPlay loop muted className="w-full h-full object-cover"><source src="/videos/land-background.mp4" type="video/mp4" /></video>
                <div className="absolute inset-0 bg-black opacity-60"></div>
            </div>
            {/* Main Content (Unchanged) */}
            <main>
                <section className="min-h-screen w-full flex items-center justify-center relative pt-20 pb-20">
                    <div className="container mx-auto px-6 text-center">
                        {renderContent()}
                    </div>
                </section>
            </main>
        </>
    );
}