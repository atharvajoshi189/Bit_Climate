// src/app/ecobot/page.tsx

"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, User, Bot, Leaf, Zap, Mic, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { motion, AnimatePresence } from 'framer-motion'; // Added Framer Motion

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const suggestedPrompts = [
  "How does deforestation affect our planet?",
  "Explain the impact of rising sea levels.",
  "What are some simple ways to reduce my carbon footprint?",
  "Tell me about renewable energy sources."
];

export default function EcobotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hello! I am Ecobot. Ask me anything about our planet, climate change, or what you can do to help.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false); // Ye hydration error fix karega

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);
  
  // --- HYDRATION ERROR FIX ---
  // Ye useEffect sirf client par chalta hai, 
  // aur jab ye chalta hai tabhi form render hoga.
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('http://127.0.0.1:8000/chatbot/ecobot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) throw new Error("API response error");
      
      const data = await response.json();
      const botMessage: Message = { id: Date.now() + 1, text: data.reply, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to my brain. Please try again later.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* --- Styles (Updated for new theme) --- */}
      <style>{`
        /* Purane float/orb/glow animations hata diye */
        @keyframes message-slide-in { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .message-anim { 
          animation: message-slide-in 0.3s ease-out forwards; 
        }
        /* Custom scrollbar (theme se match karta hua) */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #171717; /* neutral-900 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040; /* neutral-700 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #525252; /* neutral-600 */
        }
      `}</style>

      {/* --- NAYA UI (Theme se match karta hua) --- */}
      <div className="min-h-screen w-full flex flex-col bg-black text-neutral-200 overflow-hidden">
        
        {/* Naya Header (Back button ke saath) */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              Back to Home
            </Link>
            <h1 className="text-xl font-bold text-teal-400 flex items-center gap-2">
              <Leaf size={20} /> Ecobot
            </h1>
            {/* Placeholder to balance the header */}
            <div className="w-24"></div> 
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center w-full px-4 pt-24 pb-4">
          {/* Naya Chat Container (Theme se match karta hua) */}
          <div className="w-full max-w-4xl h-[calc(100vh-120px)] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    className={`flex items-start gap-3 max-w-2xl message-anim ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      msg.sender === 'user' 
                        ? 'bg-green-800 border-green-700' 
                        : 'bg-neutral-700 border-neutral-600'
                    }`}>
                      {msg.sender === 'user' ? <User size={16} className="text-green-300" /> : <Bot size={16} className="text-teal-300" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-green-600 text-white rounded-br-none' // User bubble
                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none' // Bot bubble
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div 
                  className="flex items-start gap-3 mr-auto message-anim"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-teal-300 animate-pulse"/>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-neutral-800 rounded-bl-none">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />

              {/* Suggested Prompts (Theme se match karte hue) */}
              {isClient && messages.length === 1 && !isLoading && (
                <motion.div 
                  className="pt-8 message-anim"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <h4 className="text-sm text-neutral-400 mb-4 text-center">Or try one of these suggestions:</h4>
                    <div className="flex flex-wrap justify-center gap-3">
                      {suggestedPrompts.map(prompt => (
                        <button 
                          key={prompt} 
                          onClick={() => sendMessage(prompt)} 
                          className="text-left text-sm text-neutral-300 bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-full hover:bg-neutral-700 hover:border-neutral-600 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                </motion.div>
              )}
            </div>

            {/* --- HYDRATION ERROR FIX: Form sirf client par render hoga --- */}
            {isClient && (
              <form onSubmit={handleFormSubmit} className="p-4 border-t border-neutral-800 flex-shrink-0">
                <div className="flex items-center gap-3 bg-neutral-800 p-2 rounded-full border border-neutral-700 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-transparent text-white px-4 py-2 focus:outline-none placeholder-neutral-500"
                    placeholder="Ask Ecobot anything..."
                    disabled={isLoading}
                  />
                  
                  {/* Voice Assistant Link Button (Theme updated) */}
                  <Link
                    href="/voice-assistant"
                    className={`p-3 rounded-full text-neutral-300 bg-neutral-700 hover:bg-neutral-600 transition-all duration-200 active:scale-90
                      ${isLoading ? 'hidden' : 'inline-flex'}
                    `}
                    title="Open Voice Assistant"
                  >
                    <Mic size={20} />
                  </Link>

                  {/* Send Button (Theme updated) */}
                  <button
                    type="submit"
                    disabled={isLoading || !input}
                    className="bg-green-600 hover:bg-green-700 p-3 rounded-full text-white transition-all duration-200 active:scale-90 disabled:bg-neutral-600 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            )}
            
          </div>
        </main>
      </div>
    </>
  );
}