"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// Context ka type define karein
interface EcobotContextType {
  isHeroButtonVisible: boolean;
  setIsHeroButtonVisible: (isVisible: boolean) => void;
}

// Default value ke saath context banayein
const EcobotContext = createContext<EcobotContextType | undefined>(undefined);

// Provider component banayein jo state ko hold karega
export function EcobotProvider({ children }: { children: ReactNode }) {
  const [isHeroButtonVisible, setIsHeroButtonVisible] = useState(false);

  return (
    <EcobotContext.Provider value={{ isHeroButtonVisible, setIsHeroButtonVisible }}>
      {children}
    </EcobotContext.Provider>
  );
}

// Ek custom hook banayein taaki context ko aasani se use kar sakein
export function useEcobotContext() {
  const context = useContext(EcobotContext);
  if (context === undefined) {
    throw new Error('useEcobotContext must be used within an EcobotProvider');
  }
  return context;
}