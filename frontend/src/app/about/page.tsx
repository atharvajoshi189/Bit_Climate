// src/app/about/page.tsx
"use client";

import { Target, AlertTriangle, Cpu, Users, ArrowRight, BrainCircuit, Sparkles, Globe, Layers, Database, Wind, Droplets, Mountain } from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Tech Stack Logo Component (Updated Theme)
const TechCategory = ({ title, techs, delay = 0 }: { title: string, techs: string[], delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true, amount: 0.5 }}
    className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 h-full shadow-lg" // THEME UPDATE
  >
    <h3 className="text-lg font-semibold text-green-400 mb-4">{title}</h3> 
    <div className="flex flex-wrap gap-2">
      {techs.map((tech) => (
        <span key={tech} className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-sm font-medium">
          {tech} {/* <-- YEH FIX KAR DIYA HAI */}
        </span>
      ))}
    </div>
  </motion.div>
);

// Core AI Model Card (Updated Theme)
const CoreModelCard = ({ icon: Icon, title, description, color, delay = 0 }: { icon: React.ElementType, title: string, description: string, color: string, delay?: number }) => {
  // Color classes ko theme se align kiya
  const colorClasses = {
    cyan: { text: 'text-cyan-400', border: 'hover:border-cyan-500', shadow: 'hover:shadow-cyan-500/10' },
    blue: { text: 'text-blue-400', border: 'hover:border-blue-500', shadow: 'hover:shadow-blue-500/10' },
    fuchsia: { text: 'text-fuchsia-400', border: 'hover:border-fuchsia-500', shadow: 'hover:shadow-fuchsia-500/10' },
  }[color] || { text: 'text-neutral-400', border: 'hover:border-neutral-700', shadow: 'hover:shadow-neutral-500/10' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      viewport={{ once: true, amount: 0.5 }}
      className={`bg-neutral-900 p-6 rounded-2xl border border-neutral-800 transition-all duration-300 ${colorClasses.border} ${colorClasses.shadow} shadow-lg flex flex-col`} // THEME UPDATE
    >
      <div className={`p-3 rounded-lg bg-neutral-800 self-start mb-4 border border-neutral-700 ${colorClasses.text}`}> 
        <Icon className="h-6 w-6" />
      </div>
      <h3 className={`font-semibold text-xl mb-2 ${colorClasses.text}`}>{title}</h3> 
      <p className="text-sm text-neutral-300 flex-grow">{description}</p> 
    </motion.div>
  );
};


