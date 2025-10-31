"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { Wind, Droplets, Mountain, TrendingUp, Trees, Leaf, ChevronRight, UploadCloud, ShieldCheck, Target, Gamepad2 } from 'lucide-react';
import { useEcobotContext } from '@/components/EcobotContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { awardPointsClientSide } from '@/lib/awardPoints';
import Link from 'next/link';

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
      <div className="bg-neutral-950 py-4 border-y border-neutral-800 w-full overflow-hidden">
        <div className="ticker-wrap flex">
          <div className="ticker-content flex-shrink-0 flex items-center">{environmentalData.map((item, index) => (<div key={index} className="flex items-center text-white mx-8"><div className="text-green-400 mr-3">{item.icon}</div><div><span className="font-bold text-lg">{item.value}</span><span className="text-neutral-400 text-sm ml-1">{item.unit}</span><p className="text-neutral-400 text-xs uppercase tracking-wider">{item.label}</p></div></div>))}</div>
          <div className="ticker-content flex-shrink-0 flex items-center">{environmentalData.map((item, index) => (<div key={index + environmentalData.length} className="flex items-center text-white mx-8"><div className="text-green-400 mr-3">{item.icon}</div><div><span className="font-bold text-lg">{item.value}</span><span className="text-neutral-400 text-sm ml-1">{item.unit}</span><p className="text-neutral-400 text-xs uppercase tracking-wider">{item.label}</p></div></div>))}</div>
        </div>
      </div>
    );
};

// ==============================================================================
//  UNCHANGED LOGIC COMPONENTS (CitizenScienceHub, EcoVerify, Simulator)
//  (Sirf theme update ki gayi hai)
// ==============================================================================
const CitizenScienceHub = () => {
    const { userId } = useAuth();
    const router = useRouter();
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
            if (selectedFile.size > 5 * 1024 * 1024) { setError('File is too large. Please select an image under 5MB.'); setFile(null); setPreview(null); return; }
            setError(''); setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => { setPreview(reader.result as string); };
            reader.readAsDataURL(selectedFile);
            setResult(null);
        }
    };
    const handleSubmit = async () => {
        if (!userId) { router.push('/sign-in'); return; }
        if (!file) { setError('Please select an image to analyze.'); return; }
        setIsLoading(true); setError(''); setResult(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://127.0.0.1:8000/report_issue', { method: 'POST', body: formData });
            if (!response.ok) { let errorMsg = 'Analysis failed.'; try { const errData = await response.json(); errorMsg = errData.detail || errorMsg;} catch (_) {} throw new Error(errorMsg); }
            const data = await response.json();
             if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }
            setResult(data);
            awardPointsClientSide(50, "Citizen Science: Report Issue", `Reported: ${data.issue_type} (Severity: ${data.severity})`);
        } catch (err: any) { setError(err.message || "An unknown error occurred.");
        } finally { setIsLoading(false); }
    };
    return (
        <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-neutral-800">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="h-64 border-2 border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-500 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <label htmlFor="file-upload-cs" className="sr-only">Upload image for analysis</label>
                    <input id="file-upload-cs" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {preview ? (<img src={preview} alt="Issue preview" className="w-full h-full object-contain rounded-lg p-2" />) : (<><UploadCloud size={48} className="text-neutral-500 mb-4" /><p className="text-white font-semibold">Click to upload an image</p><p className="text-sm text-neutral-400">PNG, JPG, WEBP up to 5MB</p></>)}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Report an Issue</h3>
                    <p className="text-neutral-400 mt-2 mb-6">Upload a photo of a local environmental problem. Our AI will analyze it for you.</p>
                    <button onClick={handleSubmit} disabled={!isClient || isLoading || !file} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-neutral-700 disabled:cursor-not-allowed">
                        {isLoading ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                    {isClient && error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                    {isClient && result && !error && (<div className="mt-6 p-4 bg-neutral-800 rounded-lg"><p className="font-semibold text-white">AI Analysis Result:</p><p className="text-green-300 text-lg">{result.issue_type}</p><p className="text-sm text-neutral-400">Severity: <span className="font-bold text-yellow-400">{result.severity}</span></p></div>)}
                </div>
            </div>
        </div>
    );
};

const EcoVerify = () => {
    const { userId } = useAuth();
    const router = useRouter();
    const [claim, setClaim] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) { router.push('/sign-in'); return; }
        if (claim.trim().length < 15) { setError('Please enter a claim with at least 15 characters.'); return; }
        setIsLoading(true); setError(''); setResult(null);
        try {
             const response = await fetch('http://127.0.0.1:8000/verify_claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claim }), });
             if (!response.ok) { let errorMsg = 'Verification failed.'; try { const errData = await response.json(); errorMsg = errData.detail || errorMsg;} catch (_) {} throw new Error(errorMsg); }
            const data = await response.json();
             if (data.detail) { throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)); }
            setResult(data.verification);
            const shortClaim = claim.length > 50 ? claim.substring(0, 47) + '...' : claim;
            awardPointsClientSide(5, "Tool Use: Eco-Verify", `Verified claim: "${shortClaim}"`);
        } catch (err: any) { setError(err.message || "An unknown error occurred.");
        } finally { setIsLoading(false); }
    };
    return (
        <div className="bg-neutral-900 p-8 rounded-2xl shadow-xl max-w-3xl mx-auto border border-neutral-800">
            <h3 className="text-2xl font-bold text-white text-center">Eco-Verify: AI Fact-Checker</h3>
            <p className="text-neutral-400 mt-2 mb-6 text-center">Heard a claim about the environment? Verify it with AI.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea value={claim} onChange={(e) => setClaim(e.target.value)} placeholder="Paste a news headline or social media claim here..." className="w-full bg-neutral-800 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none" rows={4}/>
                <button type="submit" disabled={!isClient || isLoading || claim.trim().length < 15} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-neutral-700 disabled:cursor-not-allowed">
                    {isLoading ? 'Verifying with AI...' : 'Verify Claim'}
                </button>
            </form>
            {isClient && error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            {isClient && result && !error && (<div className="mt-6 p-4 bg-neutral-800 rounded-lg"><p className="font-semibold text-white flex items-center gap-2"><ShieldCheck size={20} className="text-green-400" /> AI Verification:</p><p className="text-neutral-300 mt-2 whitespace-pre-wrap">{result}</p></div>)}
        </div>
    );
};

