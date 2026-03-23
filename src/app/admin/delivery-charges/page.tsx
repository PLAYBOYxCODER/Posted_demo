"use client";
import React, { useState } from "react";
import { Truck, Search, MapPin, Save, ShieldCheck } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useOffers } from "@/components/OffersProvider";

export default function DeliveryChargesPage() {
  const { deliveryRates, setDeliveryRates } = useOffers();
  const [newStateName, setNewStateName] = useState("");
  const [newStateCharge, setNewStateCharge] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const addDeliveryState = () => {
    if(!newStateName.trim() || !newStateCharge) return;
    const amount = Number(newStateCharge);
    if(isNaN(amount)) return;
    setDeliveryRates({ ...deliveryRates, [newStateName.toUpperCase().trim()]: amount });
    setNewStateName("");
    setNewStateCharge("");
  };

  const removeDeliveryState = (stateName: string) => {
    const updated = { ...deliveryRates };
    delete updated[stateName];
    setDeliveryRates(updated);
  };

  const filteredRates = Object.entries(deliveryRates).filter(([state]) => 
    state.includes(searchQuery.toUpperCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      {/* HEADER */}
      <div className="mb-8 mt-2">
         <h1 className="text-3xl font-outfit font-black uppercase tracking-widest text-white flex items-center gap-3">
            <Truck className="w-8 h-8 text-emerald-500" />
            Shipping Regions & Charges
         </h1>
         <p className="text-gray-400 mt-2 max-w-2xl leading-relaxed">
            Manage your custom state-wise top-up delivery rates. By default, shipping is free globally. If you add a state here, customers originating from that exact state will be applied this surcharge dynamically during checkout.
         </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* LEFT CONFIGURATION PANEL */}
        <div className="w-full lg:w-1/3 space-y-6">
           <ScrollReveal delay={0}>
             <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl">
               <h2 className="text-xl font-outfit font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Add New Region Rule
               </h2>
               
               <div className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Exact State Name</label>
                     <input 
                       value={newStateName}
                       onChange={(e) => setNewStateName(e.target.value)}
                       placeholder="e.g. MAHARASHTRA" 
                       className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm uppercase text-white focus:border-emerald-500 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Additional Charge (₹)</label>
                     <input 
                       type="number"
                       value={newStateCharge}
                       onChange={(e) => setNewStateCharge(e.target.value)}
                       placeholder="150" 
                       className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                     />
                  </div>
                  <button 
                    onClick={addDeliveryState} 
                    className="w-full bg-emerald-500 text-black px-6 py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 hover:-translate-y-1 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                  >
                    Deploy New Rule
                  </button>
               </div>

               <div className="mt-8 flex items-start gap-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                  <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider">
                     Rules take effect immediately and will dynamically synchronize with the checkout gateway and Razorpay cart totals.
                  </p>
               </div>
             </div>
           </ScrollReveal>
        </div>

        {/* RIGHT DATABASE VIEW */}
        <div className="flex-1 bg-zinc-900 border border-white/10 rounded-3xl p-6 lg:p-8 flex flex-col shadow-xl">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-outfit font-bold text-white">Active Routing Rules</h2>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search states..." 
                  className="w-full bg-black border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs uppercase tracking-widest text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-3">
              {filteredRates.length > 0 ? filteredRates.map(([state, cost], idx) => (
                <ScrollReveal delay={idx * 0.05} key={state}>
                  <div className="group flex items-center justify-between bg-black border border-white/5 hover:border-white/20 p-4 rounded-2xl transition-all hover:bg-white/5">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-gray-500 group-hover:text-white transition-colors">
                           {state.substring(0, 2)}
                        </div>
                        <div>
                           <h4 className="font-bold text-sm tracking-widest uppercase text-white">{state}</h4>
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Top-up Applied</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="text-emerald-400 font-outfit font-black text-lg">+ ₹{cost}</span>
                        <button 
                          onClick={() => removeDeliveryState(state)} 
                          className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
                        >
                          Revoke
                        </button>
                     </div>
                  </div>
                </ScrollReveal>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-3xl">
                  <Truck className="w-12 h-12 text-gray-700 mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">No Active Custom Region Rules</p>
                  <p className="text-xs text-gray-600 max-w-sm">All regions currently fall under the global default (Free Shipping) category.</p>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
