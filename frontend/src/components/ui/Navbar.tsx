"use client";

// Link aur usePathname ko hata kar React ke standard hooks ka istemal kiya gaya hai
import React, { useState, useEffect } from 'react';

// export function Navbar() ko "export default" mein badal diya gaya hai
export default function Navbar() {
  // pathname ko manage karne ke liye state
  const [pathname, setPathname] = useState('');

  // Component ke client-side par load hone ke baad hi window.location se path set karein
  useEffect(() => {
    // yeh check sunishchit karta hai ki code sirf browser mein chale
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  const navItems = [
    { href: '/', label: 'Deforestation Analysis' },
    { href: '/crop-disease', label: 'Crop Disease Detection' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-green-600">Terra-Pulse AI</span>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              // Next.js ke Link component ki jagah standard anchor (<a>) tag ka istemal
              <a
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-green-100 text-green-700' // Active link ka style
                    : 'text-gray-500 hover:bg-gray-100' // Normal link ka style
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

