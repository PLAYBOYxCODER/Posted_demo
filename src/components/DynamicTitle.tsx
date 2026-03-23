"use client";
import { useEffect } from "react";

export default function DynamicTitle() {
  useEffect(() => {
    let originalTitle = document.title;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Record title incase it changed due to navigation
        originalTitle = document.title;
        document.title = "Hey! Where are you going? 😢";
      } else {
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return null;
}
