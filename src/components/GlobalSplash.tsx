"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./splash.css";

export default function GlobalSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("splash_played");
    
    // Completely disable splash if it's already been played or if we're on admin
    if (hasPlayed === "true" || pathname.startsWith("/admin")) {
      setIsVisible(false);
      setIsRendered(false);
      return;
    }

    // Extended 5.5 second duration
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("splash_played", "true");
    }, 5500);

    // Completely unmount wrapper out of DOM
    const removeTimer = setTimeout(() => {
      setIsRendered(false);
    }, 6800);

    return () => {
      // Intentionally not clearing timeouts on unmount so Strict Mode doesn't freeze the screen
      // Because Strict Mode unmounts and remounts instantly, clearing timeouts would kill the animation
    };
  }, [pathname]);

  if (!isRendered) return null;

  const rawTitle = "POSTED_STORE";
  
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if (sessionStorage.getItem('splash_played') === 'true' || window.location.pathname.startsWith('/admin')) {
                document.documentElement.classList.add('hide-splash');
              }
            } catch(e) {}
          `,
        }}
      />
      <div className={`splash-wrapper ${!isVisible ? "hide" : ""}`} suppressHydrationWarning>
      <div className="splash-container">
        
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
    </>
  );
}
