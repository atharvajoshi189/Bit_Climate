"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Factory, Cloudy, ThermometerSun, // Air
  Waves, TestTube, Leaf as WaterLeaf, // Water
  Trees, ScanLine, Wheat, // Land
  UploadCloud, // Citizen Science
  ShieldCheck, // Eco-Verify
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================
//  DATA & TYPES (Aapke original data se)
// =============================================

interface Solution {
  icon: React.ElementType;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: 'Air' | 'Water' | 'Land' | 'Platform';
  link: string;
  color: string;
  videoBg: string;
}

const solutions: Solution[] = [
  // --- Air Solutions ---
  {
    icon: Cloudy,
    name: "Pollution Monitoring",
    shortDescription: "Live pollution maps & AQI data.",
    longDescription: "Utilize our AI-driven live pollution maps to track real-time Air Quality Index (AQI) data. Search by city or use your location to see detailed particulate matter (PM2.5, PM10) and gas concentrations (O₃, NO₂, SO₂).",
    category: 'Air',
    link: '/air',
    color: 'cyan',
    videoBg: '/videos/air-background.mp4'
  },
  {
    icon: Factory,
    name: "GHG Emission Detection",
    shortDescription: "Analyze NO₂ emissions via satellite.",
    longDescription: "Harness the power of satellite imagery to analyze Greenhouse Gas (GHG) emissions. Our model focuses on Nitrogen Dioxide (NO₂) hotspots, allowing you to monitor industrial zones, power plants, and urban areas over time.",
    category: 'Air',
    link: '/air',
    color: 'cyan',
    videoBg: '/videos/air-background.mp4'
  },
  {
    icon: ThermometerSun,
    name: "Weather Prediction",
    shortDescription: "Accurate, long-range AI forecasts.",
    longDescription: "Move beyond standard forecasts. Our AI model analyzes vast datasets to provide highly accurate, long-range weather predictions, helping you plan for critical events and understand climatic trends.",
    category: 'Air',
    link: '/air',
    color: 'cyan',
    videoBg: '/videos/air-background.mp4'
  },
  // --- Water Solutions ---
  {
    icon: Waves,
    name: "Flood & Drought Assessment",
    shortDescription: "Analyze risks based on river data.",
    longDescription: "Assess hydrological risks with precision. By analyzing data from river stations and historical trends, our system provides critical risk assessments for both flood events and potential drought conditions for any major watershed.",
    category: 'Water',
    link: '/water',
    color: 'blue',
    videoBg: '/videos/water-background.mp4'
  },
  {
    icon: TestTube,
    name: "Water Quality Prediction",
    shortDescription: "Predict water quality from sensor data.",
    longDescription: "Input key sensor parameters (like pH, turbidity, dissolved oxygen) and our AI model will instantly predict the potability and overall quality of the water, classifying it as 'Good', 'Moderate', or 'Bad' for ecosystems.",
    category: 'Water',
    link: '/water',
    color: 'blue',
    videoBg: '/videos/water-background.mp4'
  },
  {
    icon: WaterLeaf,
    name: "Precision Irrigation Advisor",
    shortDescription: "Optimize farm irrigation schedules.",
    longDescription: "Stop guessing, start optimizing. Our advisor tool helps farms create hyper-efficient irrigation schedules by analyzing crop type, real-time weather forecasts, and soil moisture data, saving water and increasing yield.",
    category: 'Water',
    link: '/water',
    color: 'blue',
    videoBg: '/videos/water-background.mp4'
  },
  // --- Land Solutions ---
  {
    icon: Trees,
    name: "Deforestation Detection",
    shortDescription: "Monitor forest cover changes.",
    longDescription: "Protect our vital carbon sinks. This tool uses high-resolution satellite data to monitor forest cover changes in real-time, automatically detecting and flagging illegal logging activities and emerging deforestation fronts.",
    category: 'Land',
    link: '/land',
    color: 'fuchsia',
    videoBg: '/videos/land-background.mp4'
  },
  {
    icon: ScanLine,
    name: "Plant Disease Detector",
    shortDescription: "Diagnose diseases via leaf image.",
    longDescription: "Your pocket agronomist. Simply upload an image of a plant leaf, and our computer vision model will instantly diagnose potential diseases, suggesting immediate steps for mitigation and treatment.",
    category: 'Land',
    link: '/land',
    color: 'fuchsia',
    videoBg: '/videos/land-background.mp4'
  },
  {
    icon: Wheat,
    name: "Crop Recommendation",
    shortDescription: "AI suggestions for optimal crops.",
    longDescription: "Maximize your harvest potential. Based on soil analysis (from images or data), local climate, and water availability, our AI recommends the most optimal and profitable crops for you to plant.",
    category: 'Land',
    link: '/land',
    color: 'fuchsia',
    videoBg: '/videos/land-background.mp4'
  },
  // --- Platform Features ---
  {
    icon: UploadCloud,
    name: "Citizen Science Hub",
    shortDescription: "Report issues with AI analysis.",
    longDescription: "Become an environmental scout. Upload photos of local environmental problems—like illegal dumping or a blocked drain—and our AI will analyze, categorize, and map the issue, alerting local authorities and our Crisis-Cast engine.",
    category: 'Platform',
    link: '/',
    color: 'teal',
    videoBg: '/videos/platform-bg.mp4' // <-- Need a new video for this
  },
  {
    icon: ShieldCheck,
    name: "Eco-Verify Fact Checker",
    shortDescription: "Verify environmental claims.",
    longDescription: "Combat misinformation. Paste any news headline or social media claim about the environment, and our AI will cross-reference it with verified scientific data to give you a 'Verified', 'Misleading', or 'False' rating.",
    category: 'Platform',
    link: '/',
    color: 'teal',
    videoBg: '/videos/platform-bg.mp4'
  },
];

