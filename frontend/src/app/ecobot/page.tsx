// src/app/ecobot/page.tsx

"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link'; // <-- Naya Import
import { Send, User, Bot, Leaf, Zap, Mic } from 'lucide-react'; // <-- Mic Icon Import

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
  const [isClient, setIsClient] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);
  
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
      {/* --- Styles (UNCHANGED) --- */}
      <style>{`
        /* ... (Aapke saare existing styles yahan rahenge) ... */
        @keyframes float { 0% { transform: translateY(0px) rotate(0deg); opacity: 0.8; } 50% { transform: translateY(-30px) rotate(180deg); opacity: 1; } 100% { transform: translateY(0px) rotate(360deg); opacity: 0.8; } }
        @keyframes pulse-glow { 0% { box-shadow: 0 0 20px 0px rgba(51, 215, 177, 0.2); } 50% { box-shadow: 0 0 35px 8px rgba(51, 215, 177, 0.3); } 100% { box-shadow: 0 0 20px 0px rgba(51, 215, 177, 0.2); } }
        .orb { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(51, 215, 177, 0.4) 0%, rgba(51, 215, 177, 0) 70%); animation: float 15s infinite ease-in-out; }
        .chat-container-glow { animation: pulse-glow 8s infinite ease-in-out; }
        @keyframes message-slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .message-anim { animation: message-slide-in 0.5s ease-out forwards; }
      `}</style>

      <div className="min-h-screen w-full flex flex-col bg-[#0D1117] text-white overflow-hidden">
        
        <div className="orb" style={{ width: '200px', height: '200px', top: '25%', right: '25%', animationDuration: '18s', animationDelay: '2s' }}></div>
        <div className="pt-24"></div>

        <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10 -mt-8">
          <div className="w-full max-w-4xl h-[calc(100vh-150px)] flex flex-col bg-black/50 backdrop-blur-xl border border-teal-500/20 rounded-2xl shadow-2xl chat-container-glow">
            
            {/* ... (Aapka poora chat header aur message area waisa hi rahega) ... */}
            <div className="p-4 border-b border-gray-700/50 text-center flex-shrink-0">
              <h1 className="text-2xl font-bold text-teal-300 flex items-center justify-center gap-2">
                <Leaf /> Ecobot - Your Climate Companion
              </h1>
              <p className="text-sm text-gray-400">Powered by Llama 3</p>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {/* ... (messages.map, isLoading, suggested prompts sab yahan) ... */}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 max-w-2xl message-anim ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-500/30' : 'bg-teal-500/30'}`}>
                    {msg.sender === 'user' ? <User className="text-blue-300" /> : <Bot className="text-teal-300" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4 mr-auto message-anim">
                  <div className="w-10 h-10 rounded-full bg-teal-500/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="text-teal-300 animate-pulse"/>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-gray-800 rounded-bl-none">
                    <p className="text-gray-400 italic">Ecobot is thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
              {isClient && messages.length === 1 && !isLoading && (
                <div className="pt-8 text-center message-anim">
                    <h4 className="text-lg text-gray-400 mb-4 flex items-center justify-center gap-2"><Zap /> Start a conversation</h4>
                    <div className="flex flex-wrap justify-center gap-3">
                      {suggestedPrompts.map(prompt => (
                        <button key={prompt} onClick={() => sendMessage(prompt)} className="text-left text-sm text-cyan-300 bg-cyan-900/40 px-4 py-2 rounded-full hover:bg-cyan-900/70 transition-colors">
                          {prompt}
                        </button>
                      ))}
                    </div>
                </div>
              )}
            </div>

            {/* --- MODIFIED: Input Form --- */}
            <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-700/50 flex-shrink-0">
              <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-full border border-gray-600 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-transparent text-white px-4 py-2 focus:outline-none"
                  placeholder="Ask anything about our planet..."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input}
                  className="bg-teal-500 hover:bg-teal-400 p-3 rounded-full text-black transition-transform duration-200 active:scale-90 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <Send size={20} />
                </button>
                
                {/* --- ADDED: Voice Assistant Link Button --- */}
                {/* Ye button ab '/voice-assistant' page par navigate karega */}
                <Link
                  href="/voice-assistant"
                  className={`p-3 rounded-full text-gray-300 bg-gray-600 hover:bg-gray-500 transition-all duration-200 active:scale-90
                    ${isLoading ? 'hidden' : 'inline-flex'}
                  `}
                  title="Open Voice Assistant"
                >
                  <Mic size={20} />
                </Link>

              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}