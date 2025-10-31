"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { Wind, Droplets, Mountain, TrendingUp, Trees, Leaf, ChevronRight, UploadCloud, ShieldCheck, Cpu, Database, Layers } from 'lucide-react';
import { useEcobotContext } from '@/components/EcobotContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { awardPointsClientSide } from '@/lib/awardPoints'; // Make sure this path is correct

// ==============================================================================
//  UNCHANGED: EcobotButton, DataTicker
// (Aapke original components, koi badlav nahi)
// ==============================================================================
const EcobotButton = () => (
    <a href="/ecobot" className="inline-block bg-teal-500 hover:bg-teal-400 text-black font-bold py-4 px-8 rounded-full transition-all duration-300 group transform hover:scale-105 shadow-lg hover:shadow-teal-400/50">
        Chat with Ecobot <ChevronRight className="inline-block w-6 h-6 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
    </a>
);
const DataTicker = () => {
    const environmentalData = [ /* ... (aapka data yahan) ... */ { label: 'Global CO₂ Level', value: '422.5', unit: 'ppm', icon: <TrendingUp/> }, { label: 'Arctic Ice Melt', value: '12.6%', unit: 'per decade', icon: <Droplets/> }, { label: 'Deforestation Rate', value: '11.1M', unit: 'hectares/year', icon: <Trees/> }, { label: 'Renewable Energy', value: '30.1%', unit: 'of global electricity', icon: <Wind/> }, { label: 'Species at Risk', value: '44,000+', unit: 'threatened', icon: <Leaf/> }, ];
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
//  REBUILT: CitizenScienceHub, EcoVerify, ClimateImpactSimulator
// (Inn components ko thoda modify kiya gaya hai taaki yeh "Sticky Stack" mein fit ho sakein)
// ==============================================================================
const CitizenScienceHub = () => {
    const { userId } = useAuth(); const router = useRouter(); const [file, setFile] = useState<File | null>(null); const [preview, setPreview] = useState<string | null>(null); const [result, setResult] = useState<any>(null); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(''); const fileInputRef = useRef<HTMLInputElement>(null); const [isClient, setIsClient] = useState(false); useEffect(() => { setIsClient(true); }, []);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... (aapka original file change logic) ... */ const selectedFile = e.target.files?.[0]; if (selectedFile) { if (selectedFile.size > 5 * 1024 * 1024) { setError('File is too large. Please select an image under 5MB.'); setFile(null); setPreview(null); return; } setError(''); setFile(selectedFile); const reader = new FileReader(); reader.onloadend = () => { setPreview(reader.result as string); }; reader.readAsDataURL(selectedFile); setResult(null); } };
    const handleSubmit = async () => { /* ... (aapka original submit logic) ... */ if (!userId) { router.push('/sign-in'); return; } if (!file) { setError('Please select an image to analyze.'); return; } setIsLoading(true); setError(''); setResult(null); const formData = new FormData(); formData.append('file', file); try { const response = await fetch('http://127.0.0.1:8000/report_issue', { method: 'POST', body: formData, }); if (!response.ok) { let errorMsg = 'Analysis failed.'; try { const errData = await response.json(); errorMsg = errData.detail || errorMsg;} catch (_) {} throw new Error(errorMsg); } const data = await response.json(); if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); } setResult(data); const pointsToGive = 50; const activityType = "Citizen Science: Report Issue"; const activityDetails = `Reported: ${data.issue_type} (Severity: ${data.severity})`; awardPointsClientSide(pointsToGive, activityType, activityDetails); } catch (err: any) { setError(err.message || "An unknown error occurred."); } finally { setIsLoading(false); } };
    return (
        <div className="bg-[#161B22] p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-700 h-full"> {/* Removed fixed height */}
            <motion.div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-4xl font-bold text-white">1. Become a Citizen Scientist</h2>
                <p className="text-lg text-gray-400 mt-4">Help us crowdsource real-time data. Report an environmental issue by uploading an image. Our AI will analyze and categorize it.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <input id="file-upload-cs" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {preview ? <img src={preview} alt="Issue preview" className="w-full h-full object-contain rounded-lg p-2" /> : <><UploadCloud size={48} className="text-gray-400 mb-4" /><p className="text-white font-semibold">Click to upload an image</p><p className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB</p></>}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Report an Issue</h3>
                    <p className="text-gray-400 mt-2 mb-6">Upload a photo of a local environmental problem. Our AI will analyze it for you.</p>
                    <button onClick={handleSubmit} disabled={!isClient || isLoading || !file} className="w-full bg-teal-500 text-black font-bold py-3 rounded-lg hover:bg-teal-400 disabled:bg-gray-600 disabled:cursor-not-allowed"> {isLoading ? 'Analyzing...' : 'Analyze with AI'} </button>
                    {isClient && error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                    {isClient && result && !error && ( <div className="mt-6 p-4 bg-gray-900/50 rounded-lg"> <p className="font-semibold text-white">AI Analysis Result:</p> <p className="text-teal-300 text-lg">{result.issue_type}</p> <p className="text-sm text-gray-400">Severity: <span className="font-bold text-yellow-400">{result.severity}</span></p> </div> )}
                </div>
            </div>
        </div>
    );
};