const categories: Solution['category'][] = ['Air', 'Water', 'Land', 'Platform'];

// =============================================
//  NEW THEME HELPER
// =============================================
const getColorClasses = (color: string) => {
  switch (color) {
    case 'cyan': 
      return { 
        text: 'text-cyan-400', 
        border: 'border-cyan-500', 
        bg: 'bg-cyan-600', 
        hoverBg: 'hover:bg-cyan-700' 
      };
    case 'blue': 
      return { 
        text: 'text-blue-400', 
        border: 'border-blue-500', 
        bg: 'bg-blue-600', 
        hoverBg: 'hover:bg-blue-700' 
      };
    case 'fuchsia': 
      return { 
        text: 'text-fuchsia-400', 
        border: 'border-fuchsia-500', 
        bg: 'bg-fuchsia-600', 
        hoverBg: 'hover:bg-fuchsia-700' 
      };
    case 'teal': 
      return { 
        text: 'text-teal-400', 
        border: 'border-teal-500', 
        bg: 'bg-teal-600', 
        hoverBg: 'hover:bg-teal-700' 
      };
    default: 
      return { 
        text: 'text-neutral-400', 
        border: 'border-neutral-700', 
        bg: 'bg-neutral-600', 
        hoverBg: 'hover:bg-neutral-700' 
      };
  }
};

