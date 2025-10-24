// src/components/ui/NumericPredictionSection.tsx

"use client";

import { useState } from 'react';
import { BarChart, Loader2, ServerCrash } from 'lucide-react';

// Define the structure for the form data
interface FormData {
  do: string;
  ph: string;
  conductivity: string;
  bod: string;
  coliform: string;
}

// Define the structure for the API response
interface PredictionResult {
  predicted_quality: 'Good' | 'Moderate' | 'Poor' | 'Very Poor';
}

export const NumericPredictionSection = () => {
  const [formData, setFormData] = useState<FormData>({
    do: '',
    ph: '',
    conductivity: '',
    bod: '',
    coliform: '',
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Convert form data strings to numbers for the API
      const numericData = {
        do: parseFloat(formData.do),
        ph: parseFloat(formData.ph),
        conductivity: parseFloat(formData.conductivity),
        bod: parseFloat(formData.bod),
        coliform: parseFloat(formData.coliform),
      };

      // Call your backend API endpoint
      const response = await fetch('http://127.0.0.1:8000/predict/water_quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(numericData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Network response was not ok');
      }

      const data: PredictionResult = await response.json();
      setResult(data);

    } catch (err: any) {
      setError('Failed to get prediction. Please ensure the backend server is running and the values are correct.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold text-white">Predict Water Quality</h2>
          <p className="text-lg text-gray-400 mt-4">Enter the measured parameters of a water sample to get an instant AI-powered quality prediction.</p>
        </div>

        <div className="max-w-3xl mx-auto bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-blue-500/30 card-glow-blue">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- LAYOUT UPDATED TO A 2-COLUMN GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <InputField label="Dissolved Oxygen (do)" name="do" value={formData.do} onChange={handleInputChange} placeholder="e.g., 6.5" />
              <InputField label="pH Level (ph)" name="ph" value={formData.ph} onChange={handleInputChange} placeholder="e.g., 7.2" />
              <InputField label="Conductivity (μmhos/cm)" name="conductivity" value={formData.conductivity} onChange={handleInputChange} placeholder="e.g., 1500" />
              <InputField label="B.O.D. (mg/l)" name="bod" value={formData.bod} onChange={handleInputChange} placeholder="e.g., 4.8" />
              {/* This last field will sit in the first column of the last row */}
              <InputField label="Total Coliform (MPN/100ml)" name="coliform" value={formData.coliform} onChange={handleInputChange} placeholder="e.g., 80" />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#33D7B1] text-gray-900 px-6 py-4 rounded-full hover:bg-opacity-80 transition-all font-bold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg">
              {isLoading ? <><Loader2 className="animate-spin h-6 w-6" /><span>Analyzing...</span></> : <><BarChart className="h-6 w-6" /><span>Predict Quality</span></>}
            </button>
          </form>
          
          {/* Results Display */}
          <div className="mt-8 text-center">
            {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-center justify-center gap-3"><ServerCrash className="h-6 w-6" /> <p>{error}</p></div>}
            {result && (
              <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-gray-400 text-lg">Predicted Water Quality:</h3>
                <p className={`text-5xl font-bold mt-2 ${result.predicted_quality === 'Good' ? 'text-green-400' : result.predicted_quality === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>{result.predicted_quality}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper component for styled input fields
const InputField = ({ label, name, value, onChange, placeholder }: { label: string, name: keyof FormData, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 text-left mb-2">{label}</label>
        <input type="number" step="any" id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} required className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
    </div>
);