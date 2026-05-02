"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/components/splash.css";

export default function SplashPage() {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if user already saw splash, skip to /home
    if (sessionStorage.getItem("splash_played") === "true") {
      router.replace("/home");
      return;
    }

    let navigateTimer: NodeJS.Timeout;

    // Play animation until completed, then elegantly trigger fade out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      
      // Navigate to /home precisely after the opacity transition finishes
      navigateTimer = setTimeout(() => {
         sessionStorage.setItem("splash_played", "true");
         router.replace("/home");
      }, 700); 

    }, 2000); // Hold for 2.0 seconds (much faster)

    // Completely prevent looping, re-triggers and memory leaks across renders
    return () => {
       clearTimeout(fadeTimer);
       if (navigateTimer) clearTimeout(navigateTimer);
    };
  }, [router]);

  const rawTitle = "POSTED_STORE";
  
  return (
    <div className={`splash-wrapper relative min-h-screen ${isFadingOut ? 'hide' : ''}`}>
      <div className="splash-container flex flex-col items-center justify-center min-h-screen">
        
        <h1 className="splash-title">
          {rawTitle.split("").map((char, index) => {
             const charData = char.toLowerCase();
             return (
               <span 
                 key={index} 
                 className="char" 
                 data-char={charData} 
                 style={{
                   "--char-index": index,
                 } as React.CSSProperties}
               >
                 {char === "_" ? " " : char}
               </span>
             )
          })}
        </h1>

        <div className="splash-accent" />
        
        <div className="splash-tagline">
          Trusted Quality - Delivered
        </div>

      </div>
    </div>
  );
}
