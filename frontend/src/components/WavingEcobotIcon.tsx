// src/components/WavingEcobotIcon.tsx

import React from 'react';

const WavingEcobotIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>
      {`
        .ecobot-arm {
          transform-origin: 25px 55px;
          animation: wave-animation 2.5s ease-in-out infinite;
        }
        @keyframes wave-animation {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-10deg); }
          30% { transform: rotate(15deg); }
          40% { transform: rotate(-5deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}
    </style>
    <g transform="translate(10, 5)">
      {/* Arm */}
      <g className="ecobot-arm">
        <path d="M 25 55 Q 15 70 10 85 L 15 87 Q 20 72 30 57 Z" fill="#2dd4bf" />
      </g>
      
      {/* Body */}
      <path d="M 20 50 C 20 30, 80 30, 80 50 C 80 70, 20 70, 20 50 Z" fill="#115e59" />
      <path d="M 25 50 C 25 35, 75 35, 75 50 C 75 65, 25 65, 25 50 Z" fill="#134e4a" />

      {/* Eyes */}
      <circle cx="40" cy="50" r="4" fill="#99f6e4" />
      <circle cx="60" cy="50" r="4" fill="#99f6e4" />

      {/* Leaf Antenna */}
      <path d="M 75 35 C 85 25, 95 30, 90 40 C 95 30, 100 20, 90 10 Z" fill="#34d399" stroke="#99f6e4" strokeWidth="1" />
    </g>
  </svg>
);

export default WavingEcobotIcon;