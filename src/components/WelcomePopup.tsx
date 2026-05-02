"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { LogIn, X, Smile, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WelcomePopup() {
  const { user, isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    // Check if we've shown it this session
    const hasSeenWelcome = sessionStorage.getItem("has_seen_welcome");
    
    if (!isLoading && !user && !hasSeenWelcome) {
      // Trigger smoother delayed entrance
      setTimeout(() => setIsVisible(true), 2500); 
    }
  }, [user, isLoading]);

  const handleSkip = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("has_seen_welcome", "true");
    }, 400); // match exit animation duration
  };

  const handleLogin = () => {
    sessionStorage.setItem("has_seen_welcome", "true");
    router.push('/login');
  };

  if (!isVisible || pathname.startsWith('/admin')) return null;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ${isClosing ? 'bg-transparent backdrop-blur-none' : 'bg-black/60 backdrop-blur-md'}`}>
      
      <div 
        className={`relative w-full max-w-[360px] bg-zinc-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 will-change-transform ${isClosing ? 'opacity-0 scale-95 translate-y-8' : 'animate-in zoom-in-95 slide-in-from-bottom-12 fade-in opacity-100 scale-100'}`}
      >
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />

        <button 
          onClick={handleSkip} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 relative z-10 shadow-inner mt-4">
          <Smile className="w-8 h-8 text-emerald-400" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-emerald-300 animate-pulse" />
        </div>

        <h2 className="text-2xl font-outfit font-black uppercase text-white mb-3 relative z-10 tracking-wide">
          Welcome to the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Poster Store</span>
        </h2>
        
        <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium relative z-10 px-2">
          We're so glad you're here! Log in to save your favorite custom designs, track orders instantly, and unlock exclusive drops.
        </p>

        <div className="w-full flex flex-col gap-3 relative z-10">
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform transform hover:-translate-y-1 shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
          >
            <LogIn className="w-4 h-4" /> Sign In securely
          </button>
          
          <button 
            onClick={handleSkip} 
            className="w-full py-4 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors border border-transparent hover:border-white/10 hover:bg-white/5 rounded-xl"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
