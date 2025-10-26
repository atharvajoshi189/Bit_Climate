// src/app/about/page.tsx
"use client"; // Keep this if you plan to add animations or interactive elements later

import { Bot, Target, AlertTriangle, Cpu, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      {/* Background Styling (Similar to other pages) */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]">
         {/* Optional: Add a subtle background pattern or image if desired */}
      </div>

      <main className="pt-28 pb-16 min-h-screen text-white">
        <div className="container mx-auto px-6">

          {/* Page Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">About Bit Climate</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Leveraging Artificial Intelligence to build a resilient future for our planet.
            </p>
          </div>

          {/* Grid Layout for Sections */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">

            {/* Our Mission */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-teal-900/50 p-3 rounded-full"><Target className="h-6 w-6 text-teal-400" /></div>
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                To empower individuals, communities, and organizations with accessible, data-driven AI tools
                to understand, monitor, and combat critical environmental challenges. We aim to translate complex climate
                data into actionable insights for a sustainable future.
              </p>
            </div>

            {/* The Problem */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-4 mb-4">
                 <div className="bg-red-900/50 p-3 rounded-full"><AlertTriangle className="h-6 w-6 text-red-400" /></div>
                <h2 className="text-3xl font-bold">The Challenge</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Climate change presents an unprecedented global crisis. From rising temperatures and extreme weather
                to pollution and biodiversity loss, the impacts are far-reaching. Understanding these complex issues
                and finding effective solutions requires processing vast amounts of environmental data.
              </p>
            </div>

          </div>

           {/* Our Solution Section */}
          <div className="text-center mb-20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
             <div className="inline-block bg-blue-900/50 p-4 rounded-full mb-4"><Cpu className="h-8 w-8 text-blue-400" /></div>
            <h2 className="text-4xl font-bold mb-4">Our AI-Powered Approach</h2>
            <p className="text-lg text-gray-400 max-w-4xl mx-auto mb-8">
              Bit Climate harnesses the power of Artificial Intelligence and Machine Learning to tackle these challenges.
              We develop sophisticated models trained on satellite imagery, sensor data, and climate records to provide tools for:
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
              <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-lg mb-2 text-teal-400">Atmospheric Monitoring</h3>
                <p className="text-sm text-gray-300">Tracking air quality, detecting GHG emissions, and predicting weather patterns.</p>
              </div>
              <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-lg mb-2 text-blue-400">Aquatic Intelligence</h3>
                <p className="text-sm text-gray-300">Assessing flood/drought risks, monitoring water quality, and optimizing irrigation.</p>
              </div>
              <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700">
                 <h3 className="font-semibold text-lg mb-2 text-fuchsia-400">Terrestrial Analysis</h3>
                 <p className="text-sm text-gray-300">Detecting deforestation, diagnosing crop diseases, and recommending sustainable practices.</p>
              </div>
            </div>
          </div>

          {/* Technology Stack (Optional but good for hackathon) */}
          <div className="text-center mb-20 animate-fade-in" style={{ animationDelay: '0.8s' }}>
             <h2 className="text-3xl font-bold mb-6">Technology We Use</h2>
             <div className="flex flex-wrap justify-center gap-4 items-center max-w-3xl mx-auto">
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">Next.js</span>
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">React</span>
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">TypeScript</span>
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">Tailwind CSS</span>
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">Python (FastAPI)</span>
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">Scikit-learn / TensorFlow</span> {/* Adjust AI libraries */}
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">Prisma</span>
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">Supabase (PostgreSQL)</span>
                 <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">Clerk</span>
             </div>
          </div>

           {/* Call to Action */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '1.0s' }}>
            <h2 className="text-3xl font-bold mb-4">Join Us in Making a Difference</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Explore our tools, utilize the insights, and contribute to a more sustainable planet.
            </p>
             <Link href="/dashboard" className="inline-block bg-teal-500 hover:bg-teal-400 text-black font-bold py-3 px-8 rounded-full transition-all duration-300 group transform hover:scale-105 shadow-lg hover:shadow-teal-400/50">
                Explore Dashboard <ArrowRight className="inline-block w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </main>
      {/* Add Styles for Animation */}
      <style>{`
          .animate-fade-in {
            opacity: 0;
            animation: fadeIn 0.8s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
      `}</style>
    </>
  );
}