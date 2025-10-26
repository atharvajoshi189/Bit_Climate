"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from "@clerk/nextjs"; // <-- IMPORT useAuth FOR CHECKS
import { Wind, Droplets, Mountain, TrendingUp, Trees, Leaf, ChevronRight, UploadCloud, ShieldCheck } from 'lucide-react';
import { useEcobotContext } from '@/components/EcobotContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { awardPointsClientSide } from '@/lib/awardPoints'; // Make sure this path is correct

// ==============================================================================
//  UNCHANGED COMPONENTS (EcobotButton, DataTicker)
// ==============================================================================
const EcobotButton = () => (
    <a href="/ecobot" className="inline-block bg-teal-500 hover:bg-teal-400 text-black font-bold py-4 px-8 rounded-full transition-all duration-300 group transform hover:scale-105 shadow-lg hover:shadow-teal-400/50">
        Chat with Ecobot <ChevronRight className="inline-block w-6 h-6 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
    </a>
);

const DataTicker = () => {
    const environmentalData = [
      { label: 'Global CO₂ Level', value: '422.5', unit: 'ppm', icon: <TrendingUp/> },
      { label: 'Arctic Ice Melt', value: '12.6%', unit: 'per decade', icon: <Droplets/> },
      { label: 'Deforestation Rate', value: '11.1M', unit: 'hectares/year', icon: <Trees/> },
      { label: 'Renewable Energy', value: '30.1%', unit: 'of global electricity', icon: <Wind/> },
      { label: 'Species at Risk', value: '44,000+', unit: 'threatened', icon: <Leaf/> },
    ];
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm py-4 border-y border-gray-700 w-full overflow-hidden">
        <div className="ticker-wrap flex">
          <div className="ticker-content flex-shrink-0 flex items-center">{environmentalData.map((item, index) => (<div key={index} className="flex items-center text-white mx-8"><div className="text-teal-400 mr-3">{item.icon}</div><div><span className="font-bold text-lg">{item.value}</span><span className="text-gray-400 text-sm ml-1">{item.unit}</span><p className="text-gray-400 text-xs uppercase tracking-wider">{item.label}</p></div></div>))}</div>
          <div className="ticker-content flex-shrink-0 flex items-center">{environmentalData.map((item, index) => (<div key={index + environmentalData.length} className="flex items-center text-white mx-8"><div className="text-teal-400 mr-3">{item.icon}</div><div><span className="font-bold text-lg">{item.value}</span><span className="text-gray-400 text-sm ml-1">{item.unit}</span><p className="text-gray-400 text-xs uppercase tracking-wider">{item.label}</p></div></div>))}</div>
        </div>
      </div>
    );
};

