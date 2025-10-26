// src/app/air/page.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from "@clerk/nextjs"; // <-- 1. IMPORT useAuth
import { useRouter } from 'next/navigation'; // <-- 2. IMPORT useRouter
import { Factory, Cloudy, ThermometerSun, ArrowLeft } from 'lucide-react';

// Import our components and helpers
import CitySearch from '@/components/CitySearch';
import WeatherForecast from '@/components/WeatherForecast'; // Import WeatherForecast
import StorySection from '@/components/StorySection';
import { airStories } from '@/lib/storiesData';
import { awardPointsClientSide } from '@/lib/awardPoints'; // Import the points helper

// Dynamically import map components
const IndiaPollutionMap = dynamic(() => import('@/components/IndiaPollutionMap'), { loading: () => <p className="text-center text-lg text-gray-300">Loading pollution map...</p>, ssr: false });
const GhGDetector = dynamic(() => import('@/components/GhGDetector'), { loading: () => <p className="text-center text-lg text-gray-300">Loading GHG detector...</p>, ssr: false });

export default function AirPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const { userId } = useAuth(); // <-- 3. Get userId
  const router = useRouter(); // <-- 4. Initialize router

  // --- CALLBACK FUNCTIONS (Unchanged) ---
  const handleGhGSuccess = (details: string) => {
    console.log("GhGDetector success:", details); 
    awardPointsClientSide(15, "Air: GHG Emission Check", details);
  };

  const handlePollutionSuccess = (details: string) => {
    console.log("CitySearch success:", details); 
    awardPointsClientSide(10, "Air: Pollution Monitoring", details);
  };

  const handleWeatherSuccess = (details: string) => {
    console.log("WeatherForecast success:", details); 
    awardPointsClientSide(2, "Air: Weather Check", details); 
  };
  // --- END CALLBACK FUNCTIONS ---

  // --- MODIFIED: Added Login Check ---
  // Checks login status BEFORE opening a feature
  const onOpenFeature = (feature: 'pollution' | 'ghg' | 'weather') => {
     // --- 5. ADD LOGIN CHECK ---
     if (!userId) {
         router.push('/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname)); // Redirect to sign-in, try to return here after
         return; // Stop further execution
     }
     // --- END LOGIN CHECK ---

    // If logged in, proceed to set the feature
    setSelectedFeature(feature);
    // No logging needed here, it happens on success inside the tool
  };
  // --- END MODIFICATION ---

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case 'pollution': 
        return (
          <div className="flex flex-col gap-8 animate-fade-in"> {/* Added fade-in animation */}
            <CitySearch onAnalysisSuccess={handlePollutionSuccess} /> 
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Live Station Map</h3>
              <div className="bg-[#161B22]/70 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/30">
                <IndiaPollutionMap />
              </div>
            </div>
          </div>
        );
      case 'ghg': 
        return <div className="animate-fade-in"><GhGDetector onAnalysisSuccess={handleGhGSuccess} /></div>; 
      case 'weather': 
        return <div className="animate-fade-in"><WeatherForecast onAnalysisSuccess={handleWeatherSuccess} /></div>; 
      default:
        // Main menu cards (Unchanged structure, onClick now has login check)
        return (
          <>
            <div className="grid md:grid-cols-3 gap-8 animate-fade-in"> {/* Added fade-in animation */}
              {/* Pollution Card */}
              <div onClick={() => onOpenFeature('pollution')} className="bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-cyan-900/50 flex items-center justify-center mb-6 mx-auto"><Cloudy className="h-8 w-8 text-[#33D7B1]"/></div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">Pollution Monitoring</h3>
                <p className="text-gray-400 text-center">View a live map of pollution across India and search for detailed data by city.</p>
              </div>
              {/* GHG Card */}
              <div onClick={() => onOpenFeature('ghg')} className="bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-cyan-900/50 flex items-center justify-center mb-6 mx-auto"><Factory className="h-8 w-8 text-[#33D7B1]"/></div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">GHG Emission Detection</h3>
                <p className="text-gray-400 text-center">Using satellite imagery and AI to detect greenhouse gas emissions from industrial sources.</p>
              </div>
              {/* Weather Card */}
              <div onClick={() => onOpenFeature('weather')} className="bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-cyan-900/50 flex items-center justify-center mb-6 mx-auto"><ThermometerSun className="h-8 w-8 text-[#33D7B1]"/></div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">Weather Prediction</h3>
                <p className="text-gray-400 text-center">Advanced AI models that analyze atmospheric data to provide accurate, long-range weather forecasts.</p>
              </div>
            </div>
            {/* Stories section (Unchanged) */}
            <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.2s' }}> {/* Added fade-in animation */}
              <StorySection title="Inspired Action for Clean Air" stories={airStories} />
            </div>
          </>
        );
    }
  };

  return (
    <>
       {/* Styles */}
       <style>{`
            .animate-fade-in { 
                animation: fadeIn 0.5s ease-out forwards; 
            }
            @keyframes fadeIn { 
                from { opacity: 0; transform: translateY(10px); } 
                to { opacity: 1; transform: translateY(0); } 
            }
       `}</style>
      {/* Background Video (Unchanged) */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <video autoPlay loop muted className="w-full h-full object-cover"><source src="/videos/air-background.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>
      
      {/* Main Content */}
      <main className="pt-24 pb-16 min-h-screen">
        <section className="w-full flex items-center justify-center relative py-10">
          <div className="container mx-auto px-6 text-center">
            {/* Header section */}
            <div className="max-w-4xl mx-auto animate-fade-in"> {/* Added fade-in animation */}
              <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">Atmospheric Intelligence</h1>
              <p className="mt-4 text-lg text-gray-300">{selectedFeature ? `Viewing ${selectedFeature.replace('-', ' ')}` : 'Select a feature below to begin your analysis.'}</p>
            </div>
            {/* Back Button */}
            {selectedFeature && (
              <div className="flex justify-start max-w-7xl mx-auto animate-fade-in"> {/* Added fade-in animation */}
                <button onClick={() => setSelectedFeature(null)} className="mt-8 mb-4 flex items-center gap-2 text-[#33D7B1] hover:text-cyan-200 transition-colors font-semibold">
                  <ArrowLeft size={20} />Back to All Features
                </button>
              </div>
            )}
            {/* Feature Content Area */}
            <div className="mt-8 max-w-7xl mx-auto">{renderFeatureContent()}</div>
          </div>
        </section>
      </main>
    </>
  );
}