export default function AboutPage() {
  const scrollRef = useRef(null);
  
  // Fade in animation (unchanged)
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" },
    viewport: { once: true, amount: 0.3 }
  };

  return (
    <>
      {/* Background Styling (Updated Theme) */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black" /> 
      {/* Clean background, no blobs/constellations */}

      <main className="min-h-screen text-white" ref={scrollRef}>
        
        {/* --- SECTION 1: FULL-SCREEN HERO --- */}
        <motion.section
          className="h-screen w-full flex flex-col items-center justify-center text-center p-6 relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0 }}
          >
            <div className="inline-block bg-neutral-900 p-4 rounded-full mb-6 border border-neutral-800 shadow-lg"> 
              <Globe className="h-8 w-8 text-green-400" /> 
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white"> 
              The world is sending signals.
            </h1>
            <p className="text-2xl md:text-3xl text-neutral-300 max-w-4xl mx-auto font-light animated-gradient-text"> 
              We are building the Artificial Intelligence to listen.
            </p>
          </motion.div>
          
          {/* Scroll Down Indicator (unchanged) */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 10 }}
            transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute bottom-12 text-sm text-neutral-500" 
          >
            Scroll to begin the journey
          </motion.div>
        </motion.section>

        {/* --- SECTION 2: THE NARRATIVE TIMELINE --- */}
        <section className="relative py-24 md:py-32 max-w-3xl mx-auto px-6">
          {/* The Vertical Line (Updated Theme) */}
          <motion.div
            className="absolute left-7 md:left-9 top-0 w-1 bg-neutral-800 rounded-full z-0" 
            style={{ height: '100%' }}
            initial={{ scaleY: 0, originY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
          />
          {/* Nayi animated line */}
          <motion.div
            className="absolute left-7 md:left-9 top-0 w-1 bg-green-500 rounded-full z-0" 
            style={{ height: '100%' }}
            initial={{ scaleY: 0, originY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          />


          {/* --- Narrative Step 1: The Challenge (Updated Theme) --- */}
          <motion.div className="relative flex items-start gap-6 md:gap-8 mb-20 z-10" {...fadeIn}>
            <motion.div
              className="flex-shrink-0 bg-neutral-900 p-4 rounded-full border border-red-500 shadow-lg shadow-red-500/10" 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 15 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <AlertTriangle className="h-7 w-7 md:h-8 md:w-8 text-red-400" />
            </motion.div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-red-400">The Challenge</h2>
              <p className="text-lg text-neutral-300 leading-relaxed"> 
                Our planet is in crisis. We are drowning in vast amounts of complex environmental data but <strong className="text-white">starving for clear, actionable insights.</strong>
              </p>
            </div>
          </motion.div>

          {/* --- Narrative Step 2: The Turning Point (Updated Theme) --- */}
          <motion.div className="relative flex items-start gap-6 md:gap-8 mb-20 z-10" {...fadeIn}>
            <motion.div
              className="flex-shrink-0 bg-neutral-900 p-4 rounded-full border border-blue-500 shadow-lg shadow-blue-500/10" 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <BrainCircuit className="h-7 w-7 md:h-8 md:w-8 text-blue-400" />
            </motion.div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-blue-400">The Turning Point</h2>
              <p className="text-lg text-neutral-300 leading-relaxed"> 
                Standard solutions are not enough. We realized the only way to fight this complexity is with advanced intelligence capable of <strong className="text-white">seeing patterns humans can't</strong>.
              </p>
            </div>
          </motion.div>

          {/* --- Narrative Step 3: Our Mission (Updated Theme) --- */}
          <motion.div className="relative flex items-start gap-6 md:gap-8 z-10" {...fadeIn}>
            <motion.div
              className="flex-shrink-0 bg-neutral-900 p-4 rounded-full border border-green-500 shadow-lg shadow-green-500/10" 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <Target className="h-7 w-7 md:h-8 md:w-8 text-green-400" /> 
            </motion.div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-green-400">Our Mission</h2> 
              <p className="text-lg text-neutral-300 leading-relaxed"> 
                To empower everyone with <strong className="text-white">accessible, data-driven AI tools.</strong> We translate complex climate data into simple, actionable insights that drive real-world change.
              </p>
            </div>
          </motion.div>
        </section>
        {/* --- END OF TIMELINE --- */}


        {/* --- SECTION 3: THE AI CORE (Updated Theme) --- */}
        <section className="py-24 md:py-32 bg-neutral-950 border-y border-neutral-800"> 
          <div className="container mx-auto px-6">
            <motion.div className="text-center max-w-3xl mx-auto mb-16" {...fadeIn}>
              <div className="inline-block bg-neutral-900 p-4 rounded-full mb-6 border border-neutral-800 shadow-lg"> 
                <Cpu className="h-8 w-8 text-fuchsia-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">The Bit Climate AI Core</h2> 
              <p className="text-lg text-neutral-400"> 
                Our approach is not a single tool, but an interconnected intelligence engine. We train specialized models to analyze and predict changes across our planet's three core domains.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <CoreModelCard
                icon={Wind}
                title="Atmospheric Monitoring"
                description="Tracking air quality, detecting GHG emissions, and predicting weather patterns with high accuracy."
                color="cyan"
                delay={0.1}
              />
              <CoreModelCard
                icon={Droplets}
                title="Aquatic Intelligence"
                description="Assessing flood/drought risks, monitoring water quality, and optimizing water resource management."
                color="blue"
                delay={0.2}
              />
              <CoreModelCard
                icon={Mountain}
                title="Terrestrial Analysis"
                description="Detecting deforestation, diagnosing crop diseases, and recommending sustainable land use practices."
                color="fuchsia"
                delay={0.3}
              />
            </div>
          </div>
        </section>


        {/* --- SECTION 4: TECHNICAL ARCHITECTURE (Updated Theme) --- */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <motion.div className="text-center max-w-3xl mx-auto mb-16" {...fadeIn}>
              <div className="inline-block bg-neutral-900 p-4 rounded-full mb-6 border border-neutral-800 shadow-lg"> 
                <Layers className="h-8 w-8 text-neutral-400" /> 
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Technical Architecture</h2> 
              <p className="text-lg text-neutral-400"> 
                Built on a modern, scalable, and high-performance stack designed for data-intensive AI applications.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <TechCategory
                title="Frontend"
                techs={['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion']}
                delay={0.1}
              />
              <TechCategory
                title="AI & Data Science"
                techs={['Python', 'FastAPI', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'Pandas']}
                delay={0.2}
              />
              <TechCategory
                title="Database & Auth"
                techs={['Supabase', 'PostgreSQL', 'Prisma (ORM)', 'Clerk (Auth)']}
                delay={0.3}
              />
              <TechCategory
                title="Infrastructure"
                techs={['Render', 'Vercel', 'Docker', 'GitHub Actions']}
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 5: CALL TO ACTION (Updated Theme) --- */}
        <section className="py-24 text-center bg-neutral-950 border-t border-neutral-800"> 
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Join Us in Making a Difference</h2> 
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10"> 
              Our tools are just the beginning. Explore the platform, use the insights, and become part of a data-driven movement for a sustainable planet.
            </p>
            {/* --- UPDATED CTA BUTTON --- */}
            <Link href="/dashboard" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 group transform hover:scale-105 shadow-lg hover:shadow-green-500/20 text-lg"> 
              Explore the Dashboard
              <ArrowRight className="inline-block w-6 h-6 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </section>

      </main>

      {/* Styles (Unchanged) */}
      <style>{`
        .animated-gradient-text {
          background: linear-gradient(-45deg, #33d7b1, #3B82F6, #C026D3, #22d3ee);
          background-size: 300% 300%;
          animation: gradient 8s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}