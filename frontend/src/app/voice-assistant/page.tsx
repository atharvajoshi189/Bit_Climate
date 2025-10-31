"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { Mic, MicOff, ArrowLeft } from 'lucide-react'; // X ko ArrowLeft se replace kar diya
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Type declarations (Unchanged) ---
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// --- Sphere Colors (Unchanged) ---
const COLOR_IDLE = new THREE.Color(0x888888);      // Dim Grey
const COLOR_LISTENING = new THREE.Color(0xFFD700); // Golden
const COLOR_SPEAKING = new THREE.Color(0x40E0D0);  // Teal (Theme Match)

export default function VoiceAssistantPage() {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);

  // --- States ---
  const [statusText, setStatusText] = useState("Initializing...");
  const [isListening, setIsListening] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const [bgColor, setBgColor] = useState('bg-black');
  const [isClient, setIsClient] = useState(false);

  // --- Refs (Unchanged) ---
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sphereMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isListeningRef = useRef(isListening);
  const isBotSpeakingRef = useRef(isBotSpeaking);
  const isLoadingRef = useRef(isLoading);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array | null>(null);
  const isMutedRef = useRef(isMuted); // Naya Ref, state sync ke liye

  // --- State Ref Updaters (Updated) ---
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isBotSpeakingRef.current = isBotSpeaking; }, [isBotSpeaking]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]); // Naya Effect

  // --- Hydration Error Fix ---
  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Background Color Changer ---
  useEffect(() => {
    if (isBotSpeaking || isLoading) {
      setBgColor('bg-neutral-950'); // Dark section background
    } else {
      setBgColor('bg-black');
    }
  }, [isBotSpeaking, isLoading]);

  // --- 1. Audio Analyser Setup (Unchanged) ---
  useEffect(() => {
    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        audioAnalyserRef.current = analyser;
        audioDataArrayRef.current = dataArray;
      } catch (err) {
        console.error("Error setting up audio analyser:", err);
        setStatusText("Mic permission denied. Please allow mic access and refresh.");
        setIsMuted(true);
      }
    };
    setupAudio();
  }, []);

  // --- Load Voices (Unchanged) ---
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) setVoices(availableVoices);
    };
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // --- 2. Three.js Setup (Bug Fix Applied) ---
  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 25;
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    const clock = new THREE.Clock();
    const particleCount = 8000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const particleMaterial = new THREE.PointsMaterial({ color: COLOR_IDLE, size: 0.04 });
    sphereMaterialRef.current = particleMaterial;
    const radius = 10;
    for (let i = 0; i < particleCount * 3; i += 3) {
      let theta = Math.random() * 2 * Math.PI;
      let phi = Math.acos(Math.random() * 2 - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions[i] = x; positions[i + 1] = y; positions[i + 2] = z;
      originalPositions[i] = x; originalPositions[i + 1] = y; originalPositions[i + 2] = z;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    (particleGeometry as any).originalPositions = originalPositions;
    const particleSphere = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSphere);
    const handleResize = () => {
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // --- 3. Animation Loop (FIXED) ---
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const isIdle = !isListeningRef.current && !isBotSpeakingRef.current && !isLoadingRef.current;
      const positions = (particleSphere.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
      const originalPos = (particleSphere.geometry as any).originalPositions;

      // Pulse Logic (Unchanged)
      if (isIdle) {
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (originalPos[i] - positions[i]) * 0.1;
          positions[i+1] += (originalPos[i+1] - positions[i+1]) * 0.1;
          positions[i+2] += (originalPos[i+2] - positions[i+2]) * 0.1;
        }
      } else if (isListeningRef.current && audioAnalyserRef.current && audioDataArrayRef.current) {
        const analyser = audioAnalyserRef.current;
        const dataArray = audioDataArrayRef.current;
        const buffer = new Uint8Array(dataArray.length);
        analyser.getByteFrequencyData(buffer);
        for (let i = 0; i < positions.length; i += 3) {
          const dataIndex = (i / 3) % buffer.length;
          const amplitude = buffer[dataIndex];
          const displacement = (amplitude / 255.0) * 0.6; 
          const pulse = 1.0 + displacement;
          positions[i] = originalPos[i] * pulse;
          positions[i+1] = originalPos[i+1] * pulse;
          positions[i+2] = originalPos[i+2] * pulse;
        }
      } else if (isBotSpeakingRef.current || isLoadingRef.current) {
        const pulseFactor = 1.0 + Math.sin(elapsedTime * 5) * 0.1; 
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = originalPos[i] * pulseFactor;
          positions[i+1] = originalPos[i+1] * pulseFactor;
          positions[i+2] = originalPos[i+2] * pulseFactor;
        }
      }

      // *** BUG FIX: Rotation hamesha chalu rahega ***
      particleSphere.rotation.x += 0.0002;
      particleSphere.rotation.y += 0.0005;

      (particleSphere.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      currentMount.removeChild(renderer.domElement);
      scene.remove(particleSphere);
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // --- 4. Web Speech API Setup (Error Handling Updated) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusText("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    // *** ERROR FIX: "aborted" error ko ignore karein ***
    recognition.onerror = (e) => {
      if (e.error === 'aborted') {
        // Ye expected error hai jab hum component chhodte hain. Ise ignore karo.
        console.log("Speech recognition aborted (cleanup).");
        return; 
      }
      console.error("Speech Error:", e.error); // Doosre errors ko log karo
      if (e.error === 'no-speech' && !isMutedRef.current) { // isMutedRef use karo
         try { recognition.start(); } catch(err) {}
      }
    };

    // *** UI FIX: "You said" text hata diya ***
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript && !isLoadingRef.current) {
        if (isBotSpeakingRef.current) {
          speechSynthesis.cancel();
          setIsBotSpeaking(false);
        }
        // setStatusText(`You said: ${transcript}`); // <-- YEH LINE HATA DI
        processCommand(transcript);
      }
    };

    try {
        recognition.start();
        setStatusText("Listening...");
    } catch (e) {
        console.error("Could not auto-start recognition:", e);
        setStatusText("Click the mic to start listening.");
        setIsMuted(true);
    }
    return () => {
      // Cleanup function (ye 'aborted' error trigger karega)
      recognition.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // --- 5. Sphere Color Change (Unchanged) ---
  useEffect(() => {
    if (!sphereMaterialRef.current) return;
    let color = COLOR_IDLE;
    if (isLoading) color = COLOR_SPEAKING;
    else if (isBotSpeaking) color = COLOR_SPEAKING;
    else if (isListening) color = COLOR_LISTENING;
    sphereMaterialRef.current.color.lerp(color, 0.1);
  }, [isListening, isBotSpeaking, isLoading]);

  // --- 6. AI Logic (Unchanged) ---
  const processCommand = async (command: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/chatbot/ecobot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: command }),
      });
      if (!response.ok) throw new Error("API response error");
      const data = await response.json();
      speak(data.reply);
    } catch (error) {
      console.error(error);
      speak("Sorry, I'm having trouble connecting to my brain.");
    }
  };
  
  // --- 7. Bot Speaking Logic (UI Text Fix) ---
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    recognitionRef.current?.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    const lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.lang = lang;
    if (voices.length > 0) {
      // Voice selection logic... (unchanged)
      let selectedVoice = null;
      if (isHindi) {
        selectedVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.includes('Google') || v.name.includes('Microsoft')));
      } else {
        selectedVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft')));
      }
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang === lang);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    utterance.onstart = () => {
      setIsBotSpeaking(true);
      setIsLoading(false);
      setStatusText(text); // <-- Bot ka response yahaan display hoga
    };
    utterance.onend = () => {
      setIsBotSpeaking(false);
      // *** UI FIX: Reset text to a neutral state ***
      setStatusText(isMutedRef.current ? "Mic is muted. Click to unmute." : "Listening...");
      
      if (!isMutedRef.current) { // isMutedRef use karo
        try { recognitionRef.current?.start(); } catch(e) {}
      }
    };
    speechSynthesis.speak(utterance);
  };

  // --- 8. Button Click Handlers (Updated) ---
  const handleMuteToggle = () => {
    if (isMuted) {
      try { recognitionRef.current?.start(); } catch(e) {}
      setIsMuted(false);
      setStatusText("Listening...");
    } else {
      recognitionRef.current?.stop();
      setIsMuted(true);
      setStatusText("Mic is muted. Click to unmute.");
    }
  };

  // --- NAYA: Mic Button Style Logic (Theme Match) ---
  const getMicButtonClass = () => {
    let baseClass = "p-5 rounded-full border-2 transition-all duration-300 transform active:scale-90 shadow-2xl";
    if (isMuted) {
      return `${baseClass} bg-neutral-900 border-red-500 text-red-400 hover:bg-red-900/50`;
    }
    if (isBotSpeaking || isLoading) {
      return `${baseClass} bg-teal-900/50 border-teal-500 text-teal-400 shadow-teal-500/30 animate-pulse`; // Speaking par pulse
    }
    if (isListening) {
      return `${baseClass} bg-yellow-900/50 border-yellow-500 text-yellow-400 shadow-yellow-500/30`; // Listening par yellow
    }
    return `${baseClass} bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800`;
  };


  return (
    // --- NAYA: UI Wrapper ---
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden ${bgColor} transition-colors duration-500`}>
      {/* 1. Three.js Canvas Container (Unchanged) */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* 2. UI Layer (Hydration Safe) */}
      {isClient && (
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full p-8 md:p-12">
          
          {/* NAYA: Back Button (Theme Match) */}
          <Link 
            href="/ecobot" 
            className="absolute top-8 left-8 z-20 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-neutral-900/50 hover:bg-neutral-800 px-4 py-2 rounded-full border border-neutral-700"
            title="Go Back to Ecobot Chat"
          >
            <ArrowLeft size={18} />
            Back to Chat
          </Link>

          {/* NAYA: Status Text (Top-Right Corner) */}
          <AnimatePresence>
            {statusText && ( // Sirf tab dikhao jab statusText empty na ho
              <motion.div
                key={statusText}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                // NAYA POSITION AUR STYLE:
                className="absolute top-24 right-8 z-20 max-w-sm p-4 bg-neutral-900/80 border border-neutral-700 rounded-lg shadow-lg backdrop-blur-md"
              >
                <p className="text-right text-base font-medium text-neutral-200">
                  {statusText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-grow" /> {/* Ye sphere ko center me rakhega */}

          {/* NAYA: Button Container (Theme Match) */}
          <div className="flex items-center justify-center pb-8 md:pb-12">
            <button
              onClick={handleMuteToggle}
              className={getMicButtonClass()}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
              disabled={isBotSpeaking || isLoading} 
            >
              {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}