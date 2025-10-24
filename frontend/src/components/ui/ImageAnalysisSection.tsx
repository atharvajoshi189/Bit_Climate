// src/components/ImageAnalysisSection.tsx

"use client";
import { useState, useRef } from 'react';
import { UploadCloud, BarChart, Droplet } from 'lucide-react';

// Naya prop add kiya gaya hai
export const ImageAnalysisSection = ({ onAnalysisComplete }: { onAnalysisComplete: () => void; }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setResults(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyzeClick = () => {
        if (!imagePreview) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            setResults({
                purityScore: 68,
                turbidity: 'Moderate',
                algae: 'Low',
                contaminants: 'Traces Detected'
            });
            setIsAnalyzing(false);
            // Analysis poora hone par yeh function call hoga
            onAnalysisComplete();
        }, 2000);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <section> {/* yahan se py-20 hata diya taaki spacing parent control kare */}
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold text-white">Analyze Water Quality from an Image</h2>
                    <p className="text-lg text-gray-400 mt-4">Upload an image of a local water body to get an instant AI-powered analysis.</p>
                </div>

                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center bg-[#161B22]/70 backdrop-blur-md p-8 rounded-2xl border border-blue-500/30 card-glow-blue">
                    <div 
                        className="w-full h-80 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={handleUploadClick}
                    >
                        <label htmlFor="image-upload" className="sr-only">Upload water body image</label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {imagePreview ? (
                            <img src={imagePreview} alt="Water preview" className="w-full h-full object-contain rounded-md" />
                        ) : (
                            <>
                                <UploadCloud className="h-16 w-16 text-gray-500 mb-4" />
                                <h3 className="text-white font-bold">Click to upload an image</h3>
                                <p className="text-gray-500 text-sm">or drag and drop</p>
                            </>
                        )}
                    </div>

                    <div>
                        <button 
                            onClick={handleAnalyzeClick} 
                            disabled={!imagePreview || isAnalyzing}
                            className="w-full bg-[#33D7B1] text-gray-900 px-6 py-3 rounded-full hover:bg-opacity-80 transition-all font-bold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-t-transparent border-gray-900 rounded-full animate-spin"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <BarChart className="h-5 w-5"/>
                                    Analyze Image
                                </>
                            )}
                        </button>

                        {results && (
                            <div className="mt-6 space-y-3 bg-gray-900/50 p-4 rounded-lg">
                                <h4 className="text-xl font-bold text-white">Analysis Results:</h4>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-gray-300 flex items-center gap-2"><Droplet/>Visual Purity Score:</span>
                                    <span className="font-bold text-teal-400">{results.purityScore}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Estimated Turbidity:</span>
                                    <span className="font-semibold text-white">{results.turbidity}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Visible Algae:</span>
                                    <span className="font-semibold text-white">{results.algae}</span>
                                </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Visual Contaminants:</span>
                                    <span className="font-semibold text-white">{results.contaminants}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};