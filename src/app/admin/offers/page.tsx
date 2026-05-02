"use client";
import React, { useState, useEffect } from "react";
import { Gift, Save, CheckCircle2, TrendingUp, Filter, Trash2, Plus } from "lucide-react";
import { useOffers } from "@/components/OffersProvider";
import { useProducts } from "@/components/ProductProvider";

export default function OffersAdmin() {
  const { 
    bogoCampaigns, setBogoCampaigns,
    // Keep exact existing payload data intact
    marqueeText, eventBanners, isEventActive, galleryItems,
    activeCategories, categorySubtitles, mobileCategoryImages,
    isRazorpayEnabled, isAiRecommendationsEnabled, deliveryRates,
    whatsappNumber, featuredBentoIds
  } = useOffers();

  const { products } = useProducts();

  // Local state for edits
  const [localCampaigns, setLocalCampaigns] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Sync initial state
  useEffect(() => {
     if (bogoCampaigns?.length) {
        setLocalCampaigns(bogoCampaigns);
     }
  }, [bogoCampaigns]);

  // Derive all possible exact categories physically loaded into system right now globally
  const dbCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const availableCategories = ["All", ...dbCategories];

  const handleCreateOffer = () => {
     setLocalCampaigns(prev => [
         ...prev, 
         { id: `bogo_${Date.now()}`, buyQty: 2, getQty: 1, category: "All", isActive: false }
     ]);
  };

  const handleUpdateOffer = (id: string, updates: any) => {
     setLocalCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteOffer = (id: string) => {
     setLocalCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Aggressive JSON Global API payload merger
    const payload = {
       marqueeText, eventBanners, isEventActive, galleryItems,
       activeCategories, categorySubtitles, mobileCategoryImages,
       isRazorpayEnabled, isAiRecommendationsEnabled, deliveryRates,
       whatsappNumber, featuredBentoIds,
       // The new BOGO array
       bogoCampaigns: localCampaigns
    };

    try {
      await fetch('/api/config', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      });
      
      // Update Context for immediate local admin session visual layout sync, but DB is primary source of Truth
      setBogoCampaigns(localCampaigns);
      
      alert("Success! Multi-Tier BOGO Campaign Rules dynamically locked globally.");
      setShowConfirmPopup(false);
    } catch(e) {
      alert("Failed to contact Internal API Server. Reload Required.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in flex flex-col w-full max-w-5xl mx-auto pb-32 relative z-10">
      
      {/* Header */}
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
             <h1 className="text-3xl md:text-4xl font-outfit font-black uppercase text-white tracking-widest flex items-center gap-3">
                <Gift className="w-8 h-8 text-emerald-400" /> 
                Offers & BOGO Engine
             </h1>
             <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-2xl">
               Mathematically sculpt user checkout habits by defining completely automatic multiple "Buy X Get Y" algorithms. Create overlapping rules explicitly tied to specific categories.
             </p>
         </div>
         <button onClick={handleCreateOffer} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Plus className="w-4 h-4" /> Create Offer Rule
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-32">
         
         {localCampaigns.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-12 rounded-3xl">
               <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
               <p className="text-gray-400 font-bold uppercase tracking-widest">No Active Campaigns</p>
               <button onClick={handleCreateOffer} className="mt-4 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg font-bold text-xs tracking-widest hover:bg-emerald-500/10 transition-colors uppercase">Start Your First Campaign</button>
            </div>
         ) : (
            localCampaigns.map((campaign, index) => (
               <div key={campaign.id} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 items-center relative overflow-hidden focus-within:border-emerald-500/50 focus-within:bg-white/10 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.4)] group">
                  
                  {/* Active Toggle & Visual Math - Left Core */}
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-black/60 backdrop-blur-md rounded-3xl border border-white/5 relative min-w-full lg:min-w-[280px] lg:w-[280px] shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      
                      <div className="absolute top-4 left-4 z-10">
                         <button onClick={() => handleDeleteOffer(campaign.id)} className="text-red-400 bg-red-500/10 p-2.5 rounded-xl hover:bg-red-500/20 hover:scale-110 transition-all border border-red-500/20" title="Delete Rule">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                         <div className="flex flex-col items-end gap-1.5">
                            <button 
                              onClick={() => handleUpdateOffer(campaign.id, { isActive: !campaign.isActive })}
                              className={`w-12 h-6 rounded-full relative transition-all duration-500 shadow-inner ${campaign.isActive ? 'bg-emerald-500' : 'bg-black border border-white/20'}`}
                            >
                               <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-md transition-all duration-300 ${campaign.isActive ? 'left-[26px]' : 'left-1'}`} />
                            </button>
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${campaign.isActive ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`}>
                              {campaign.isActive ? 'Live' : 'Offline'}
                            </span>
                         </div>
                      </div>

                      <TrendingUp className={`w-10 h-10 mb-4 transition-colors duration-500 ${campaign.isActive ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-gray-700'}`} />
                      <div className="text-3xl font-outfit font-black uppercase tracking-tight text-white leading-none relative z-10">
                         <span className="opacity-80 block mb-1">Buy {campaign.buyQty}</span>
                         <span className={`${campaign.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>Get {campaign.getQty} Free</span>
                      </div>
                  </div>

                  {/* Config Settings - Right Core */}
                  <div className="flex-[2] flex flex-col gap-5 w-full relative z-10">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-inner group/input transition-colors hover:border-white/20">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                               Base Requirement
                            </label>
                            <div className="flex items-end text-xl">
                               <span className="text-gray-500 mr-2 font-outfit mb-1 font-bold">Qty:</span>
                               <input 
                                 type="number" min="1" max="50"
                                 value={campaign.buyQty} 
                                 onChange={(e) => handleUpdateOffer(campaign.id, { buyQty: Number(e.target.value)||1 })}
                                 className="w-full bg-transparent text-white font-outfit font-black outline-none text-3xl border-b border-white/20 pb-1 focus:border-white transition-colors"
                               />
                            </div>
                        </div>
                        
                        <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl shadow-inner group/reward transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/20">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3 flex items-center gap-2">
                               Granted Free
                            </label>
                            <div className="flex items-end text-xl">
                               <span className="text-emerald-600 mr-2 font-outfit mb-1 font-bold">Qty:</span>
                               <input 
                                 type="number" min="1" max="50"
                                 value={campaign.getQty} 
                                 onChange={(e) => handleUpdateOffer(campaign.id, { getQty: Number(e.target.value)||1 })}
                                 className="w-full bg-transparent text-emerald-400 font-outfit font-black outline-none text-3xl border-b border-emerald-500/30 pb-1 focus:border-emerald-400 transition-colors"
                               />
                            </div>
                        </div>
                     </div>
                     
                     {/* Category Select Boundary */}
                     <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-white/20">
                        <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2 shrink-0">
                           <Filter className="w-5 h-5 bg-cyan-500/10 p-1 rounded-md text-cyan-400" /> Boundary Filter
                        </label>
                        <select 
                           value={campaign.category}
                           onChange={(e) => handleUpdateOffer(campaign.id, { category: e.target.value })}
                           className="bg-zinc-900 border border-white/20 px-4 py-3 text-white outline-none rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer w-full sm:w-1/2 hover:border-white/40 focus:border-cyan-400 transition-all"
                        >
                           {availableCategories.map(cat => (
                              <option key={cat} value={cat} className="bg-zinc-950 text-white truncate">
                                {cat === "All" ? "Site-Wide Sweep (All Items)" : `[${cat}] Posters Only`}
                              </option>
                           ))}
                        </select>
                     </div>
                  </div>
               </div>
            ))
         )}
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
         <button 
           onClick={() => setShowConfirmPopup(true)}
           disabled={isSaving || (localCampaigns.length === 0 && (!bogoCampaigns || bogoCampaigns.length === 0))}
           className={`bg-emerald-500 hover:bg-emerald-400 text-black px-6 md:px-8 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1 ${isSaving ? 'opacity-80 scale-95 pointer-events-none' : ''}`}
         >
            {isSaving ? <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Deploying Math...' : 'Save & Publish All Campaigns'}
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
              <h3 className="text-2xl font-outfit font-black uppercase tracking-widest text-white mb-3">Sync {localCampaigns.length} Campaigns?</h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">Are you absolutely sure you want to deploy these mathematical vectors universally? All live user Carts will inherently recalculate themselves within milliseconds.</p>
              <div className="flex gap-4">
                 <button onClick={() => setShowConfirmPopup(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-xs transition-colors border border-white/10 hover:border-white/20">Cancel</button>
                 <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-black rounded-xl py-3.5 font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                   {isSaving ? 'Processing...' : 'Secure Override'}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
