// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import { EcobotProvider } from "@/components/EcobotContext"; 
import FloatingEcobotButton from "@/components/FloatingEcobotButton";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bit-Climate - AI for a Better Planet",
  description: "Pioneering data-driven solutions to combat environmental challenges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* EcobotProvider ko yahan rakhein taaki yeh sabko wrap kar sake */}
          <EcobotProvider>
            <Toaster position="top-center" richColors />
            <Header />
            <main>{children}</main> {/* Content bas ek baar yahan render hoga */}
            
            {/* Floating button provider ke andar rahega */}
            <FloatingEcobotButton />
          </EcobotProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}