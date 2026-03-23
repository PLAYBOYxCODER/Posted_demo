"use client";
import React from "react";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:py-24">
      <div className="max-w-4xl mx-auto">
         <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-widest text-white">Privacy Policy</h1>
         </div>
         
         <div className="space-y-8 text-gray-300 leading-relaxed font-inter">
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">1. Data Collection</h2>
               <p>We respect your privacy. When you browse our store, we collect minimal operational data such as browser type and device metrics to improve user interface performance. When you purchase, we securely collect necessary data: Name, Shipping Address, Email, and Phone number.</p>
            </section>
            
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">2. Financial Info</h2>
               <p>We do not store your credit card or bank details. All transactions go directly through our encrypted, bank-grade payment providers (Razorpay and Stripe). Your financial data remains 100% confidential and out of our servers.</p>
            </section>
            
            <section>
               <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-4">3. Data Usage</h2>
               <p>We only use your data to dispatch and track your poster shipments. We do not sell your data to third party ad-networks. Ever.</p>
            </section>
         </div>
      </div>
    </div>
  );
}
