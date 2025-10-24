// src/components/Header.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Bot } from 'lucide-react';

export default function Header() {
  const [headerBg, setHeaderBg] = useState(false);

  useEffect(() => {
    // Sirf homepage par scroll effect apply ho, isliye check karenge
    const isHomePage = window.location.pathname === '/';
    
    const handleScroll = () => {
      if (isHomePage) {
        setHeaderBg(window.scrollY > 50);
      }
    };
    
    // Initial state set karein
    if (isHomePage) {
      setHeaderBg(window.scrollY > 50);
    } else {
      setHeaderBg(true); // Baaki pages par header hamesha solid rahega
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg ? 'bg-gray-900/80 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-[#33D7B1]" />
          <span className="text-xl font-bold text-white">Bit_Climate</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-300 hover:text-white font-medium">Home</Link>
          <a href="#" className="text-gray-300 hover:text-white font-medium">About</a>
          <a href="#" className="text-gray-300 hover:text-white font-medium">Services</a>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-[#33D7B1] text-gray-900 px-5 py-2 rounded-full hover:bg-opacity-80 transition-colors font-bold">Login</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-gray-300 hover:text-white font-medium">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}