const EcoVerify = () => {
    const { userId } = useAuth(); const router = useRouter(); const [claim, setClaim] = useState(''); const [result, setResult] = useState<string | null>(null); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(''); const [isClient, setIsClient] = useState(false); useEffect(() => { setIsClient(true); }, []);
    const handleSubmit = async (e: React.FormEvent) => { /* ... (aapka original submit logic) ... */ e.preventDefault(); if (!userId) { router.push('/sign-in'); return; } if (claim.trim().length < 15) { setError('Please enter a claim with at least 15 characters.'); return; } setIsLoading(true); setError(''); setResult(null); try { const response = await fetch('http://127.0.0.1:8000/verify_claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claim }), }); if (!response.ok) { let errorMsg = 'Verification failed.'; try { const errData = await response.json(); errorMsg = errData.detail || errorMsg;} catch (_) {} throw new Error(errorMsg); } const data = await response.json(); if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); } setResult(data.verification); const pointsToGive = 5; const activityType = "Tool Use: Eco-Verify"; const shortClaim = claim.length > 50 ? claim.substring(0, 47) + '...' : claim; const activityDetails = `Verified claim: "${shortClaim}"`; awardPointsClientSide(pointsToGive, activityType, activityDetails); } catch (err: any) { setError(err.message || "An unknown error occurred."); } finally { setIsLoading(false); } };
    return (
        <div className="bg-[#161B22] p-8 rounded-2xl shadow-xl max-w-3xl mx-auto border border-gray-700 h-full"> {/* Removed fixed height */}
            <motion.div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-4xl font-bold text-white">2. Verify with AI</h2>
                <p className="text-lg text-gray-400 mt-4">Combat misinformation. Paste any news headline or social media claim about the environment, and our AI will fact-check it against verified data.</p>
            </motion.div>
            <h3 className="text-2xl font-bold text-white text-center">Eco-Verify: AI Fact-Checker</h3>
            <p className="text-gray-400 mt-2 mb-6 text-center">Heard a claim? Verify it.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea value={claim} onChange={(e) => setClaim(e.target.value)} placeholder="Paste a news headline or social media claim here..." className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none" rows={4} />
                <button type="submit" disabled={!isClient || isLoading || claim.trim().length < 15} className="w-full bg-teal-500 text-black font-bold py-3 rounded-lg hover:bg-teal-400 disabled:bg-gray-600 disabled:cursor-not-allowed"> {isLoading ? 'Verifying with AI...' : 'Verify Claim'} </button>
            </form>
            {isClient && error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            {isClient && result && !error && ( <div className="mt-6 p-4 bg-gray-900/50 rounded-lg"> <p className="font-semibold text-white flex items-center gap-2"><ShieldCheck size={20} className="text-green-400" /> AI Verification:</p> <p className="text-gray-300 mt-2 whitespace-pre-wrap">{result}</p> </div> )}
        </div>
    );
};

const ClimateImpactSimulator = () => {
    const [tempRise, setTempRise] = useState(1.5); const [deforestation, setDeforestation] = useState(20); const seaLevelRise = (tempRise * 0.6).toFixed(1); const droughtRisk = Math.min(100, (15 + tempRise * 12)).toFixed(0); const co2Increase = (deforestation * 0.5).toFixed(1); const biodiversityLoss = Math.min(100, (10 + deforestation * 0.8)).toFixed(0); const getRiskColor = (value: number) => { if (value < 40) return 'text-green-400'; if (value < 70) return 'text-yellow-400'; return 'text-red-500'; };
    return (
        <div className="bg-[#161B22] p-8 md:p-12 rounded-2xl shadow-xl max-w-5xl mx-auto border border-gray-700 h-full"> {/* Removed fixed height */}
            <motion.div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-4xl font-bold text-white">3. Simulate the Future</h2>
                <p className="text-lg text-gray-400 mt-4">See the future. Understand how small changes in global temperature and deforestation can have massive consequences.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div> <label htmlFor="temp-slider" className="block text-lg font-medium text-white">Global Temperature Rise</label> <p className="text-teal-400 text-3xl font-bold mb-2">+{tempRise.toFixed(1)}°C</p> <input id="temp-slider" type="range" min="0.5" max="5" step="0.1" value={tempRise} onChange={(e) => setTempRise(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500" /> </div>
                    <div> <label htmlFor="deforest-slider" className="block text-lg font-medium text-white">Annual Deforestation Rate</label> <p className="text-orange-400 text-3xl font-bold mb-2">{deforestation} Mha</p> <input id="deforest-slider" type="range" min="0" max="100" step="1" value={deforestation} onChange={(e) => setDeforestation(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500" /> </div>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-4">Predicted Future Impact</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-800 p-3 rounded"><p className="text-sm text-gray-400">Sea Level Rise</p><p className="text-2xl font-bold text-blue-400">~{seaLevelRise} m</p></div>
                        <div className="bg-gray-800 p-3 rounded"><p className="text-sm text-gray-400">Drought Risk</p><p className={`text-2xl font-bold ${getRiskColor(parseFloat(droughtRisk))}`}>{droughtRisk}%</p></div>
                        <div className="bg-gray-800 p-3 rounded"><p className="text-sm text-gray-400">CO₂ Increase</p><p className="text-2xl font-bold text-gray-300">+{co2Increase} ppm</p></div>
                        <div className="bg-gray-800 p-3 rounded"><p className="text-sm text-gray-400">Biodiversity Loss</p><p className={`text-2xl font-bold ${getRiskColor(parseFloat(biodiversityLoss))}`}>{biodiversityLoss}%</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==============================================================================
//  NEW: PortalCard (Aapke 3 cards ke liye ek component)
// ==============================================================================
const PortalCard = ({ href, videoSrc, icon: Icon, title, description, quizTopic }: { href: string; videoSrc: string; icon: React.ElementType; title: string; description: string; quizTopic: string; }) => {
    const router = useRouter();
    const handleQuizClick = (topic: string, event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        router.push(`/quiz/${topic}`);
    };
    return (
        <a href={href} className="portal-card">
            <video autoPlay loop muted playsInline className="portal-video"><source src={videoSrc} type="video/mp4" /></video>
            <div className="portal-content">
                <div className="content-default"><Icon size={40} /><h3 className="text-4xl font-bold mt-4">{title}</h3></div>
                <div className="content-hover">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <p className="mt-2 text-sm text-gray-200">{description}</p>
                    <button onClick={(e) => handleQuizClick(quizTopic, e)} className="mt-4 inline-block bg-teal-500/80 text-black text-sm font-bold py-2 px-4 rounded-full hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300 z-10" > Take the Quiz! </button>
                </div>
            </div>
        </a>
    );
};


// ==============================================================================
//  MAIN HOME PAGE COMPONENT (PURA REWRITE KIYA GAYA)
// ==============================================================================
export default function HomePage() {
  const { setIsHeroButtonVisible } = useEcobotContext();
  const heroButtonRef = useRef<HTMLDivElement>(null);
  
  // Hero Scroll Animation
  const heroRef = useRef<HTMLSelectElement>(null);
  const { scrollYProgress: heroScrollYProgress } = useScroll({
      target: heroRef,
      offset: ["start start", "end start"]
  });
  const heroTextOpacity = useTransform(heroScrollYProgress, [0, 0.7], [1, 0]);
  const heroTextScale = useTransform(heroScrollYProgress, [0, 0.7], [1, 0.8]);
  const heroVideoOpacity = useTransform(heroScrollYProgress, [0.5, 1], [0.6, 0]); // Video fades out faster
  
  // Sticky Stack Animation
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stickyScrollYProgress } = useScroll({
      target: stickyContainerRef,
      offset: ["start start", "end end"]
  });
  
  // Card 1 (Citizen Hub) Animations
  const scaleCard1 = useTransform(stickyScrollYProgress, [0, 0.3], [1, 0.9]);
  const opacityCard1 = useTransform(stickyScrollYProgress, [0.25, 0.3], [1, 0]);
  const yCard1 = useTransform(stickyScrollYProgress, [0, 0.3], ["0%", "-5%"]);
  
  // Card 2 (EcoVerify) Animations
  const scaleCard2 = useTransform(stickyScrollYProgress, [0.3, 0.6], [1, 0.9]);
  const opacityCard2 = useTransform(stickyScrollYProgress, [0.55, 0.6], [1, 0]);
  const yCard2 = useTransform(stickyScrollYProgress, [0.3, 0.6], ["0%", "-5%"]);

  // Card 3 (Simulator) Animations
  const scaleCard3 = useTransform(stickyScrollYProgress, [0.6, 0.9], [1, 0.9]);
  const opacityCard3 = useTransform(stickyScrollYProgress, [0.85, 0.9], [1, 0]);
  const yCard3 = useTransform(stickyScrollYProgress, [0.6, 0.9], ["0%", "-5%"]);
  
  // Horizontal Scroll Animation
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: horizontalScrollYProgress } = useScroll({
      target: horizontalScrollRef,
      offset: ["start start", "end end"]
  });
  const horizontalMove = useTransform(horizontalScrollYProgress, [0.1, 0.9], ["0%", "-calc(200% - 70vw)"]); // 200% for 3 cards

  // Simple Fade-in for final sections
  const sectionAnimation = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  // Original useEffect for Ecobot button
  useEffect(() => {
     const observer = new IntersectionObserver(([entry]) => { setIsHeroButtonVisible(entry.isIntersecting); }, { threshold: 0.5 }); const currentRef = heroButtonRef.current; if (currentRef) observer.observe(currentRef); return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [setIsHeroButtonVisible]);


  return (
    <>
      {/* ============================================================================== */}
      {/* AAPKI ORIGINAL STYLES (UNCHANGED)                                            */}
      {/* ============================================================================== */}
      <style>{`
          body { background-color: #0D1117; color: #E6EDF3; }
          /* PARALLAX-BG HATAYA GAYA, VIDEO USE HOGA */
          .animated-gradient { background: linear-gradient(-45deg, #33d7b1, #3B82F6, #C026D3, #22d3ee); background-size: 400% 400%; animation: gradient 10s ease infinite; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; } @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          
          /* PORTAL CARD STYLES (Aapke original) */
          .portal-card { display: block; width: 100%; aspect-ratio: 9 / 12; background: #000; border-radius: 1.5rem; transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1); box-shadow: 0 20px 50px rgba(0,0,0,0.2); position: relative; cursor: pointer; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); } .portal-card:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,0.3); } .portal-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: filter 0.5s ease-out, transform 0.5s ease-out; } .portal-card:hover .portal-video { filter: blur(10px) brightness(0.6); transform: scale(1.1); } .portal-content { position: absolute; inset: 0; padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 3; color: white; text-align: center; } .content-default { transition: opacity 0.4s ease-out, transform 0.4s ease-out; } .portal-card:hover .content-default { opacity: 0; transform: translateY(10px); } .content-hover { position: absolute; inset: 1.5rem; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s; } .portal-card:hover .content-hover { opacity: 1; transform: translateY(0); }
          
          /* TICKER STYLES (Aapke original) */
          .ticker-wrap { animation: ticker 40s linear infinite; } @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          
          /* SIMPLE FADE-IN (Aapka original) */
          .animate-fade-in { opacity: 0; animation: fadeIn 1s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <main className="bg-[#0D1117] overflow-x-hidden"> {/* CRITICAL: overflow-x-hidden */}
        
        {/* ============================================================================== */}
        {/* NEW HERO SECTION (CINEMATIC)                                                  */}
        {/* ============================================================================== */}
        <section ref={heroRef} className="h-[150vh] w-full relative"> {/* 150vh height to allow for scroll animation */}
          <div className="h-screen w-full sticky top-0 flex flex-col items-center justify-center">
            {/* Background Video */}
            <motion.video
              autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ opacity: heroVideoOpacity }}
            >
              {/* Ek high-quality cinematic video (e.g., Earth from space) yahan use karein */}
              <source src="/videos/earth-hero.mp4" type="video/mp4" />
            </motion.video>
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            
            {/* Hero Text (Animated) */}
            <motion.div
              className="text-center px-4 z-20 flex flex-col items-center"
              style={{ opacity: heroTextOpacity, scale: heroTextScale }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">Ecoverse</h1>
              <span className="block mt-2 text-5xl md:text-7xl font-extrabold animated-gradient">Our Planet's Future.</span>
              <p className="mt-8 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
                Pioneering data-driven solutions to monitor, analyze, and combat critical environmental challenges.
              </p>
              <div ref={heroButtonRef} className="mt-20">
                <EcobotButton />
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Data Ticker (Unchanged) */}
        <DataTicker />
        
        {/* ============================================================================== */}
        {/* NEW "STICKY STACK" SECTION (THE "101/10" WOW MOMENT 1)                       */}
        {/* ============================================================================== */}
        <section ref={stickyContainerRef} className="relative h-[400vh] w-full py-24">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            {/* This div is the "canvas" for our sticky cards */}
            
            {/* CARD 3: SIMULATOR (Sabse neeche) */}
            <motion.div
              className="absolute w-[90%] md:w-[80%] lg:w-[70%] p-6"
              style={{
                scale: scaleCard3,
                opacity: opacityCard3,
                y: yCard3,
              }}
            >
              <ClimateImpactSimulator />
            </motion.div>
            
            {/* CARD 2: ECO-VERIFY (Uske upar) */}
            <motion.div
              className="absolute w-[90%] md:w-[80%] lg:w-[70%] p-6"
              style={{
                scale: scaleCard2,
                opacity: opacityCard2,
                y: yCard2,
              }}
            >
              <EcoVerify />
            </motion.div>
            
            {/* CARD 1: CITIZEN HUB (Sabse upar) */}
            <motion.div
              className="absolute w-[90%] md:w-[80%] lg:w-[70%] p-6"
              style={{
                scale: scaleCard1,
                opacity: opacityCard1,
                y: yCard1,
              }}
            >
              <CitizenScienceHub />
            </motion.div>
          </div>
        </section>

        {/* ============================================================================== */}
        {/* NEW "HORIZONTAL SCROLL" SECTION (THE "101/10" WOW MOMENT 2)                */}
        {/* ============================================================================== */}
        <section ref={horizontalScrollRef} className="relative h-[300vh] w-full bg-black/30">
          <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
            
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16 px-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-white">Explore Our AI Solutions</h2>
              <p className="text-lg text-gray-400 mt-4">We leverage advanced AI to monitor and protect the core elements of our world. Scroll to explore.</p>
            </motion.div>
            
            {/* The Horizontal Film Strip */}
            <motion.div
              style={{ x: horizontalMove }}
              className="flex gap-8 md:gap-12 px-12"
            >
              {/* In 3 cards ko horizontal layout mein fit karne ke liye inka width control karna zaroori hai */}
              <div className="flex-shrink-0 w-[80vw] md:w-[60vw] lg:w-[40vw]">
                <PortalCard href="/air" videoSrc="/videos/air-background.mp4" icon={Wind} title="Air" description="Real-time air quality monitoring, pollution source tracking, and predictive weather modeling." quizTopic="air" />
              </div>
              <div className="flex-shrink-0 w-[80vw] md:w-[60vw] lg:w-[40vw]">
                <PortalCard href="/water" videoSrc="/videos/water-background.mp4" icon={Droplets} title="Water" description="AI-powered flood & drought forecasting, water quality analysis, and smart resource management." quizTopic="water" />
              </div>
              <div className="flex-shrink-0 w-[80vw] md:w-[60vw] lg:w-[40vw]">
                <PortalCard href="/land" videoSrc="/videos/land-background.mp4" icon={Mountain} title="Land" description="Automated deforestation detection, sustainable agriculture insights, and crop disease diagnosis." quizTopic="land" />
              </div>
            </motion.div>
          </div>
        </section>

       {/* ============================================================================== */}
            {/* UNCHANGED: Unseen Crisis & Footer (Simple fade-in)                         */}
            {/* ============================================================================== */}
            <motion.section className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <div className="container mx-auto px-6">
                <motion.div className="max-w-4xl mx-auto text-center mb-16" variants={sectionAnimation}>
                  <h2 className="text-4xl font-bold text-white">The Unseen Crisis</h2>
                  <p className="text-lg text-gray-400 mt-4">Our planet is facing unprecedented challenges. Technology is our greatest ally in understanding and combating them.</p>
                </motion.div>
                
                {/* --- SAHI CODE YAHAN SE SHURU KAREIN --- */}
                <div className="bg-[#161B22] p-8 md:p-12 rounded-2xl shadow-xl max-w-5xl mx-auto text-left text-gray-300 space-y-4 leading-relaxed border border-gray-700">
                  <p>From melting polar ice caps to the increasing frequency of extreme weather events, the signs of climate change are undeniable. Rising global temperatures disrupt delicate ecosystems, threatening biodiversity and altering weather patterns that millions rely on for agriculture and survival.</p>
                  
                  {/* YEH AAPKE ORIGINAL FILE SE LIYA GAYA HAI */}
                  <p>Pollution in our air and water poses a direct threat to public health, while unsustainable land use leads to deforestation, destroying vital carbon sinks and displacing wildlife. These are not isolated issues; they are interconnected facets of a global crisis that demands immediate, intelligent, and data-driven action.</p>

                  <p>At Bit-Climate, we believe that by harnessing Artificial Intelligence, we can turn vast amounts of environmental data into clear, actionable insights, empowering us to make smarter decisions for a sustainable future.</p>
                </div>
                {/* --- SAHI CODE YAHAN KHATM KAREIN --- */}

              </div>
            </motion.section>

      </main>
    </>
  );
}