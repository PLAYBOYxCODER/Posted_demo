"use client";
import React from "react";
import { CopySlash } from "lucide-react";

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:py-24">
      <div className="max-w-4xl mx-auto">
         <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <CopySlash className="w-10 h-10 text-emerald-500" />
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-widest text-white">Refund & Returns</h1>
         </div>
         
         <div className="space-y-8 text-gray-300 leading-relaxed font-inter">
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">7-Day Return Policy</h2>
               <p>We stand by our print quality. If your poster arrives damaged or you notice a misprint, you have up to 7 days from the delivery date to raise a return ticket. To do so, simply log into your profile and submit feedback with photos of the damaged artwork.</p>
            </section>
            
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">Conditions for Replacement</h2>
               <p>We only accept returns for items that are physically damaged in transit or suffer from clear manufacturing defects. Since each poster is printed uniquely to order, we do not support returns based on subjective change of mind or incorrectly ordered sizes.</p>
            </section>
            
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">Refund Method</h2>
               <p>Refunds (if a replacement is not possible) will be credited directly to your original payment method (Bank Account, UPI, or Wallet) within 3-5 business days upon successful verification.</p>
            </section>
         </div>
      </div>
    </div>
  );
}