// ==============================================================================
//  CITIZEN SCIENCE HUB (WITH LOGIN CHECK & POINTS)
// ==============================================================================
const CitizenScienceHub = () => {
    const { userId } = useAuth(); // <-- Get userId
    const router = useRouter(); // <-- Initialize router
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File is too large. Please select an image under 5MB.');
                 setFile(null); // Clear file state on error
                 setPreview(null);
                return;
            }
            setError('');
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
            setResult(null);
        }
    };

    const handleSubmit = async () => {
        // --- ADD LOGIN CHECK ---
        if (!userId) {
            router.push('/sign-in'); // Redirect if not logged in
            return;
        }
        // --- END LOGIN CHECK ---

        if (!file) {
            setError('Please select an image to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/report_issue', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                let errorMsg = 'Analysis failed.';
                try { const errData = await response.json(); errorMsg = errData.detail || errorMsg;} catch (_) {}
                throw new Error(errorMsg);
            }
            const data = await response.json();
             if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }
            setResult(data);

            // --- AWARD POINTS ---
            const pointsToGive = 50;
            const activityType = "Citizen Science: Report Issue";
            const activityDetails = `Reported: ${data.issue_type} (Severity: ${data.severity})`;
            awardPointsClientSide(pointsToGive, activityType, activityDetails);
            // --- END POINTS ---

        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // --- JSX remains unchanged ---
        <div className="bg-[#161B22] p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-700">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div
                    className="h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <label htmlFor="file-upload-cs" className="sr-only">Upload image for analysis</label> {/* Changed id */}
                    <input id="file-upload-cs" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {preview ? (
                        <img src={preview} alt="Issue preview" className="w-full h-full object-contain rounded-lg p-2" />
                    ) : (
                        <>
                            <UploadCloud size={48} className="text-gray-400 mb-4" />
                            <p className="text-white font-semibold">Click to upload an image</p>
                            <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        </>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Report an Issue</h3>
                    <p className="text-gray-400 mt-2 mb-6">Upload a photo of a local environmental problem. Our AI will analyze it for you.</p>
                    <button onClick={handleSubmit} disabled={!isClient || isLoading || !file} className="w-full bg-teal-500 text-black font-bold py-3 rounded-lg hover:bg-teal-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                    {isClient && error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                    {isClient && result && !error && ( // Show result only if no error
                        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                            <p className="font-semibold text-white">AI Analysis Result:</p>
                            <p className="text-teal-300 text-lg">{result.issue_type}</p>
                            <p className="text-sm text-gray-400">Severity: <span className="font-bold text-yellow-400">{result.severity}</span></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// ==============================================================================
//  ECO-VERIFY AI FACT-CHECKER (WITH LOGIN CHECK & POINTS)
// ==============================================================================
const EcoVerify = () => {
    const { userId } = useAuth(); // <-- Get userId
    const router = useRouter(); // <-- Initialize router
    const [claim, setClaim] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- ADD LOGIN CHECK ---
        if (!userId) {
            router.push('/sign-in'); // Redirect if not logged in
            return;
        }
        // --- END LOGIN CHECK ---

        if (claim.trim().length < 15) {
            setError('Please enter a claim with at least 15 characters.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
             const response = await fetch('http://127.0.0.1:8000/verify_claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claim }), });
             if (!response.ok) {
                let errorMsg = 'Verification failed.';
                try { const errData = await response.json(); errorMsg = errData.detail || errorMsg;} catch (_) {}
                throw new Error(errorMsg);
             }
            const data = await response.json();
             if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }
            setResult(data.verification);

            // --- AWARD POINTS ---
            const pointsToGive = 5;
            const activityType = "Tool Use: Eco-Verify";
            const shortClaim = claim.length > 50 ? claim.substring(0, 47) + '...' : claim;
            const activityDetails = `Verified claim: "${shortClaim}"`;
            awardPointsClientSide(pointsToGive, activityType, activityDetails);
            // --- END POINTS ---

        } catch (err: any) {
             setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // --- JSX ---
        <div className="bg-[#161B22] p-8 rounded-2xl shadow-xl max-w-3xl mx-auto border border-gray-700">
            <h3 className="text-2xl font-bold text-white text-center">Eco-Verify: AI Fact-Checker</h3>
            <p className="text-gray-400 mt-2 mb-6 text-center">Heard a claim about the environment? Verify it with AI.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="Paste a news headline or social media claim here..."
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none"
                    rows={4} // Added rows attribute for better default height
                />
                <button type="submit" disabled={!isClient || isLoading || claim.trim().length < 15} className="w-full bg-teal-500 text-black font-bold py-3 rounded-lg hover:bg-teal-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
                    {isLoading ? 'Verifying with AI...' : 'Verify Claim'}
                </button>
            </form>
            {isClient && error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            {isClient && result && !error && ( // Show result only if no error
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                    <p className="font-semibold text-white flex items-center gap-2"><ShieldCheck size={20} className="text-green-400" /> AI Verification:</p>
                    <p className="text-gray-300 mt-2 whitespace-pre-wrap">{result}</p>
                </div>
            )}
        </div>
    );
};

// ==============================================================================
//  UNCHANGED COMPONENT: CLIMATE IMPACT SIMULATOR
// ==============================================================================
const ClimateImpactSimulator = () => {
    // ... (ClimateImpactSimulator code remains unchanged) ...
    const [tempRise, setTempRise] = useState(1.5); const [deforestation, setDeforestation] = useState(20); const seaLevelRise = (tempRise * 0.6).toFixed(1); const droughtRisk = Math.min(100, (15 + tempRise * 12)).toFixed(0); const co2Increase = (deforestation * 0.5).toFixed(1); const biodiversityLoss = Math.min(100, (10 + deforestation * 0.8)).toFixed(0); const getRiskColor = (value: number) => { if (value < 40) return 'text-green-400'; if (value < 70) return 'text-yellow-400'; return 'text-red-500'; }; return ( <div className="bg-[#161B22] p-8 md:p-12 rounded-2xl shadow-xl max-w-5xl mx-auto border border-gray-700"> <div className="grid md:grid-cols-2 gap-12"> <div className="space-y-8"> <div> <label htmlFor="temp-slider" className="block text-lg font-medium text-white">Global Temperature Rise</label> <p className="text-teal-400 text-3xl font-bold mb-2">+{tempRise.toFixed(1)}°C</p> <input id="temp-slider" type="range" min="0.5" max="5" step="0.1" value={tempRise} onChange={(e) => setTempRise(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500" /> </div> <div> <label htmlFor="deforest-slider" className="block text-lg font-medium text-white">Annual Deforestation Rate</label> <p className="text-orange-400 text-3xl font-bold mb-2">{deforestation} Mha</p> <input id="deforest-slider" type="range" min="0" max="100" step="1" value={deforestation} onChange={(e) => setDeforestation(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500" /> </div> </div> <div className="bg-gray-900/50 p-6 rounded-lg"> <h3 className="text-xl font-bold text-white mb-4">Predicted Future Impact</h3> <div className="grid grid-cols-2 gap-4 text-center"> <div className="bg-gray-800 p-3 rounded"><p className="text-sm text-gray-400">Sea Level Rise</p><p className="text-2xl font-bold text-blue-400">~{seaLevelRise} m</p></div> <div className="bg-gray-800 p-3 rounded"><p className="text-sm text-gray-400">Drought Risk</p><p className={`text-2xl font-bold ${getRiskColor(parseFloat(droughtRisk))}`}>{droughtRisk}%</p></div> <div className="bg-gray-800 p-3 rounded"><p className="text-sm text-gray-400">CO₂ Increase</p><p className="text-2xl font-bold text-gray-300">+{co2Increase} ppm</p></div> <div className="bg-gray-800 p-3 rounded"><p className="text-sm text-gray-400">Biodiversity Loss</p><p className={`text-2xl font-bold ${getRiskColor(parseFloat(biodiversityLoss))}`}>{biodiversityLoss}%</p></div> </div> </div> </div> </div> );
};


// ==============================================================================
//  MAIN HOME PAGE COMPONENT (FIXED HYDRATION ERROR)
// ==============================================================================
export default function HomePage() {
  const { setIsHeroButtonVisible } = useEcobotContext();
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // Initialize router

  const { scrollYProgress } = useScroll({ target: contentRef, offset: ["start start", "end end"] });
  const backgroundColor = useTransform( scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], ["#0D1117", "#111827", "#1E1B4B", "#111827", "#0D1117", "#0D1117"]);
   const sectionAnimation = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  useEffect(() => {
     const observer = new IntersectionObserver(([entry]) => { setIsHeroButtonVisible(entry.isIntersecting); }, { threshold: 0.5 }); const currentRef = heroButtonRef.current; if (currentRef) observer.observe(currentRef); return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [setIsHeroButtonVisible]);

  // --- FUNCTION TO HANDLE QUIZ BUTTON CLICK ---
  const handleQuizClick = (topic: string, event: React.MouseEvent<HTMLButtonElement>) => {
     event.preventDefault(); event.stopPropagation(); router.push(`/quiz/${topic}`);
  };

  return (
    <>
      {/* Styles (Unchanged) */}
      <style>{`
          body { background-color: #0D1117; color: #E6EDF3; } .parallax-bg { background-image: url('https://t3.ftcdn.net/jpg/09/47/87/50/360_F_947875038_QlOtNAu4VQfWUw3zDwOPAtY3y4DaqBHw.jpg'); background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover; } .animated-gradient { background: linear-gradient(-45deg, #33d7b1, #3B82F6, #C026D3, #22d3ee); background-size: 400% 400%; animation: gradient 10s ease infinite; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; } @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .portal-card { display: block; width: 100%; aspect-ratio: 9 / 12; background: #000; border-radius: 1.5rem; transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1); box-shadow: 0 20px 50px rgba(0,0,0,0.2); position: relative; cursor: pointer; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); } .portal-card:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,0.3); } .portal-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: filter 0.5s ease-out, transform 0.5s ease-out; } .portal-card:hover .portal-video { filter: blur(10px) brightness(0.6); transform: scale(1.1); } .portal-content { position: absolute; inset: 0; padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 3; color: white; text-align: center; } .content-default { transition: opacity 0.4s ease-out, transform 0.4s ease-out; } .portal-card:hover .content-default { opacity: 0; transform: translateY(10px); } .content-hover { position: absolute; inset: 1.5rem; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s; } .portal-card:hover .content-hover { opacity: 1; transform: translateY(0); } .ticker-wrap { animation: ticker 40s linear infinite; } @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-fade-in { opacity: 0; animation: fadeIn 1s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <main>
        {/* HERO SECTION (Unchanged) */}
        <section className="h-screen w-full flex flex-col items-center justify-center relative parallax-bg"> <div className="absolute inset-0 bg-black/60"></div> <div className="text-center px-4 z-10 flex flex-col items-center animate-fade-in"> <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">Ecoverse</h1> <span className="block mt-2 text-5xl md:text-7xl font-extrabold animated-gradient">Our Planet's Future.</span> <p className="mt-8 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto" style={{ animationDelay: '0.2s' }}> Pioneering data-driven solutions to monitor, analyze, and combat critical environmental challenges. </p> <div ref={heroButtonRef} className="mt-20" style={{ animationDelay: '0.4s' }}> <EcobotButton /> </div> </div> </section>
        
        {/* Data Ticker (Unchanged) */}
        <DataTicker />
        
        {/* Main Content Sections */}
        <motion.div ref={contentRef} style={{ backgroundColor, transition: 'background-color 0.3s ease-in-out' }} className="relative">
            {/* Citizen Science Hub Section (Unchanged) */}
            <motion.section className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}> <div className="container mx-auto px-6"> <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={sectionAnimation}><h2 className="text-4xl font-bold text-white">Become a Citizen Scientist</h2><p className="text-lg text-gray-400 mt-4">See a problem? Report it. Help us crowdsource real-time data by uploading an image of any environmental issue you find. Our AI will analyze and categorize it.</p></motion.div> <CitizenScienceHub /> </div> </motion.section>

            {/* Your 3 Cards Section (FIXED HYDRATION ERROR - Unchanged from previous fix) */}
            <motion.section id="services" className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}> <div className="container mx-auto px-6"> <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={sectionAnimation}><h2 className="text-4xl font-bold text-white">Explore Our AI Solutions</h2><p className="text-lg text-gray-400 mt-4">We leverage advanced AI to monitor and protect the core elements of our world.</p></motion.div> <div className="grid md:grid-cols-3 gap-8"> {/* --- AIR CARD --- */} <a href="/air" className="portal-card"> <video autoPlay loop muted playsInline className="portal-video"><source src="/videos/air-background.mp4" type="video/mp4" /></video> <div className="portal-content"> <div className="content-default"><Wind size={40} /><h3 className="text-4xl font-bold mt-4">Air</h3></div> <div className="content-hover"> <h3 className="text-2xl font-bold">Air</h3> <p className="mt-2 text-sm text-gray-200">Real-time air quality monitoring, pollution source tracking, and predictive weather modeling.</p> <button onClick={(e) => handleQuizClick('air', e)} className="mt-4 inline-block bg-teal-500/80 text-black text-sm font-bold py-2 px-4 rounded-full hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300 z-10" > Take the Quiz! </button> </div> </div> </a> {/* --- WATER CARD --- */} <a href="/water" className="portal-card"> <video autoPlay loop muted playsInline className="portal-video"><source src="/videos/water-background.mp4" type="video/mp4" /></video> <div className="portal-content"> <div className="content-default"><Droplets size={40} /><h3 className="text-4xl font-bold mt-4">Water</h3></div> <div className="content-hover"> <h3 className="text-2xl font-bold">Water</h3> <p className="mt-2 text-sm text-gray-200">AI-powered flood & drought forecasting, water quality analysis, and smart resource management.</p> <button onClick={(e) => handleQuizClick('water', e)} className="mt-4 inline-block bg-teal-500/80 text-black text-sm font-bold py-2 px-4 rounded-full hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300 z-10" > Take the Quiz! </button> </div> </div> </a> {/* --- LAND CARD --- */} <a href="/land" className="portal-card"> <video autoPlay loop muted playsInline className="portal-video"><source src="/videos/land-background.mp4" type="video/mp4" /></video> <div className="portal-content"> <div className="content-default"><Mountain size={40} /><h3 className="text-4xl font-bold mt-4">Land</h3></div> <div className="content-hover"> <h3 className="text-2xl font-bold">Land</h3> <p className="mt-2 text-sm text-gray-200">Automated deforestation detection, sustainable agriculture insights, and crop disease diagnosis.</p> <button onClick={(e) => handleQuizClick('land', e)} className="mt-4 inline-block bg-teal-500/80 text-black text-sm font-bold py-2 px-4 rounded-full hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300 z-10" > Take the Quiz! </button> </div> </div> </a> </div> </div> </motion.section>
            
            {/* Eco-Verify Section (Unchanged) */}
            <motion.section className="py-24 bg-black/20" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}> <div className="container mx-auto px-6"> <EcoVerify /> </div> </motion.section>

            {/* Climate Impact Simulator Section (Unchanged) */}
            <motion.section className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}> <div className="container mx-auto px-6"> <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={sectionAnimation}><h2 className="text-4xl font-bold text-white">Climate Impact Simulator</h2><p className="text-lg text-gray-400 mt-4">See the future. Understand how small changes in global temperature and deforestation can have massive consequences. This demonstrates our predictive modeling capabilities.</p></motion.div> <ClimateImpactSimulator /> </div> </motion.section>

            {/* Unseen Crisis Section (Unchanged) */}
            <motion.section className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}> <div className="container mx-auto px-6"> <motion.div className="max-w-4xl mx-auto text-center mb-16" variants={sectionAnimation}><h2 className="text-4xl font-bold text-white">The Unseen Crisis</h2><p className="text-lg text-gray-400">Our planet is facing unprecedented challenges. Technology is our greatest ally in understanding and combating them.</p></motion.div> <div className="bg-[#161B22] p-8 md:p-12 rounded-2xl shadow-xl max-w-5xl mx-auto text-left text-gray-300 space-y-4 leading-relaxed border border-gray-700"> <p>From melting polar ice caps to the increasing frequency of extreme weather events, the signs of climate change are undeniable. Rising global temperatures disrupt delicate ecosystems, threatening biodiversity and altering weather patterns that millions rely on for agriculture and survival.</p> <p>Pollution in our air and water poses a direct threat to public health, while unsustainable land use leads to deforestation, destroying vital carbon sinks and displacing wildlife. These are not isolated issues; they are interconnected facets of a global crisis that demands immediate, intelligent, and data-driven action.</p> <p>At Bit-Climate, we believe that by harnessing Artificial Intelligence, we can turn vast amounts of environmental data into clear, actionable insights, empowering us to make smarter decisions for a sustainable future.</p> </div> </div> </motion.section>
            
            {/* Footer (Unchanged) */}
            <motion.footer className="bg-gray-900 text-gray-400 py-12 mt-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.0 }}> <div className="container mx-auto px-6 text-center"><p>&copy; 2025 Bit-Climate. All Rights Reserved. Building a resilient planet with AI.</p></div> </motion.footer>
        </motion.div>
      </main>
    </>
  );
}