"use client";
import React from "react";
import { Landmark } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:py-24">
      <div className="max-w-4xl mx-auto">
         <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <Landmark className="w-10 h-10 text-emerald-500" />
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-widest text-white">Terms of Service</h1>
         </div>
         
         <div className="space-y-8 text-gray-300 leading-relaxed font-inter">
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">Agreement</h2>
               <p>By browsing, accessing, or purchasing from Poster Store, you agree to these legal conditions. You must be at least 18 years old or shop under parental guidance.</p>
            </section>
            
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">Intellectual Property</h2>
               <p>All designs sold natively by us are legally licensed, original artwork, or public domain creations curated by our design team. For the 'Design Your Own' section, you attest that you own the rights to the personal photo or artwork you upload. We are not liable for copyright infringements generated via the custom poster tool by users.</p>
            </section>
            
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">Fulfillment</h2>
               <p>We process orders within 48 hours. Shipping usually takes 3-7 business days depending on the state and pin code. In the event of catastrophic delays (e.g. natural disasters), the estimated timeline might shift.</p>
            </section>
         </div>
      </div>
    </div>
  );
}
