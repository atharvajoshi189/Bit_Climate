// src/app/solutions/page.tsx
"use client";

import Link from 'next/link';
import {
  Factory, Cloudy, ThermometerSun, // Air
  Waves, TestTube, Leaf as WaterLeaf, // Water (using WaterLeaf to avoid name clash)
  Trees, ScanLine, Wheat, // Land
  UploadCloud, // Citizen Science
  ShieldCheck, // Eco-Verify
  ArrowRight
} from 'lucide-react';

// Define the structure for each tool/solution
interface Solution {
  icon: React.ElementType;
  name: string;
  description: string;
  category: 'Air' | 'Water' | 'Land' | 'Platform';
  link: string; // Link to the specific page/section
  color: string; // Tailwind color class for icon/border
}

// Array containing details for all your solutions
const solutions: Solution[] = [
  // --- Air Solutions ---
  {
    icon: Cloudy,
    name: "Pollution Monitoring",
    description: "View live pollution maps and search detailed AQI data by city.",
    category: 'Air',
    link: '/air', // Links to the Air page, user selects feature there
    color: 'cyan'
  },
  {
    icon: Factory,
    name: "GHG Emission Detection",
    description: "Analyze NO₂ emissions using satellite imagery for any selected area.",
    category: 'Air',
    link: '/air',
    color: 'cyan'
  },
  {
    icon: ThermometerSun,
    name: "Weather Prediction",
    description: "Get accurate, long-range weather forecasts powered by AI.",
    category: 'Air',
    link: '/air',
    color: 'cyan'
  },
  // --- Water Solutions ---
  {
    icon: Waves,
    name: "Flood & Drought Assessment",
    description: "Analyze flood and drought risks for cities based on river station data.",
    category: 'Water',
    link: '/water',
    color: 'blue'
  },
  {
    icon: TestTube,
    name: "Water Quality Prediction",
    description: "Predict water quality (Good/Bad) based on sensor parameters.",
    category: 'Water',
    link: '/water',
    color: 'blue'
  },
  {
    icon: WaterLeaf, // Using alias WaterLeaf
    name: "Precision Irrigation Advisor",
    description: "Optimize farm irrigation schedules based on crop type, weather, and soil moisture.",
    category: 'Water',
    link: '/water',
    color: 'blue'
  },
   // --- Land Solutions ---
   {
    icon: Trees,
    name: "Deforestation Detection",
    description: "Monitor forest cover changes and detect logging activities using satellite data.",
    category: 'Land',
    link: '/land',
    color: 'fuchsia'
  },
   {
    icon: ScanLine,
    name: "Plant Disease Detector",
    description: "Instantly diagnose plant diseases by uploading a leaf image.",
    category: 'Land',
    link: '/land',
    color: 'fuchsia'
  },
   {
    icon: Wheat,
    name: "Crop Recommendation",
    description: "Get AI suggestions for optimal crops based on soil image and climate.",
    category: 'Land',
    link: '/land',
    color: 'fuchsia'
  },
   // --- Platform Features ---
   {
    icon: UploadCloud,
    name: "Citizen Science Hub",
    description: "Report environmental issues by uploading photos for AI analysis.",
    category: 'Platform',
    link: '/', // Link to homepage section
    color: 'teal'
  },
  {
    icon: ShieldCheck,
    name: "Eco-Verify Fact Checker",
    description: "Verify environmental news headlines and social media claims with AI.",
    category: 'Platform',
    link: '/', // Link to homepage section
    color: 'teal'
  },
  // Add more tools here if you have them...
];

// Helper to get color classes
const getColorClasses = (color: string) => {
  switch (color) {
    case 'cyan': return { border: 'border-cyan-500/30 hover:border-cyan-400', iconBg: 'bg-cyan-900/50', iconText: 'text-cyan-400', shadow: 'hover:shadow-cyan-500/30' };
    case 'blue': return { border: 'border-blue-500/30 hover:border-blue-400', iconBg: 'bg-blue-900/50', iconText: 'text-blue-400', shadow: 'hover:shadow-blue-500/30' };
    case 'fuchsia': return { border: 'border-fuchsia-500/30 hover:border-fuchsia-400', iconBg: 'bg-fuchsia-900/50', iconText: 'text-fuchsia-400', shadow: 'hover:shadow-fuchsia-500/30' };
    case 'teal': return { border: 'border-teal-500/30 hover:border-teal-400', iconBg: 'bg-teal-900/50', iconText: 'text-teal-400', shadow: 'hover:shadow-teal-500/30' };
    default: return { border: 'border-gray-700 hover:border-gray-500', iconBg: 'bg-gray-800', iconText: 'text-gray-400', shadow: 'hover:shadow-gray-500/30' };
  }
};


export default function SolutionsPage() {
  return (
     <>
      {/* Background Styling */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]" />

      <main className="pt-28 pb-16 min-h-screen text-white">
        <div className="container mx-auto px-6">

          {/* Page Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">Our AI Solutions</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore the powerful AI-driven tools Bit Climate offers to monitor and analyze our environment across air, water, and land.
            </p>
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => {
              const IconComponent = solution.icon;
              const colors = getColorClasses(solution.color);
              return (
                <div
                  key={solution.name}
                  className={`bg-[#161B22]/70 backdrop-blur-md p-6 rounded-2xl border ${colors.border} transition-all duration-300 hover:scale-[1.03] shadow-lg ${colors.shadow} flex flex-col animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }} // Stagger animation
                >
                  {/* Icon and Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${colors.iconBg}`}>
                      <IconComponent className={`h-6 w-6 ${colors.iconText}`} />
                    </div>
                    <h2 className="text-xl font-bold text-white flex-1">{solution.name}</h2>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 flex-grow">{solution.description}</p>

                   {/* Category Tag */}
                   <div className="mb-4">
                       <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${colors.iconBg} ${colors.iconText} opacity-80`}>
                           {solution.category}
                       </span>
                   </div>

                  {/* Link Button */}
                  <Link href={solution.link} className="block mt-auto">
                     <button className={`w-full text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${colors.iconBg} ${colors.iconText} hover:bg-opacity-70 hover:text-white`}>
                        Go to Tool <ArrowRight className="inline-block w-4 h-4 ml-1" />
                     </button>
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </main>
      {/* Add Styles for Animation */}
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