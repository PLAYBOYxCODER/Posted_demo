"use client";
import React, { useState, useEffect } from "react";
import { Info, X, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

type AlertEvent = {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
};

export default function LiquidAlertProvider() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);

  useEffect(() => {
    // Intercept native browser alerts and convert them to Liquid Glass Modals!
    const nativeAlert = window.alert;
    
    window.alert = (msg: string) => {
       // Determine type blindly based on context words
       let type: AlertEvent["type"] = "info";
       const lc = msg.toLowerCase();
       if(lc.includes("success") || lc.includes("attached") || lc.includes("completed")) type = "success";
       else if(lc.includes("fail") || lc.includes("error") || lc.includes("denied")) type = "error";
       else if(lc.includes("lockout") || lc.includes("warning")) type = "warning";
       
       setAlerts(prev => {
          const newAlert = { id: Date.now() + Math.random(), message: msg, type };
          // Auto-dismiss after 4 seconds
          setTimeout(() => {
             setAlerts(curr => curr.filter(a => a.id !== newAlert.id));
          }, 4500);
          return [...prev, newAlert];
       });
    };

    return () => {
       window.alert = nativeAlert; // Restore on unmount
    };
  }, []);

  if (alerts.length === 0) return null;

  return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-4 w-[90%] max-w-sm pointer-events-none">
         {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`animate-in slide-in-from-top-10 fade-in zoom-in-95 duration-500 rounded-2xl p-0.5 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-3xl
                ${alert.type === 'success' ? 'bg-emerald-500/20 shadow-emerald-500/20' : 
                  alert.type === 'error' ? 'bg-red-500/20 shadow-red-500/20' : 
                  alert.type === 'warning' ? 'bg-orange-500/20 shadow-orange-500/20' : 
                  'bg-blue-500/20 shadow-blue-500/20'}`}
            >
               {/* Animated Liquid Backdrop Effect */}
               <div className={`absolute inset-0 w-[200%] h-[200%] -left-[50%] -top-[50%] animate-[spin_4s_linear_infinite] opacity-50 blur-[20px] pointer-events-none z-0
                 ${alert.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-transparent' : 
                   alert.type === 'error' ? 'bg-gradient-to-r from-red-500 to-transparent' : 
                   alert.type === 'warning' ? 'bg-gradient-to-r from-orange-500 to-transparent' : 
                   'bg-gradient-to-r from-blue-500 to-transparent'}`}
               />

               <div className="relative z-10 flex items-center justify-between gap-4 bg-zinc-950/90 w-full px-4 py-3 rounded-[14px]">
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-inner bg-black
                    ${alert.type === 'success' ? 'text-emerald-400 border-emerald-500/50' : 
                      alert.type === 'error' ? 'text-red-400 border-red-500/50' : 
                      alert.type === 'warning' ? 'text-orange-400 border-orange-500/50' : 
                      'text-blue-400 border-blue-500/50'}`}
                  >
                     {alert.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                     {alert.type === 'error' && <ShieldAlert className="w-4 h-4" />}
                     {alert.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                     {alert.type === 'info' && <Info className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1">
                     <p className="text-white font-bold text-xs tracking-wide leading-snug">{alert.message}</p>
                  </div>
                  
                  <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="text-gray-500 hover:text-white transition-colors p-1.5 bg-white/5 hover:bg-white/20 rounded-full shrink-0">
                     <X className="w-3.5 h-3.5" />
                  </button>

               </div>
            </div>
         ))}
      </div>
  );
}
