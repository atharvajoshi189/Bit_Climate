// src/components/LiveMonitoringDashboard.tsx

"use client";
import { useState } from 'react';
import { CheckCircle, AlertTriangle, Bell, ShieldCheck } from 'lucide-react';

const TurbidityChart = () => (
  <div className="w-full h-64 bg-gray-900/50 p-4 rounded-lg relative">
    <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
      <path d="M 0 130 C 50 120, 70 40, 120 50 S 180 140, 240 120 S 300 30, 350 40 L 400 50" stroke="#3B82F6" fill="none" strokeWidth="2"/>
      <circle cx="95" cy="45" r="3" fill="#3B82F6" />
      <text x="95" y="35" fill="#a0aec0" fontSize="10" textAnchor="middle">Monsoon</text>
      <circle cx="275" cy="35" r="3" fill="#3B82F6" />
      <text x="275" y="25" fill="#a0aec0" fontSize="10" textAnchor="middle">Monsoon</text>
      <circle cx="350" cy="40" r="4" fill="#EF4444" />
      <text x="350" y="60" fill="#EF4444" fontSize="10" textAnchor="middle">Anomaly Detected!</text>
    </svg>
    <p className="text-center text-xs text-gray-400 mt-2">Ambazari Lake: 5-Year Turbidity Trend</p>
  </div>
);

export const LiveMonitoringDashboard = () => {
  const [isAlert, setIsAlert] = useState(false);

  return (
    <section> {/* yahan se py-20 hata diya taaki spacing parent control kare */}
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white">Live Monitoring in Action</h2>
          <p className="text-lg text-gray-400 mt-4">This is how our AI turns historical data into a real-time shield for our water bodies.</p>
        </div>

        <div className="bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-blue-500/30 card-glow-blue grid md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-white">Historical Analysis</h3>
            <p className="text-gray-400 -mt-4">The AI learns the 'normal' pattern of the lake from years of data.</p>
            <TurbidityChart />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Live Status: Ambazari Lake</h3>
                <button onClick={() => setIsAlert(!isAlert)} className="text-xs bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-600 transition-colors">Toggle Alert (Demo)</button>
            </div>
            
            <div className={`p-4 rounded-lg flex items-center gap-4 ${isAlert ? 'bg-red-900/50 border border-red-500' : 'bg-green-900/50 border border-green-500'}`}>
              {isAlert ? <AlertTriangle className="h-8 w-8 text-red-400" /> : <ShieldCheck className="h-8 w-8 text-green-400" />}
              <div>
                <h4 className={`text-xl font-bold ${isAlert ? 'text-red-300' : 'text-green-300'}`}>
                  {isAlert ? 'HIGH TURBIDITY ALERT' : 'SYSTEM NORMAL'}
                </h4>
                <p className="text-sm text-gray-400">{isAlert ? 'Anomaly detected outside of monsoon season.' : 'All parameters are within normal seasonal range.'}</p>
              </div>
            </div>

            <div>
                <h4 className="font-bold text-white mb-2">Active Monitoring Rules:</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-400 flex-shrink-0"/><span>Alerts if turbidity is 30% above seasonal average.</span></li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-400 flex-shrink-0"/><span>Alerts if chlorophyll level indicates rapid algae growth.</span></li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-400 flex-shrink-0"/><span>Triggers alert on detecting pollutants from satellite spectral data.</span></li>
                </ul>
            </div>

             <div>
                <h4 className="font-bold text-white mb-2">Recent Alerts Log:</h4>
                <div className="bg-gray-900/50 p-3 rounded-lg text-sm space-y-2">
                    {isAlert ? (<div className="flex items-center gap-3 text-red-400"><Bell className="h-4 w-4"/><span>**High Turbidity Alert** - 20 Sep 2025, 08:20 PM</span></div>) : (<p className="text-gray-500">No new alerts in the last 7 days.</p>)}
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};