const ClimateImpactSimulator = () => {
    const [tempRise, setTempRise] = useState(1.5); const [deforestation, setDeforestation] = useState(20); const seaLevelRise = (tempRise * 0.6).toFixed(1); const droughtRisk = Math.min(100, (15 + tempRise * 12)).toFixed(0); const co2Increase = (deforestation * 0.5).toFixed(1); const biodiversityLoss = Math.min(100, (10 + deforestation * 0.8)).toFixed(0); const getRiskColor = (value: number) => { if (value < 40) return 'text-green-400'; if (value < 70) return 'text-yellow-400'; return 'text-red-500'; }; 
    return ( 
      <div className="bg-neutral-900 p-8 md:p-12 rounded-2xl shadow-xl max-w-5xl mx-auto border border-neutral-800"> 
        <div className="grid md:grid-cols-2 gap-12"> 
          <div className="space-y-8"> 
            <div> <label htmlFor="temp-slider" className="block text-lg font-medium text-white">Global Temperature Rise</label> <p className="text-cyan-400 text-3xl font-bold mb-2">+{tempRise.toFixed(1)}°C</p> <input id="temp-slider" type="range" min="0.5" max="5" step="0.1" value={tempRise} onChange={(e) => setTempRise(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" /> </div> 
            <div> <label htmlFor="deforest-slider" className="block text-lg font-medium text-white">Annual Deforestation Rate</label> <p className="text-fuchsia-400 text-3xl font-bold mb-2">{deforestation} Mha</p> <input id="deforest-slider" type="range" min="0" max="100" step="1" value={deforestation} onChange={(e) => setDeforestation(parseInt(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" /> </div> 
          </div> 
          <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-800"> <h3 className="text-xl font-bold text-white mb-4">Predicted Future Impact</h3> <div className="grid grid-cols-2 gap-4 text-center"> <div className="bg-neutral-800 p-3 rounded"><p className="text-sm text-neutral-400">Sea Level Rise</p><p className="text-2xl font-bold text-blue-400">~{seaLevelRise} m</p></div> <div className="bg-neutral-800 p-3 rounded"><p className="text-sm text-neutral-400">Drought Risk</p><p className={`text-2xl font-bold ${getRiskColor(parseFloat(droughtRisk))}`}>{droughtRisk}%</p></div> <div className="bg-neutral-800 p-3 rounded"><p className="text-sm text-neutral-400">CO₂ Increase</p><p className="text-2xl font-bold text-neutral-300">+{co2Increase} ppm</p></div> <div className="bg-neutral-800 p-3 rounded"><p className="text-sm text-neutral-400">Biodiversity Loss</p><p className={`text-2xl font-bold ${getRiskColor(parseFloat(biodiversityLoss))}`}>{biodiversityLoss}%</p></div> </div> </div> 
        </div> 
      </div> 
    );
};

// ==============================================================================
//  *** NAYA CARD COMPONENT *** (Premium Image Card)
// ==============================================================================
const SolutionCard = ({ icon: Icon, title, description, color, link, imageUrl }: { 
  icon: React.ElementType, 
  title: string, 
  description: string, 
  color: string, 
  link: string,
  imageUrl: string // Naya prop
}) => {
  const colorClasses = {
    cyan: { text: 'text-cyan-400' },
    blue: { text: 'text-blue-400' },
    fuchsia: { text: 'text-fuchsia-400' },
  }[color] || { text: 'text-neutral-400' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.3 }}
      className="h-full"
    >
      <Link 
        href={link} 
        className={`group relative block h-[500px] w-full bg-neutral-900 rounded-2xl border border-neutral-800 shadow-lg overflow-hidden
                    transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-neutral-800/50`}
      >
        {/* Background Image (Zoom on hover) */}
        <img
          src={imageUrl}
          alt={`${title} background`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
        
        {/* Content (Pushed to bottom) */}
        <div className="relative z-20 flex flex-col justify-end h-full p-8 text-left">
          <div className={`p-3 rounded-lg bg-neutral-900/80 self-start mb-4 border border-neutral-700 ${colorClasses.text}`}>
            <Icon className="h-7 w-7" />
          </div>
          <h3 className={`font-bold text-3xl mb-2 text-white`}>{title}</h3>
          <p className="text-sm text-neutral-300 mb-6">{description}</p>
          <div className={`text-sm font-semibold ${colorClasses.text} flex items-center transition-transform group-hover:translate-x-1`}>
            Learn More <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};


// ==============================================================================
//  MAIN HOME PAGE COMPONENT (HERO UPDATED)
// ==============================================================================
export default function HomePage() {
  const { setIsHeroButtonVisible } = useEcobotContext();
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { scrollYProgress } = useScroll({ target: contentRef, offset: ["start start", "end end"] });
  const backgroundColor = useTransform( scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], ["#000000", "#080808", "#111111", "#080808", "#000000", "#000000"]);
  const sectionAnimation = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  useEffect(() => {
     const observer = new IntersectionObserver(([entry]) => { setIsHeroButtonVisible(entry.isIntersecting); }, { threshold: 0.5 }); const currentRef = heroButtonRef.current; if (currentRef) observer.observe(currentRef); return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [setIsHeroButtonVisible]);

  const handleQuizClick = (topic: string) => {
     router.push(`/quiz/${topic}`);
  };

  return (
    <>
      {/* Styles (Cleaned up) */}
      <style>{`
          body { background-color: #000; color: #E6EDF3; }
          .animated-gradient { background: linear-gradient(-45deg, #33d7b1, #3B82F6, #C026D3, #22d3ee); background-size: 400% 400%; animation: gradient 10s ease infinite; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; } 
          @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } 
          .ticker-wrap { animation: ticker 40s linear infinite; } 
          @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
          .animate-fade-in { opacity: 0; animation: fadeIn 1s ease-out forwards; } 
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <main>
        {/* === NAYA HERO SECTION (with Background Image) === */}
        <section 
          className="h-screen w-full flex flex-col items-center justify-center relative"
          // --- YEH RAHI BACKGROUND IMAGE ---
          // ⚠️ IMPORTANT: Aapko ye URL/path apni image se replace karna hoga
          style={{
            backgroundImage: "url('https://wallpapers.com/images/hd/4k-earth-surreal-look-v85atk12miu0j8u8.jpg')", // Ek high-quality image daalein
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed' // Parallax effect
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/70 z-0"></div>

          {/* Content (z-10 ke saath upar) */}
          <div className="text-center px-4 z-10 flex flex-col items-center animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight">
              Ecoverse
            </h1>
            <span className="block mt-2 text-4xl md:text-5xl font-extrabold animated-gradient">
              AI for a Better Planet.
            </span>
            <p className="mt-8 text-lg md:text-xl text-neutral-200 max-w-3xl mx-auto" style={{ animationDelay: '0.2s' }}>
              Pioneering data-driven solutions to monitor, analyze, and combat critical environmental challenges.
            </p>
            <div ref={heroButtonRef} className="mt-12" style={{ animationDelay: '0.4s' }}>
              <EcobotButton />
            </div>
            <div className="mt-8 flex gap-4" style={{ animationDelay: '0.6s' }}>
              <Link href="/dashboard" className="text-neutral-200 font-medium py-2 px-4 rounded-full border border-neutral-600 bg-black/20 backdrop-blur-sm hover:bg-neutral-800 hover:text-white transition-colors">
                View Dashboard
              </Link>
              <a href="#citizen-science" className="text-neutral-200 font-medium py-2 px-4 rounded-full border border-neutral-600 bg-black/20 backdrop-blur-sm hover:bg-neutral-800 hover:text-white transition-colors">
                Report an Issue
              </a>
            </div>
          </div>
        </section>
        
        {/* Data Ticker */}
        <DataTicker />
        
        {/* Main Content Sections */}
        <motion.div ref={contentRef} style={{ backgroundColor, transition: 'background-color 0.3s ease-in-out' }} className="relative">
            
            {/* === NAYA 3-CARD SECTION (PREMIUM CARDS) === */}
            <motion.section id="services" className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <div className="container mx-auto px-6">
                <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={sectionAnimation}>
                  <h2 className="text-4xl font-bold text-white">Explore Our Core Domains</h2>
                  <p className="text-lg text-neutral-400 mt-4">We leverage advanced AI to monitor and protect the core elements of our world.</p>
                </motion.div>
                <div className="grid md:grid-cols-3 gap-8">
                  <SolutionCard
                    icon={Wind}
                    title="Air"
                    description="Real-time air quality monitoring, pollution source tracking, and predictive weather modeling."
                    color="cyan"
                    link="/air"
                    // ⚠️ IMPORTANT: Apni image ka path yahaan daalein
                    imageUrl="/images/air-card.jpg" // Example path
                  />
                  <SolutionCard
                    icon={Droplets}
                    title="Water"
                    description="AI-powered flood & drought forecasting, water quality analysis, and smart resource management."
                    color="blue"
                    link="/water"
                    // ⚠️ IMPORTANT: Apni image ka path yahaan daalein
                    imageUrl="/images/water-card.jpg" // Example path
                  />
                  <SolutionCard
                    icon={Mountain}
                    title="Land"
                    description="Automated deforestation detection, sustainable agriculture insights, and crop disease diagnosis."
                    color="fuchsia"
                    link="/land"
                    // ⚠️ IMPORTANT: Apni image ka path yahaan daalein
                    imageUrl="/images/land-card.jpg" // Example path
                  />
                </div>
              </div>
            </motion.section>

            {/* Citizen Science Hub Section */}
            <motion.section id="citizen-science" className="py-24 bg-neutral-950 border-y border-neutral-800" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <div className="container mx-auto px-6">
                <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={sectionAnimation}>
                  <h2 className="text-4xl font-bold text-white">Become a Citizen Scientist</h2>
                  <p className="text-lg text-neutral-400 mt-4">See a problem? Report it. Help us crowdsource real-time data by uploading an image of any environmental issue you find.</p>
                </motion.div>
                <CitizenScienceHub />
              </div>
            </motion.section>
            
            {/* Quiz Section (Unchanged) */}
            <motion.section id="quiz" className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <div className="container mx-auto px-6">
                <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={sectionAnimation}>
                  <h2 className="text-4xl font-bold text-white">Test Your Eco-IQ</h2>
                  <p className="text-lg text-neutral-400 mt-4">Engage with our platform, earn points, and see how much you know about our planet's core domains.</p>
                </motion.div>
                <div className="bg-neutral-900 border border-neutral-800 p-8 md:p-12 rounded-2xl shadow-xl max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <motion.div variants={sectionAnimation}>
                      <button onClick={() => handleQuizClick('air')} className="w-full h-full p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-cyan-500 hover:bg-neutral-700 transition-all group">
                        <Wind className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Air Quality Quiz</h3>
                        <p className="text-sm text-neutral-400 mb-4">Test your knowledge on AQI, pollutants, and atmospheric science.</p>
                        <span className="font-bold text-green-500 group-hover:text-green-400">Start Quiz &rarr;</span>
                      </button>
                    </motion.div>
                    <motion.div variants={sectionAnimation}>
                      <button onClick={() => handleQuizClick('water')} className="w-full h-full p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-blue-500 hover:bg-neutral-700 transition-all group">
                        <Droplets className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Water Cycle Quiz</h3>
                        <p className="text-sm text-neutral-400 mb-4">How much do you know about hydrology, water quality, and conservation?</p>
                        <span className="font-bold text-green-500 group-hover:text-green-400">Start Quiz &rarr;</span>
                      </button>
                    </motion.div>
                    <motion.div variants={sectionAnimation}>
                      <button onClick={() => handleQuizClick('land')} className="w-full h-full p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-fuchsia-500 hover:bg-neutral-700 transition-all group">
                        <Trees className="h-10 w-10 text-fuchsia-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Land & Ecology Quiz</h3>
                        <p className="text-sm text-neutral-400 mb-4">Explore topics like deforestation, agriculture, and biodiversity.</p>
                        <span className="font-bold text-green-500 group-hover:text-green-400">Start Quiz &rarr;</span>
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Eco-Verify Section */}
            <motion.section className="py-24 bg-neutral-950 border-y border-neutral-800" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <div className="container mx-auto px-6">
                <EcoVerify />
              </div>
            </motion.section>

            {/* Climate Impact Simulator Section */}
            <motion.section className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <div className="container mx-auto px-6">
                <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={sectionAnimation}>
                  <h2 className="text-4xl font-bold text-white">Climate Impact Simulator</h2>
                  <p className="text-lg text-neutral-400 mt-4">See the future. Understand how small changes in global temperature and deforestation can have massive consequences.</p>
                </motion.div>
                <ClimateImpactSimulator />
              </div>
            </motion.section>

            {/* Unseen Crisis Section */}
            <motion.section className="py-24" variants={sectionAnimation} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <div className="container mx-auto px-6">
                <motion.div className="max-w-4xl mx-auto text-center mb-16" variants={sectionAnimation}>
                  <h2 className="text-4xl font-bold text-white">The Unseen Crisis</h2>
                  <p className="text-lg text-neutral-400">Our planet is facing unprecedented challenges. Technology is our greatest ally in understanding and combating them.</p>
                </motion.div>
                <div className="bg-neutral-900 p-8 md:p-12 rounded-2xl shadow-xl max-w-5xl mx-auto text-left text-neutral-300 space-y-4 leading-relaxed border border-neutral-800">
                  <p>From melting polar ice caps to the increasing frequency of extreme weather events, the signs of climate change are undeniable. Rising global temperatures disrupt delicate ecosystems, threatening biodiversity and altering weather patterns that millions rely on for agriculture and survival.</p>
                  <p>Pollution in our air and water poses a direct threat to public health, while unsustainable land use leads to deforestation, destroying vital carbon sinks and displacing wildlife. These are not isolated issues; they are interconnected facets of a global crisis that demands immediate, intelligent, and data-driven action.</p>
                  <p>At Bit-Climate, we believe that by harnessing Artificial Intelligence, we can turn vast amounts of environmental data into clear, actionable insights, empowering us to make smarter decisions for a sustainable future.</p>
                </div>
              </div>
            </motion.section>
            
            {/* Footer */}
            <motion.footer className="bg-neutral-950 text-neutral-500 py-12 border-t border-neutral-800" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.0 }}>
              <div className="container mx-auto px-6 text-center">
                <p>&copy; 2025 Bit-Climate. All Rights Reserved. Building a resilient planet with AI.</p>
              </div>
            </motion.footer>
        </motion.div>
      </main>
    </>
  );
}