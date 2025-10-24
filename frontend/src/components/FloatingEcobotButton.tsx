"use client";

import { Bot } from 'lucide-react';
import { useEcobotContext } from '@/components/EcobotContext'; // Step 1 se import karein

export default function FloatingEcobotButton() {
  // Global state se check karein ki hero button dikh raha hai ya nahi
  const { isHeroButtonVisible } = useEcobotContext();

  return (
    <a
      href="/ecobot"
      className={`
        fixed bottom-6 right-6 z-50 p-4
        bg-teal-500 text-black rounded-full
        shadow-xl hover:bg-teal-400 hover:scale-110
        transition-all duration-300 ease-in-out
        ${isHeroButtonVisible ? 
          'opacity-0 translate-y-10 pointer-events-none' : // Agar main button visible hai, toh isse chhipa dein
          'opacity-100 translate-y-0 pointer-events-auto'  // Warna dikhayein
        }
      `}
      aria-label="Chat with Ecobot"
    >
      <Bot size={28} />
    </a>
  );
}