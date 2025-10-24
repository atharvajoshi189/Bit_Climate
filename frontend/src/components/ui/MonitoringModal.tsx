// src/components/MonitoringModal.tsx

"use client";

import { X } from 'lucide-react';
import { LiveMonitoringDashboard } from '@/components/ui/LiveMonitoringDashboard';
import { ImageAnalysisSection } from '@/components/ui/ImageAnalysisSection';

interface MonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonitoringModal = ({ isOpen, onClose }: MonitoringModalProps) => {
  if (!isOpen) return null;

  return (
    // Main overlay, poori screen ko cover karega
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      
      {/* Modal ka content panel */}
      <div className="bg-[#0D1117] w-full max-w-6xl h-[90vh] rounded-2xl border border-blue-500/50 p-6 relative overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          title="Close modal"
          aria-label="Close modal"
        >
          <X className="h-8 w-8" />
        </button>

        {/* Modal ke andar humare dono sections */}
        <div>
          <LiveMonitoringDashboard />
          <ImageAnalysisSection onAnalysisComplete={() => {}} />
        </div>

      </div>
    </div>
  );
};