// =============================================
//  MAIN COMPONENT
// =============================================
export default function SolutionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Solution['category']>('Air');
  
  // Logic (unchanged)
  const defaultSolution = solutions.find(s => s.category === selectedCategory) || solutions[0];
  const [activeSolution, setActiveSolution] = useState<Solution>(defaultSolution);
  const filteredSolutions = solutions.filter(s => s.category === selectedCategory);

  const handleCategoryClick = (category: Solution['category']) => {
    setSelectedCategory(category);
    const newDefaultSolution = solutions.find(s => s.category === category) || solutions[0];
    setActiveSolution(newDefaultSolution);
  };
  
  const activeColors = getColorClasses(activeSolution.color);
  const ActiveIcon = activeSolution.icon;

  return (
    <>
      {/* Background Styling (Matches Dashboard) */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />

      <main className="pt-24 pb-16 min-h-screen text-white">
        <div className="container mx-auto px-6 max-w-7xl">

          {/* Page Header (Matches Dashboard fonts) */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
              Our AI Solutions
            </h1>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Interactive tools to monitor, analyze, and protect our planet.
            </p>
          </div>

          {/* Main Grid: Navigation (Left) + Display (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* --- LEFT NAVIGATION PANEL (1/3 width) --- */}
            <div className="lg:col-span-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              
              {/* NEW Category Tab Buttons */}
              <div className="flex space-x-2 mb-6 border-b border-neutral-800">
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  const colors = getColorClasses(
                    category === 'Air' ? 'cyan' :
                    category === 'Water' ? 'blue' :
                    category === 'Land' ? 'fuchsia' : 'teal'
                  );
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`flex-1 py-3 px-2 text-sm font-bold transition-all duration-300
                        ${isActive 
                          ? `${colors.text} border-b-2 ${colors.border}`
                          : 'text-neutral-500 border-b-2 border-transparent hover:bg-neutral-900 hover:text-neutral-200'
                        }
                      `}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* NEW Tools List (Matches Dashboard card style) */}
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredSolutions.map((solution) => {
                    const isActive = activeSolution.name === solution.name;
                    const colors = getColorClasses(solution.color);
                    const Icon = solution.icon;
                    return (
                      <motion.div
                        key={solution.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <button
                          onMouseEnter={() => setActiveSolution(solution)}
                          className={`w-full flex items-center text-left p-4 rounded-lg border transition-all duration-200
                            ${isActive
                              ? `bg-neutral-800 scale-[1.02] ${colors.border}` // Active state
                              : `bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700` // Inactive state
                            }
                          `}
                        >
                          <div className={`p-2 rounded-lg bg-neutral-800/50 mr-4 ${colors.text}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-neutral-300'}`}>
                              {solution.name}
                            </h3>
                            <p className="text-xs text-neutral-400">{solution.shortDescription}</p>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* --- RIGHT DISPLAY PANEL (2/3 width) --- */}
            <div className="lg:col-span-8 lg:sticky lg:top-24 h-[65vh]">
              
              {/* NEW Main Display Card (Matches Dashboard card style) */}
              <div className={`relative w-full h-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 lg:p-12 flex flex-col overflow-hidden shadow-2xl`}>
                
                {/* NEW: Dynamic Video *inside* the card */}
                <AnimatePresence>
                  <motion.video
                    key={activeSolution.videoBg}
                    autoPlay
                    loop
                    muted
                    playsInline
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }} // Very subtle, professional background
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                  >
                    <source src={activeSolution.videoBg} type="video/mp4" />
                  </motion.video>
                </AnimatePresence>
                
                {/* Content (sits on top of the video) */}
                <div className="relative z-10 flex flex-col h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSolution.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col h-full" // Added h-full
                    >
                      {/* Icon + Title */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full bg-neutral-800/50 ${activeColors.text}`}>
                          <ActiveIcon className="h-7 w-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">{activeSolution.name}</h2>
                      </div>

                      {/* Long Description */}
                      <p className="text-neutral-300 text-base mb-6 flex-grow">
                        {activeSolution.longDescription}
                      </p>

                      {/* NEW "Go to Tool" Button (Matches Dashboard button style) */}
                      <Link href={activeSolution.link} className="block mt-auto">
                        <button className={`w-full text-center py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 
                          ${activeColors.bg} ${activeColors.hoverBg} text-white
                        `}>
                          Go to Tool <ArrowRight className="inline-block w-5 h-5 ml-1" />
                        </button>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
      
      {/* Styles (Unchanged) */}
      <style>{`
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}