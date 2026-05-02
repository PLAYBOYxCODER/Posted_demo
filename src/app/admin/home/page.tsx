"use client";
import React, { useState } from "react";
import { Sparkles, Megaphone, Presentation, CalendarRange, Image as ImageIcon, Save, CheckCircle2, Plus, Trash2, Truck, Edit2 } from "lucide-react";
import { useOffers } from "@/components/OffersProvider";
import { useProducts } from "@/components/ProductProvider";
import { supabase } from "@/lib/supabase";

export default function OffersAdmin() {
  const { 
    marqueeText, setMarqueeText, 
    eventBanners, setEventBanners, 
    isEventActive, setIsEventActive,
    galleryItems, setGalleryItems,
    activeCategories, setActiveCategories,
    activeCarousels, setActiveCarousels,
    isRazorpayEnabled, setIsRazorpayEnabled,
    isAiRecommendationsEnabled,
    deliveryRates, setDeliveryRates,
    whatsappNumber,
    featuredBentoIds,
    setFeaturedBentoIds,
    categorySubtitles,
    setCategorySubtitles,
    mobileCategoryImages,
    setMobileCategoryImages,
    designThumbnails,
    setDesignThumbnails,
    upcomingDrops,
    setUpcomingDrops
  } = useOffers();
  
  const { products } = useProducts();

  // Local state for edits
  const [localMarquee, setLocalMarquee] = useState(marqueeText);
  const [localBanners, setLocalBanners] = useState<string[]>(eventBanners);
  const [localIsActive, setLocalIsActive] = useState(isEventActive);
  const [localGallery, setLocalGallery] = useState<{image: string, text: string}[]>(galleryItems);
  const [localCategories, setLocalCategories] = useState<string[]>(activeCategories);
  const [localCarousels, setLocalCarousels] = useState<string[]>(activeCarousels || []);
  const [localSubtitles, setLocalSubtitles] = useState<Record<string, string>>(categorySubtitles || {});
  const [localMobileImages, setLocalMobileImages] = useState<Record<string, string>>(mobileCategoryImages || {});
  const [localRazorpay, setLocalRazorpay] = useState(isRazorpayEnabled);
  const [localDeliveryRates, setLocalDeliveryRates] = useState<Record<string, number>>(deliveryRates || {});
  const [localFeaturedBento, setLocalFeaturedBento] = useState<string[]>(featuredBentoIds || []);
  const [localDesignThumbnails, setLocalDesignThumbnails] = useState<Record<string, string>>(designThumbnails || {});
  const [localUpcomingDrops, setLocalUpcomingDrops] = useState<{ image: string; title: string; subtitle: string }[]>(upcomingDrops || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const uploadToCDN = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      const { error } = await supabase.storage.from('poster_store_media').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('poster_store_media').getPublicUrl(filePath);
      return data.publicUrl;
    } catch(err) {
      console.error(err);
      return null;
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return;
    const file = e.target.files[0];
    if(!file) return;

    if (localBanners.length >= 4) {
       alert("You can only upload up to 4 banners maximum.");
       return;
    }

    setIsSaving(true);
    const cdnUrl = await uploadToCDN(file, 'home_banners');
    if (cdnUrl) {
       setLocalBanners(prev => [...prev, cdnUrl]);
    } else {
       alert("Failed to upload Banner to CDN.");
    }
    setIsSaving(false);
  };

  const removeBanner = (indexToRemove: number) => {
    setLocalBanners(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const remainingSlots = 8 - localGallery.length;
    
    if (remainingSlots <= 0) {
       alert("Maximum 8 Gallery items allowed! Remove some first.");
       return;
    }
    
    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) alert(`Only room for ${remainingSlots} more. The rest were skipped.`);
    
    setIsSaving(true);
    for (const file of filesToProcess) {
       const url = await uploadToCDN(file, 'home_gallery');
       if (url) {
          setLocalGallery(current => {
             if (current.length >= 8) return current;
             return [...current, { image: url, text: "NEW" }];
          });
       }
    }
    setIsSaving(false);
    
    e.target.value = '';
  };

  const removeGalleryItem = (index: number) => {
    setLocalGallery(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleDesignThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if(!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsSaving(true);
    const url = await uploadToCDN(file, 'home_customizations');
    if (url) {
      setLocalDesignThumbnails(prev => ({ ...prev, [key]: url }));
    } else {
      alert(`Failed to upload thumbnail for ${key}`);
    }
    setIsSaving(false);
  };

  const toggleCategory = (cat: string) => {
    setLocalCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleCarousel = (cat: string) => {
    setLocalCarousels(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Merge existing untouched config variables from Provider context to prevent accidental data-loss
    const payload = {
       marqueeText: localMarquee,
       isEventActive: localIsActive,
       eventBanners: localBanners,
       galleryItems: localGallery,
       activeCategories: localCategories,
       activeCarousels: localCarousels,
       categorySubtitles: localSubtitles,
       mobileCategoryImages: localMobileImages,
       isRazorpayEnabled: localRazorpay,
       isAiRecommendationsEnabled: isAiRecommendationsEnabled, 
       featuredBentoIds: localFeaturedBento,
       designThumbnails: localDesignThumbnails,
       upcomingDrops: localUpcomingDrops,
       deliveryRates: deliveryRates // keep existing global untouched
    };

    try {
      await fetch('/api/config', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      });
      
      // Update Context for immediate local admin session visual layout sync, but DB is primary source of Truth
      setMarqueeText(localMarquee);
      setEventBanners(localBanners);
      setIsEventActive(localIsActive);
      setGalleryItems(localGallery);
      setActiveCategories(localCategories);
      setActiveCarousels(localCarousels);
      setCategorySubtitles(localSubtitles);
      setMobileCategoryImages(localMobileImages);
      setIsRazorpayEnabled(localRazorpay);
      setDeliveryRates(localDeliveryRates);
      setFeaturedBentoIds(localFeaturedBento);
      setUpcomingDrops(localUpcomingDrops);
      
      alert("Success! Global homepage customized and locked into API seamlessly!");
      setShowConfirmPopup(false);
    } catch(e) {
      alert("Failed to contact Internal API Server. Reload Required.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in flex flex-col w-full max-w-5xl mx-auto pb-32">
      
      {/* Header */}
      <div className="mb-8">
         <h1 className="text-3xl md:text-4xl font-outfit font-black uppercase text-white tracking-widest flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-400" /> 
            Homepage Settings
         </h1>
         <p className="text-gray-400 mt-2">Manage scrolling marquees, 3D animated galleries, category listings, and trending products globally.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
         
         {/* Bento Grid Selections */}
         <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
               <Sparkles className="w-6 h-6 text-emerald-400" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Bento Grid Products</h2>
            </div>
            
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Available Products (Click to Sync)</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto custom-scroll pr-2">
               {products.map(product => {
                 const isSelected = localFeaturedBento.includes(product.id);
                 return (
                   <div 
                     key={product.id}
                     onClick={() => {
                        setLocalFeaturedBento(prev => 
                          isSelected ? prev.filter(id => id !== product.id) : [...prev, product.id].slice(0, 6)
                        );
                     }}
                     className={`flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-black border-white/10 hover:border-white/30'}`}
                   >
                     <img src={product.images[0]} className="w-full aspect-[4/3] object-cover rounded shadow-inner" />
                     <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`}>{product.name}</p>
                     {isSelected && <div className="absolute top-2 right-2 bg-emerald-500 text-black p-1 rounded-full"><CheckCircle2 className="w-3 h-3" /></div>}
                   </div>
                 );
               })}
            </div>
            <p className="text-xs text-emerald-500 mt-4 font-bold uppercase tracking-widest">Select exactly up to 6 products for the homepage Grid layout.</p>
         </div>
         
         {/* Marquee Settings */}
         <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
               <Megaphone className="w-6 h-6 text-emerald-400" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Scrolling Marquee Text</h2>
            </div>
            
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Top Notice Text</label>
            <textarea 
               rows={2} 
               value={localMarquee}
               onChange={(e) => setLocalMarquee(e.target.value)}
               placeholder="e.g. 50% OFF ALL POSTERS THIS WEEKEND ONLY!"
               className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">This text scrolls infinitely just below the main navigation header on every public screen.</p>
         </div>

         {/* Event Banner Settings */}
         <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4 relative z-10">
               <div className="flex items-center gap-3">
                  <Presentation className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-white">Massive Global Event Banner</h2>
               </div>
               
               {/* Toggle Switch */}
               <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-widest ${localIsActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {localIsActive ? 'Live' : 'Hidden'}
                  </span>
                  <button 
                    onClick={() => setLocalIsActive(!localIsActive)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${localIsActive ? 'bg-emerald-500' : 'bg-gray-700'}`}
                  >
                     <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${localIsActive ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block">Upload Billboard Graphic (Up to 4)</label>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">{localBanners.length}/4 limit</span>
                  </div>

                  <div className={`border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-black/50 relative overflow-hidden group min-h-[140px] ${localBanners.length >= 4 ? 'opacity-50 cursor-not-allowed hidden' : 'cursor-pointer'}`}>
                     <input 
                       type="file" 
                       accept="image/*"
                       onChange={handleBannerUpload}
                       disabled={localBanners.length >= 4}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                     />
                     <Plus className="w-8 h-8 text-gray-500 mb-2 group-hover:text-emerald-400 transition-colors" />
                     <h4 className="font-bold text-white relative z-20 drop-shadow-md text-sm">
                        Add Carousel Graphic
                     </h4>
                     <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Recommended: 1920x600px (21:9)</p>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                     {localBanners.map((imgSrc, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-black border border-white/10 p-3 rounded-xl hover:border-white/20 transition-all select-none">
                           <div className="w-20 rounded overflow-hidden aspect-video border border-white/20 shrink-0 relative bg-zinc-900">
                              <img src={imgSrc} className="w-full h-full object-contain bg-[#0a0a0a]" />
                              <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[8px] px-1 font-bold">#{idx+1}</div>
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-white uppercase truncate">Banner_{idx+1}.jpg</p>
                              <p className="text-[10px] tracking-widest text-gray-500 uppercase">Live sequence</p>
                           </div>
                           <button onClick={() => removeBanner(idx)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black rounded-lg transition-colors cursor-pointer shrink-0">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                  </div>

                  {localBanners.length === 0 && (
                     <div className="text-xs font-bold uppercase tracking-widest mt-4 text-gray-600 border border-dashed border-gray-800 p-4 rounded-xl text-center">
                        No banners uploaded currently
                     </div>
                  )}
               </div>

               <div className="relative">
                  <div className="sticky top-4">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Live Sequence Preview</label>
                     <div className="w-full h-[300px] bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden relative shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                       
                       {localBanners.length > 0 ? (
                         <div className="w-full h-full relative group shadow-inner">
                           {/* Just show first one as preview demo here, UI hints there are plural */}
                           <img src={localBanners[0]} className="w-full h-full object-contain opacity-80" />
                           {localBanners.length > 1 && (
                             <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-white text-[8px] font-bold tracking-widest uppercase border border-white/10 flex items-center gap-1">
                                <Sparkles className="w-2 h-2 text-yellow-400" /> {localBanners.length} SLIDE CAROUSEL
                             </div>
                           )}
                         </div>
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center">
                           <span className="text-gray-600 font-bold uppercase tracking-widest text-[10px] border border-gray-800 bg-zinc-900 px-4 py-2 rounded-lg">Home Banner Sequence Empty</span>
                         </div>
                       )}

                       {/* Status specific overlay tag effect */}
                       {localIsActive && localBanners.length > 0 && (
                          <div className="absolute bottom-3 right-3 bg-emerald-500 text-black px-3 py-1 rounded shadow-lg text-[9px] font-black uppercase tracking-widest animate-pulse border border-emerald-400">Status: Currently Live!</div>
                       )}

                     </div>
                     <p className="text-[11px] text-gray-500 mt-4 leading-relaxed bg-black p-4 rounded-xl border border-white/5 uppercase tracking-widest">
                       If the Master switch is flicked Live, these images automatically mount into an elegant sliding Carousel seamlessly exclusively on the main Home Page.
                     </p>
                  </div>
               </div>
            </div>

         </div>

          {/* 3D Animated Posters Gallery */}
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <ImageIcon className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">3D Animated Posters</h2>
             </div>
             <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">Manage the floating circular gallery displayed on your homepage header.</p>
             <div className="flex flex-wrap gap-3 md:gap-4 mb-6">
                {localGallery.map((item, idx) => (
                   <div key={idx} className="relative group w-20 md:w-24 border border-white/10 bg-black rounded-xl overflow-hidden shrink-0">
                      <img src={item.image} className="w-full aspect-[3/4] object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button onClick={() => removeGalleryItem(idx)} className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                            <Trash2 className="w-3 h-3" />
                         </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1">
                         <input 
                           type="text" 
                           value={item.text}
                           onChange={(e) => {
                             const newGallery = [...localGallery];
                             newGallery[idx].text = e.target.value;
                             setLocalGallery(newGallery);
                           }}
                           className="w-full bg-zinc-900 text-[8px] md:text-[10px] font-bold text-center py-1 outline-none uppercase tracking-widest"
                        />
                      </div>
                   </div>
                ))}
             </div>

             <div className="w-full h-24 md:h-32 border-2 border-dashed border-white/20 hover:border-emerald-500 transition-colors rounded-2xl flex items-center justify-center cursor-pointer text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm relative">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={localGallery.length >= 8}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <div className="text-center">
                  <Plus className="w-6 h-6 md:w-8 md:h-8 mb-2" />
                  <span>+ Upload New 3D Graphic</span>
                </div>
             </div>
             <p className="text-xs text-gray-500 mt-3 text-center uppercase tracking-widest">Currently displaying {localGallery.length} active 3D posters. Requires 16:9 vertical format.</p>
          </div>

          {/* Interactive Categories Manager */}
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-4 md:p-8 relative overflow-hidden">
             <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                   <Presentation className="w-6 h-6 text-emerald-400" />
                   <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-white">Interactive Categories & Trending</h2>
                </div>
             </div>
              <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">Select which categories appear on the homepage collections menu and as individual carousels.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                 {Array.from(new Set(products.map(p => p.category))).concat("Shop All").map((cat) => (
                    <div key={cat} className="flex flex-col gap-2 p-3 bg-black border border-white/10 rounded-xl">
                       <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2 mb-1">{cat}</h3>
                       <div className="flex justify-between items-center gap-2">
                         <label className="flex flex-1 items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={localCategories.includes(cat)} 
                              onChange={() => toggleCategory(cat)}
                              className="accent-emerald-500 w-3 h-3 cursor-pointer flex-shrink-0" 
                            />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">Menu Grid</span>
                         </label>
                         {cat !== "Shop All" && (
                           <label className="flex flex-1 items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={localCarousels.includes(cat)} 
                                onChange={() => toggleCarousel(cat)}
                                className="accent-emerald-500 w-3 h-3 cursor-pointer flex-shrink-0" 
                              />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">Carousel</span>
                           </label>
                         )}
                       </div>
                       {/* Removed photo and caption configurators as requested to keep UI clean and responsive */}
                   </div>
                ))}
             </div>
             
             <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4">Trending/Best Selling Rule</h3>
                <select className="bg-black border border-white/10 px-4 py-3 rounded-xl text-white outline-none w-full md:w-1/2 uppercase tracking-widest text-xs font-bold font-mono text-gray-300">
                   <option>Auto-Calculate (Most Sold)</option>
                   <option>Manual Selection Only</option>
                   <option>Most Viewed Recent 30 Days</option>
                </select>
             </div>
          </div>
          
           {/* Store Settings / Payments */}
           <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden mt-2">
             <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                   <h2 className="text-xl font-bold uppercase tracking-widest text-white">Payment Gateway Lock</h2>
                </div>
             </div>
             <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-6">Toggle Online Payment functionality (Razorpay) on or off for the entire store.</p>
             <div className="flex items-center justify-between bg-black p-6 rounded-2xl border border-white/10 shadow-inner">
                <div>
                   <span className="font-bold text-white uppercase tracking-widest text-lg block">Razorpay Integration</span>
                   <span className="text-xs text-gray-500 mt-1 block max-w-sm">Disable this temporarily if the bank server is experiencing issues. Only COD will be available when disabled.</span>
                </div>
                <button 
                  onClick={() => setLocalRazorpay(!localRazorpay)}
                  className={`relative w-16 h-8 rounded-full transition-colors flex-shrink-0 border ${localRazorpay ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-800 border-white/10'}`}
                >
                  <span className={`absolute top-[1px] left-[2px] bg-white w-7 h-7 rounded-full transition-transform shadow flex items-center justify-center ${localRazorpay ? 'translate-x-[30px]' : 'translate-x-0'}`}>
                     {localRazorpay && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </span>
                </button>
             </div>
           </div>

           {/* Design Your Own Thumbnails Editor */}
           <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 relative mt-2">
             <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
               <ImageIcon className="w-6 h-6 text-purple-400" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Design Your Own Thumbnails</h2>
             </div>
             
             <p className="text-sm text-gray-400 mb-6">Upload preview thumbnails for the "Design Your Own" section on the homepage.</p>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { key: 'split', title: 'Split Posters' },
                  { key: 'retro', title: 'Retro Posters' },
                  { key: 'mini', title: 'Mini Pocket Photos' }
                ].map((item) => (
                  <div key={item.key} className="bg-black border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
                     <div className="text-center border-b border-white/5 pb-3">
                        <h4 className="text-white font-bold uppercase tracking-widest text-sm">{item.title}</h4>
                        <p className="text-[10px] text-gray-500 uppercase mt-1 tracking-widest">Base & Hover states</p>
                     </div>
                     
                     <div className="grid grid-cols-3 gap-3">
                        {/* MOBILE ONLY */}
                        <div className="group relative">
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center mb-2">Mobile Only</p>
                           {localDesignThumbnails[`${item.key}_mobile`] || localDesignThumbnails[item.key] ? (
                              <div className="aspect-[4/5] relative rounded-xl overflow-hidden border border-white/10">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img src={localDesignThumbnails[`${item.key}_mobile`] || localDesignThumbnails[item.key]} alt={`${item.title} Mobile`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-colors">
                                      Change
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDesignThumbnailUpload(e, `${item.key}_mobile`)} disabled={isSaving} />
                                    </label>
                                 </div>
                              </div>
                           ) : (
                              <label className="aspect-[4/5] relative rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors">
                                 <Plus className="w-5 h-5 text-gray-600 mb-1" />
                                 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center px-2">Upload</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDesignThumbnailUpload(e, `${item.key}_mobile`)} disabled={isSaving} />
                              </label>
                           )}
                        </div>

                        {/* DESKTOP BASE */}
                        <div className="group relative">
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center mb-2">Laptop Base</p>
                           {localDesignThumbnails[`${item.key}_desktop`] || localDesignThumbnails[item.key] ? (
                              <div className="aspect-[4/5] relative rounded-xl overflow-hidden border border-white/10">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img src={localDesignThumbnails[`${item.key}_desktop`] || localDesignThumbnails[item.key]} alt={`${item.title} Desktop`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-colors">
                                      Change
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDesignThumbnailUpload(e, `${item.key}_desktop`)} disabled={isSaving} />
                                    </label>
                                 </div>
                              </div>
                           ) : (
                              <label className="aspect-[4/5] relative rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors">
                                 <Plus className="w-5 h-5 text-gray-600 mb-1" />
                                 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center px-2">Upload</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDesignThumbnailUpload(e, `${item.key}_desktop`)} disabled={isSaving} />
                              </label>
                           )}
                        </div>

                        {/* DESKTOP HOVER */}
                        <div className="group relative">
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center mb-2">Laptop Hover</p>
                           {localDesignThumbnails[`${item.key}_hover`] ? (
                              <div className="aspect-[4/5] relative rounded-xl overflow-hidden border border-white/10">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img src={localDesignThumbnails[`${item.key}_hover`]} alt={`${item.title} Hover`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-colors">
                                      Change
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDesignThumbnailUpload(e, `${item.key}_hover`)} disabled={isSaving} />
                                    </label>
                                 </div>
                              </div>
                           ) : (
                              <label className="aspect-[4/5] relative rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors">
                                 <Plus className="w-5 h-5 text-gray-600 mb-1" />
                                 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center px-2">Upload</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDesignThumbnailUpload(e, `${item.key}_hover`)} disabled={isSaving} />
                              </label>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           </div>
           
           {/* Delivery Shipping Rules Editor completely removed to its dedicated page */}

           {/* Upcoming Drops Editor */}
           <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 relative mt-2">
             <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <CalendarRange className="w-6 h-6 text-rose-400" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Upcoming Drops</h2>
             </div>
             
             <p className="text-sm text-gray-400 mb-6 font-bold uppercase tracking-widest">Manage Sneak Peek previews for future releases. Maximum 3 drops.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((idx) => {
                   const drop = localUpcomingDrops[idx] || { image: '', title: '', subtitle: '' };
                   return (
                     <div key={idx} className="bg-black border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
                        <div className="aspect-square relative rounded-xl border border-white/10 overflow-hidden group">
                           {drop.image ? (
                              <React.Fragment>
                                 <img src={drop.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-colors">
                                      Change Graphic
                                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                          if(!e.target.files?.length) return;
                                          setIsSaving(true);
                                          const url = await uploadToCDN(e.target.files[0], 'home_upcoming');
                                          if (url) {
                                            const updated = [...localUpcomingDrops];
                                            if(!updated[idx]) updated[idx] = { image: '', title: '', subtitle: '' };
                                            updated[idx].image = url;
                                            setLocalUpcomingDrops(updated);
                                          }
                                          setIsSaving(false);
                                      }} disabled={isSaving} />
                                    </label>
                                 </div>
                              </React.Fragment>
                           ) : (
                              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-2 border-dashed border-white/10 m-2 rounded-lg">
                                 <Plus className="w-6 h-6 text-gray-600 mb-2" />
                                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upload Graphic</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                     if(!e.target.files?.length) return;
                                     setIsSaving(true);
                                     const url = await uploadToCDN(e.target.files[0], 'home_upcoming');
                                     if (url) {
                                       const updated = [...localUpcomingDrops];
                                       updated[idx] = { image: url, title: '', subtitle: '' };
                                       setLocalUpcomingDrops(updated);
                                     }
                                     setIsSaving(false);
                                 }} disabled={isSaving} />
                              </label>
                           )}
                        </div>
                        
                        <div className="flex flex-col gap-3">
                           <input 
                             type="text" 
                             placeholder="DROP TITLE (e.g. CYBERPUNK)" 
                             value={drop.title}
                             onChange={(e) => {
                                const updated = [...localUpcomingDrops];
                                if(!updated[idx]) updated[idx] = { image: '', title: '', subtitle: '' };
                                updated[idx].title = e.target.value;
                                setLocalUpcomingDrops(updated);
                             }}
                             className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white uppercase tracking-widest font-bold outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-700"
                           />
                           <input 
                             type="text" 
                             placeholder="SUBTITLE (e.g. COMING SOON)" 
                             value={drop.subtitle}
                             onChange={(e) => {
                                const updated = [...localUpcomingDrops];
                                if(!updated[idx]) updated[idx] = { image: '', title: '', subtitle: '' };
                                updated[idx].subtitle = e.target.value;
                                setLocalUpcomingDrops(updated);
                             }}
                             className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-rose-400 uppercase tracking-widest font-bold outline-none focus:border-rose-500 transition-colors placeholder:text-zinc-700"
                           />
                           <button 
                             onClick={() => {
                                const updated = [...localUpcomingDrops];
                                updated.splice(idx, 1);
                                setLocalUpcomingDrops(updated);
                             }}
                             className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors self-start mt-1"
                           >
                             Remove Drop
                           </button>
                        </div>
                     </div>
                   );
                })}
             </div>
           </div>
           
      </div>
      {/* Floating Action Menu */}
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
         <button 
           onClick={() => setShowConfirmPopup(true)}
           disabled={isSaving}
           className={`bg-emerald-500 hover:bg-emerald-400 text-black px-6 md:px-8 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1 ${isSaving ? 'opacity-80 scale-95 pointer-events-none' : ''}`}
         >
            {isSaving ? <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Pushing Live...' : 'Save & Publish Global Events'}
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
              <h3 className="text-2xl font-outfit font-black uppercase tracking-widest text-white mb-3">Confirm Changes</h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">Are you absolutely sure you want to push these settings globally? This will override current configurations and affect the live storefront immediately.</p>
              <div className="flex gap-4">
                 <button onClick={() => setShowConfirmPopup(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-3.5 font-bold uppercase tracking-widest text-xs transition-colors border border-white/10 hover:border-white/20">Cancel</button>
                 <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-black rounded-xl py-3.5 font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                   {isSaving ? 'Processing...' : 'Confirm & Push'}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
