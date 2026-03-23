"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { ArrowRight, LogIn, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WelcomePopup() {
  const { user, isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [contentIdx, setContentIdx] = useState(0);
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const CAPTIONS = [
    { eyebrow: "Exclusive Collection", title1: "Bring Your", title2: "Walls", title3: "To Life", sub: "Log in securely to save your custom cart forever and gain priority tracking." },
    { eyebrow: "Limited Editions", title1: "Art That", title2: "Speaks", title3: "For You", sub: "Join our community of collectors. Secure checkout. Priority shipping." },
    { eyebrow: "Premium Quality", title1: "Elevate Your", title2: "Daily", title3: "Vibe", sub: "Gallery-quality prints delivered flawlessly directly to your doorstep." },
    { eyebrow: "Trending Designs", title1: "Curate Your", title2: "Dream", title3: "Space", sub: "Connect your account to save your favorite poster layouts instantly." }
  ];

  useEffect(() => {
    setContentIdx(Math.floor(Math.random() * CAPTIONS.length));

    // Check if we've shown it this session
    const hasSeenWelcome = sessionStorage.getItem("has_seen_welcome");
    
    if (!isLoading && !user && !hasSeenWelcome) {
      // Trigger entrance
      setTimeout(() => setIsVisible(true), 1500); // Wait 1.5s after load
    }
  }, [user, isLoading]);

  const handleSkip = () => {
    setIsVisible(false);
    sessionStorage.setItem("has_seen_welcome", "true");
  };

  if (!isVisible || pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div 
        className="relative flex flex-col w-[320px] max-w-full p-1 rounded-[32px] animate-in zoom-in-95 slide-in-from-bottom-6 duration-700 shadow-2xl"
        style={{
          background: 'linear-gradient(to top right, #975af4, #2f7cf8 40%, #78aafa 65%, #934cff 100%)'
        }}
      >
        <button onClick={handleSkip} className="absolute -right-2 -top-2 bg-zinc-900 border border-white/20 text-gray-300 hover:text-white transition-colors z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110">
          <X className="w-4 h-4" />
        </button>

        {/* TOP TITLE BAR */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 text-white">
          <p className="text-[12px] font-semibold italic text-white/90 truncate" style={{ textShadow: '2px 2px 6px #2975ee' }}>
            Elevate Your Space.
          </p>
          <Sparkles className="w-5 h-5 text-white/90" />
        </div>

        {/* DARK INNER CONTENT BLOCK */}
        <div 
           className="w-full h-full rounded-[28px] text-[#838383] text-xs p-6 flex flex-col gap-4 relative overflow-hidden"
           style={{ backgroundColor: '#161a20' }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none" />

            <div className="text-center relative z-10">
              <p className="font-semibold text-[#bab9b9] uppercase tracking-widest mb-2 font-outfit">{CAPTIONS[contentIdx].eyebrow}</p>
              
              <div className="text-[28px] text-white font-black font-outfit leading-tight mb-2">
                {CAPTIONS[contentIdx].title1} <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#975af4] to-[#2f7cf8]">{CAPTIONS[contentIdx].title2}</span><br/>{CAPTIONS[contentIdx].title3}
              </div>
              
              <p className="text-[11px] leading-relaxed mb-6 mt-3 max-w-[200px] mx-auto text-gray-400">
                {CAPTIONS[contentIdx].sub}
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-auto relative z-10">
                <button
                  onClick={() => {
                     handleSkip();
                     router.push('/login');
                  }}
                  className="w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-100"
                  style={{
                    background: 'linear-gradient(4deg, #975af4, #2f7cf8 40%, #78aafa 65%, #934cff 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <LogIn className="w-4 h-4" /> Login Now
                </button>
                <button 
                  onClick={handleSkip} 
                  className="w-full text-gray-500 font-semibold uppercase tracking-widest py-2 rounded-xl flex justify-center items-center gap-1.5 text-[10px] transition-all hover:text-white"
                >
                  Skip for Now <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
