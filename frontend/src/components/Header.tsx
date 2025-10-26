// src/components/Header.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook to get current path
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Bot, Menu, X } from 'lucide-react'; // Import Menu and X icons
import clsx from 'clsx'; // Utility for conditional classes

export default function Header() {
  const [headerBg, setHeaderBg] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // Get the current page path

  // --- Scroll Effect Logic ---
  useEffect(() => {
    const isSpecialPage = ['/', '/sign-in', '/sign-up'].some(p => pathname.startsWith(p)); // Transparent on home, sign-in, sign-up

    const handleScroll = () => {
      if (isSpecialPage) {
        setHeaderBg(window.scrollY > 50);
      }
    };

    if (isSpecialPage) {
      setHeaderBg(window.scrollY > 50); // Initial check
    } else {
      setHeaderBg(true); // Always solid on other pages like /dashboard, /air etc.
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]); // Re-run effect if the page path changes

  // --- Close mobile menu on route change ---
   useEffect(() => {
     setIsMobileMenuOpen(false);
   }, [pathname]);

  // --- Helper for Active Link Styling ---
  const isActive = (href: string) => pathname === href;

  // --- Navigation Links Data ---
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' }, // Assuming you might create these pages
    { href: '/solutions', label: 'Solutions' }, // Assuming you might create these pages
  ];

  return (
    <header className={clsx(
      'fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out',
      headerBg ? 'bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700/50' : 'bg-transparent border-b border-transparent'
    )}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Bot className="h-8 w-8 text-teal-400 group-hover:animate-pulse" />
          <span className="text-xl font-bold text-white transition-colors group-hover:text-teal-300">
            Bit_Climate
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'font-medium transition-colors duration-200 py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-teal-400 after:transition-all after:duration-300',
                isActive(link.href)
                  ? 'text-white after:w-full' // Active style
                  : 'text-gray-400 hover:text-white after:w-0 hover:after:w-full' // Inactive style
              )}
            >
              {link.label}
            </Link>
          ))}
          <SignedIn>
            <Link
              href="/dashboard"
              className={clsx(
                 'font-medium transition-colors duration-200 py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-teal-400 after:transition-all after:duration-300',
                isActive('/dashboard')
                  ? 'text-white after:w-full'
                  : 'text-gray-400 hover:text-white after:w-0 hover:after:w-full'
              )}
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>

        {/* Auth Buttons & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              {/* Use Link instead of SignInButton for custom page */}
              <Link href="/sign-in" passHref>
                 <button className="bg-teal-500 text-black px-5 py-2 rounded-full hover:bg-teal-400 transition-colors font-bold text-sm">
                   Login
                 </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton
                 afterSignOutUrl="/"
                 appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              className="text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- Mobile Menu --- */}
      <div className={clsx(
        "md:hidden absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out overflow-hidden border-t border-gray-700/50",
        isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="flex flex-col items-center px-6 py-8 space-y-5">
           {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'font-medium text-lg w-full text-center py-2 rounded-md transition-colors duration-200',
                isActive(link.href)
                  ? 'text-black bg-teal-400' // Active style for mobile
                  : 'text-gray-300 hover:text-white hover:bg-gray-800' // Inactive style for mobile
              )}
            >
              {link.label}
            </Link>
          ))}
          <SignedIn>
             <Link
              href="/dashboard"
              className={clsx(
                'font-medium text-lg w-full text-center py-2 rounded-md transition-colors duration-200',
                isActive('/dashboard')
                  ? 'text-black bg-teal-400'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              )}
            >
              Dashboard
            </Link>
          </SignedIn>

          {/* Auth buttons for mobile */}
          <div className="w-full pt-4 border-t border-gray-700">
             <SignedOut>
              <Link href="/sign-in" passHref className="block w-full">
                 <button className="w-full bg-teal-500 text-black px-5 py-3 rounded-full hover:bg-teal-400 transition-colors font-bold">
                   Login / Sign Up
                 </button>
              </Link>
            </SignedOut>
            <SignedIn>
               {/* UserButton might look too small here, consider adding a sign out link instead/also */}
               <div className="flex justify-center mt-2">
                 <UserButton
                    afterSignOutUrl="/"
                    appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }}
                 />
               </div>
            </SignedIn>
          </div>

        </div>
      </div>
      {/* --- End Mobile Menu --- */}
    </header>
  );
}