"use client";
import React, { useState } from "react";
import { MessageCircleQuestion, ChevronDown } from "lucide-react";

const QA = [
  {
    q: "How are the posters packaged?",
    a: "We ship all standard posters in rigid, industrial-grade mailing tubes to ensure they arrive completely uncreased. If you select a framed option, we secure the frame in specialized foam crash-proof boxes."
  },
  {
    q: "How do I print a custom design?",
    a: "Click 'Make Your Own' in the navigation. Upload a high-resolution image, select the style (Retro, Split, Mini, or standard frame), and we will immediately process and print your personalized masterpiece."
  },
  {
    q: "What is your refund policy?",
    a: "We have a 7-day hassle-free replacement window for misprints or transit damages. Check our full Returns Policy page for complete detail."
  },
  {
    q: "Do you ship internationally?",
    a: "Currently, Poster Store only delivers pan-India. However, we're expanding borders soon!"
  },
  {
     q: "What types of papers do you use?",
     a: "We use premium 300 GSM thick matte-finish gallery-grade art paper that protects from UV-fading and resists glare under bright light."
  }
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:py-24">
      <div className="max-w-4xl mx-auto">
         <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <MessageCircleQuestion className="w-10 h-10 text-emerald-500" />
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-widest text-white">Frequently Asked</h1>
         </div>
         
         <div className="space-y-4 font-inter text-gray-300">
            {QA.map((item, idx) => (
              <div key={idx} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-colors">
                <button 
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full text-left p-6 font-bold uppercase tracking-widest text-sm flex justify-between items-center"
                >
                  <span className={openIdx === idx ? "text-emerald-400" : ""}>{item.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openIdx === idx ? "rotate-180 text-emerald-400" : "text-gray-500"}`} />
                </button>
                <div className={`transition-all duration-500 overflow-hidden ${openIdx === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="p-6 pt-0 leading-relaxed text-gray-400 border-t border-white/5 mt-2 shadow-inner">{item.a}</p>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
