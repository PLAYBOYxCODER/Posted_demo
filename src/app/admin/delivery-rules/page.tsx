"use client";
import React, { useState } from "react";
import { Truck, Plus, Trash2, Edit2, Save, CheckCircle2 } from "lucide-react";
import { useOffers } from "@/components/OffersProvider";

export default function DeliveryRulesPage() {
  const { deliveryRates, setDeliveryRates } = useOffers();
  const [localDeliveryRates, setLocalDeliveryRates] = useState<Record<string, number>>(deliveryRates || {});
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First, get the current config and merge it
      const res = await fetch('/api/config');
      let currentConfig = {};
      if (res.ok) {
        currentConfig = await res.json();
      }
      
      const payload = {
        ...currentConfig,
        deliveryRates: localDeliveryRates
      };

      await fetch('/api/config', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      });
      
      setDeliveryRates(localDeliveryRates);
      
      alert("Success! Delivery rules have been updated globally.");
      setShowConfirmPopup(false);
    } catch(e) {
      alert("Failed to update Delivery Rules. Reload required.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in flex flex-col w-full max-w-5xl mx-auto pb-32">
      {/* Header */}
      <div className="mb-8">
         <h1 className="text-3xl md:text-4xl font-outfit font-black uppercase text-white tracking-widest flex items-center gap-3">
            <Truck className="w-8 h-8 text-emerald-400" /> 
            Delivery Rules
         </h1>
         <p className="text-gray-400 mt-2">Manage shipping rates per state globally. Customers cannot checkout without selecting an available state.</p>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 relative mt-2">
         <div className="flex flex-col md:flex-row items-center justify-between mb-6 border-b border-white/10 pb-4 gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
               <Truck className="w-6 h-6 text-emerald-400 hidden md:block" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white text-center md:text-left w-full">Shipping Delivery Rates</h2>
            </div>
            <button 
              onClick={() => {
                 const newState = prompt("Enter a New Indian State (e.g. Maharashtra):");
                 if (!newState) return;
                 const cost = prompt("Enter Shipping Cost (e.g. 50):", "50");
                 setLocalDeliveryRates(prev => ({ ...prev, [newState]: Number(cost) || 0 }));
              }}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 md:px-3 md:py-1.5 rounded-lg md:rounded text-sm md:text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Plus className="w-4 h-4 md:w-3 md:h-3"/> Add State
            </button>
         </div>
         
         <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">
           Add states where you physically support delivery. Any state not on this list will be invisible to customers at checkout. Set to '0' for Free Shipping.
         </p>
         
         {Object.keys(localDeliveryRates).length === 0 ? (
            <div className="text-center p-8 border border-white/5 bg-black/50 border-dashed rounded-2xl">
               <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">No Delivery States Added</p>
               <p className="text-[10px] text-gray-600 mt-2">Customers cannot checkout without selecting a state!</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {Object.keys(localDeliveryRates).sort().map(stateName => (
                  <div key={stateName} className="flex flex-col bg-black border border-white/10 rounded-xl p-4 gap-3 relative group focus-within:border-emerald-500 transition-colors">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-white truncate max-w-[140px]" title={stateName}>{stateName}</span>
                         <div className="flex bg-zinc-900 border border-white/10 p-1.5 rounded items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => {
                                const newName = prompt("Enter new State Name:", stateName);
                                if(newName && newName !== stateName) {
                                   const updated = {...localDeliveryRates};
                                   const val = updated[stateName];
                                   delete updated[stateName];
                                   updated[newName] = val;
                                   setLocalDeliveryRates(updated);
                                }
                             }}
                             className="text-emerald-500 bg-emerald-500/10 p-2 md:p-1.5 rounded hover:bg-emerald-500/20" title="Edit State Name"
                           >
                              <Edit2 className="w-4 h-4 md:w-3 md:h-3" />
                           </button>
                           <button 
                             onClick={() => {
                                const updated = {...localDeliveryRates};
                                delete updated[stateName];
                                setLocalDeliveryRates(updated);
                             }}
                             className="text-red-500 bg-red-500/10 p-2 md:p-1.5 rounded hover:bg-red-500/20" title="Remove State"
                           >
                              <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
                           </button>
                         </div>
                      </div>
                     <div className="flex items-center bg-zinc-900 border border-white/10 rounded px-3 py-2 md:py-3">
                        <span className="text-gray-500 text-xs font-bold mr-2">₹</span>
                        <input 
                          type="number"
                          value={localDeliveryRates[stateName]}
                          onChange={(e) => setLocalDeliveryRates(prev => ({ ...prev, [stateName]: Number(e.target.value) || 0 }))}
                          className="bg-transparent outline-none w-full text-white text-base md:text-sm font-mono font-bold"
                        />
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
         <button 
           onClick={() => setShowConfirmPopup(true)}
           disabled={isSaving}
           className={`bg-emerald-500 hover:bg-emerald-400 text-black px-6 md:px-8 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1 ${isSaving ? 'opacity-80 scale-95 pointer-events-none' : ''}`}
         >
            {isSaving ? <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Pushing...' : 'Save Rule Updates'}
         </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
           <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full mix-blend-screen pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-outfit font-black uppercase tracking-widest text-white mb-3">Save Delivery Rates</h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">Are you absolutely sure you want to push these delivery rules globally?</p>
              <div className="flex gap-4">
                 <button onClick={() => setShowConfirmPopup(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-xs transition-colors border border-white/10 hover:border-white/20">Cancel</button>
                 <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-black rounded-xl py-3.5 font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                   {isSaving ? 'Processing...' : 'Confirm'}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
