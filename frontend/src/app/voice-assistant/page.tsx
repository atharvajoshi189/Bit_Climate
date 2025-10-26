"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { X, Mic, MicOff } from 'lucide-react';

// Type declaration for SpeechRecognition
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

// --- MODIFIED: Video ke Colors ---
const COLOR_IDLE = new THREE.Color(0x888888);      // Dim Grey
const COLOR_LISTENING = new THREE.Color(0xFFD700); // Golden
const COLOR_SPEAKING = new THREE.Color(0x40E0D0);  // Teal / Sky Blue (video jaisa)

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
  // --- NEW: Background Color State ---
  const [bgColor, setBgColor] = useState('bg-black');

  // --- Refs (Unchanged) ---
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sphereMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isListeningRef = useRef(isListening);
  const isBotSpeakingRef = useRef(isBotSpeaking);
  const isLoadingRef = useRef(isLoading);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array | null>(null);

  // --- State Ref Updaters (Unchanged) ---
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isBotSpeakingRef.current = isBotSpeaking; }, [isBotSpeaking]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  // --- NEW: Background Color Changer ---
  useEffect(() => {
    if (isBotSpeaking || isLoading) {
      setBgColor('bg-[#0A192F]'); // Dark Navy Blue
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

  // --- 2. Three.js Setup (Unchanged) ---
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

    // --- 3. MODIFIED: Animation Loop (Pulse Logic) ---
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const isIdle = !isListeningRef.current && !isBotSpeakingRef.current && !isLoadingRef.current;
      const positions = (particleSphere.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
      const originalPos = (particleSphere.geometry as any).originalPositions;

      if (isIdle) {
        // --- IDLE STATE: Rotate ---
        particleSphere.rotation.x += 0.0002;
        particleSphere.rotation.y += 0.0005;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (originalPos[i] - positions[i]) * 0.1;
          positions[i+1] += (originalPos[i+1] - positions[i+1]) * 0.1;
          positions[i+2] += (originalPos[i+2] - positions[i+2]) * 0.1;
        }
      } else if (isListeningRef.current && audioAnalyserRef.current && audioDataArrayRef.current) {
        // --- USER SPEAKING: Real Pulse ---
        const analyser = audioAnalyserRef.current;
        const dataArray = audioDataArrayRef.current;
        const buffer = new Uint8Array(dataArray.length);
        analyser.getByteFrequencyData(buffer);
        for (let i = 0; i < positions.length; i += 3) {
          const dataIndex = (i / 3) % buffer.length;
          const amplitude = buffer[dataIndex];
          // --- MODIFIED: Pulse ko strong banaya ---
          const displacement = (amplitude / 255.0) * 0.6; // 0.6 (was 0.2)
          const pulse = 1.0 + displacement;
          positions[i] = originalPos[i] * pulse;
          positions[i+1] = originalPos[i+1] * pulse;
          positions[i+2] = originalPos[i+2] * pulse;
        }
      } else if (isBotSpeakingRef.current || isLoadingRef.current) {
        // --- BOT SPEAKING / LOADING: Fake Pulse (Breathing) ---
        // --- MODIFIED: Pulse ko tez aur strong banaya ---
        const pulseFactor = 1.0 + Math.sin(elapsedTime * 5) * 0.1; // (was 4 and 0.03)
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = originalPos[i] * pulseFactor;
          positions[i+1] = originalPos[i+1] * pulseFactor;
          positions[i+2] = originalPos[i+2] * pulseFactor;
        }
      }
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

  // --- 4. Web Speech API Setup (Unchanged) ---
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
    recognition.onerror = (e) => {
      console.error("Speech Error:", e.error);
      if (e.error === 'no-speech' && !isMuted) {
         try { recognition.start(); } catch(err) {}
      }
    };
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript && !isLoadingRef.current) {
        if (isBotSpeakingRef.current) {
          speechSynthesis.cancel();
          setIsBotSpeaking(false);
        }
        setStatusText(`You said: ${transcript}`);
        processCommand(transcript);
      }
    };
    try {
        recognition.start();
        setStatusText("Ask me anything...");
    } catch (e) {
        console.error("Could not auto-start recognition:", e);
        setStatusText("Click the mic to start listening.");
        setIsMuted(true);
    }
    return () => {
      recognition.abort();
    };
  }, []);
  
  // --- 5. MODIFIED: Sphere Color Change ---
  useEffect(() => {
    if (!sphereMaterialRef.current) return;
    let color = COLOR_IDLE;
    if (isLoading) color = COLOR_SPEAKING;
    else if (isBotSpeaking) color = COLOR_SPEAKING;
    else if (isListening) color = COLOR_LISTENING;
    
    // Lerp (smooth transition) to the new color
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
  
  // --- 7. Bot Speaking Logic (Unchanged) ---
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    recognitionRef.current?.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    const lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.lang = lang;
    if (voices.length > 0) {
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
      setStatusText(text);
    };
    utterance.onend = () => {
      setIsBotSpeaking(false);
      setStatusText("Ask me anything...");
      if (!isMuted) {
        try { recognitionRef.current?.start(); } catch(e) {}
      }
    };
    speechSynthesis.speak(utterance);
  };

  // --- 8. Button Click Handlers (Unchanged) ---
  const handleCancelClick = () => {
    recognitionRef.current?.abort();
    speechSynthesis.cancel();
    router.push('/ecobot');
  };

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

  return (
    // --- MODIFIED: Dynamic Background Color ---
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden ${bgColor} transition-colors duration-500`}>
      {/* 1. Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* 2. UI Controls (Captions are hidden) */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full p-8 md:p-12">
        
        <div /> 
        <div className="flex-grow" />

        {/* 3. Buttons (Unchanged) */}
        <div className="flex items-center justify-center space-x-24 pb-8 md:pb-12">
          <button
            onClick={handleCancelClick}
            className="text-gray-400 hover:text-white transition-colors p-4 bg-gray-800/50 rounded-full"
            title="Go Back"
          >
            <X size={32} />
          </button>
          
          <button
            onClick={handleMuteToggle}
            className={`p-6 rounded-full text-white transition-all duration-300 transform active:scale-90
              ${isMuted ? 'bg-gray-600' : 'bg-transparent'}
              ${!isMuted && isListening ? 'animate-pulse' : ''}
            `}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
            disabled={isBotSpeaking || isLoading}
          >
            {isMuted ? <MicOff size={40} /> : <Mic size={40} />}
          </button>
        </div>
      </div>
    </div>
  );
}