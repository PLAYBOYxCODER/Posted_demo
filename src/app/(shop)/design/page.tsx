"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Upload, Image as ImageIcon, Type, Save, Layout, Monitor, Home, MonitorSpeaker, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";

const typeData: Record<string, { title: string, price: number, desc: string }> = {
  "split-poster": { title: "Split Poster (Triptych)", price: 999, desc: "A massive panoramic style, sliced perfectly across three separate modern panels." },
  "retro-prints": { title: "Retro Polaroid Prints", price: 499, desc: "Classic thick-bordered vintage photography style with iconic bottom caption." },
  "mini-pocket-photos": { title: "Mini Pocket Photos", price: 299, desc: "Adorable wallet-sized prints to keep your distinct memories close." },
  "booth-strip": { title: "Booth Strip", price: 199, desc: "Classic vertical 4-photo photo booth strip layout." }
};

const previewStyles = [
  { id: 'canvas', name: 'Digital Studio', icon: Layout, bg: null },
  { id: 'wall', name: 'Minimal Wall', icon: Home, bg: 'https://images.unsplash.com/photo-1598928506311-c55dd1b31122?auto=format&fit=crop&q=80&w=800' },
  { id: 'room', name: 'Living Room', icon: MonitorSpeaker, bg: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800' },
  { id: 'gaming', name: 'Gaming Setup', icon: Monitor, bg: 'https://images.unsplash.com/photo-1616423640778-28d1b1c2b513?auto=format&fit=crop&q=80&w=800' }
];

function DesignStudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Default to split-poster if no query param
  const initialType = searchParams.get('type') || 'split-poster';
  const [selectedType, setSelectedType] = useState(initialType);
  
  const config = typeData[selectedType] || typeData["split-poster"];
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [activePreview, setActivePreview] = useState(previewStyles[0].id);

  const { addToCart } = useCart();

  useEffect(() => {
    const qType = searchParams.get('type');
    if (qType && typeData[qType]) {
      setSelectedType(qType);
    }
  }, [searchParams]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // Compress down to prevent LocalStorage Quota Exceeded
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImagePreview(canvas.toDataURL("image/jpeg", 0.7)); 
        };
        if (reader.result) img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    if (!imagePreview) return alert("Please upload a photo first to design your custom order!");
    
    addToCart({
      id: `custom_${selectedType}_${Date.now()}`,
      name: `Custom ${config.title}`,
      price: config.price,
      image: imagePreview,
      quantity: 1,
      size: "Custom Fit",
      finish: `Type: ${config.title} | ${customText ? 'Text: ' + customText : 'No Text'}`
    });
  };

  const currentPreview = previewStyles.find(p => p.id === activePreview)!;

  // Visual renderers based on the Customization Type user selected
  const renderCustomizedOutput = () => {
     if (!imagePreview) return null;

     // 1. SPLIT POSTER (Triptych Panel Design)
     if (selectedType === 'split-poster') {
        return (
           <div className="flex gap-2 w-full h-[80%] items-center justify-center p-4">
              <div className="w-1/3 h-full bg-white shadow-2xl bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview})`, backgroundPosition: 'left center' }} />
              <div className="w-1/3 h-[105%] bg-white shadow-2xl bg-cover bg-center z-10" style={{ backgroundImage: `url(${imagePreview})`, backgroundPosition: 'center center' }} />
              <div className="w-1/3 h-full bg-white shadow-2xl bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview})`, backgroundPosition: 'right center' }} />
           </div>
        );
     }
     
     // 2. RETRO POLAROID (White Border with Thick bottom & Text)
     if (selectedType === 'retro-prints') {
        return (
           <div className="w-2/3 md:w-1/2 aspect-[0.8] bg-[#f8f8f8] p-4 pb-12 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col items-center justify-start transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full bg-cover bg-center border border-black/10 shadow-inner" style={{ backgroundImage: `url(${imagePreview})` }} />
              <p className="absolute bottom-4 font-black uppercase text-black font-outfit text-sm tracking-widest opacity-80">{customText || "YOUR CAPTION"}</p>
           </div>
        );
     }

     // 3. BOOTH STRIP (4 stacked vertical squares)
     if (selectedType === 'booth-strip') {
        return (
           <div className="h-[90%] w-1/4 min-w-[100px] bg-white p-2 shadow-2xl flex flex-col gap-2 rounded-sm rotate-2 hover:rotate-0 transition-transform">
              <div className="w-full flex-1 bg-cover bg-center border border-black/10" style={{ backgroundImage: `url(${imagePreview})` }} />
              <div className="w-full flex-1 bg-cover bg-center border border-black/10" style={{ backgroundImage: `url(${imagePreview})` }} />
              <div className="w-full flex-1 bg-cover bg-center border border-black/10" style={{ backgroundImage: `url(${imagePreview})` }} />
              <div className="w-full flex-1 bg-cover bg-center border border-black/10" style={{ backgroundImage: `url(${imagePreview})` }} />
              {customText && <p className="text-[8px] font-bold text-center text-black uppercase">{customText}</p>}
           </div>
        );
     }

     // 4. MINI POCKET PHOTOS (Grid of 4 small cards)
     if (selectedType === 'mini-pocket-photos') {
        return (
           <div className="w-3/4 aspect-square grid grid-cols-2 grid-rows-2 gap-4 p-4">
              <div className="bg-white p-2 shadow-lg rotate-[-3deg] hover:rotate-0 transition-all z-10 hover:z-20"><img src={imagePreview} className="w-full h-full object-cover"/></div>
              <div className="bg-white p-2 shadow-lg rotate-[4deg] hover:rotate-0 transition-all z-10 hover:z-20 mt-4"><img src={imagePreview} className="w-full h-full object-cover"/></div>
              <div className="bg-white p-2 shadow-lg rotate-[2deg] hover:rotate-0 transition-all z-10 hover:z-20 -mt-2"><img src={imagePreview} className="w-full h-full object-cover"/></div>
              <div className="bg-white p-2 shadow-lg rotate-[-5deg] hover:rotate-0 transition-all z-10 hover:z-20 mt-6"><img src={imagePreview} className="w-full h-full object-cover"/></div>
           </div>
        );
     }

     return null;
  };

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-sm text-gray-400 uppercase tracking-widest font-semibold font-outfit">
          <Link href="/" className="hover:text-white transition-colors">Home</Link> &gt; Design &gt; <span className="text-white">{config.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* ======== LEFT: Contextual Preview Canvas ======== */}
          <div className="flex flex-col gap-4">
             <div className={`bg-zinc-900 rounded-2xl border border-white/10 p-0 flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden group ${currentPreview.id === 'canvas' ? 'bg-[url(/grid.png)] bg-center bg-repeat' : ''}`}>
               <div className="absolute top-4 left-4 z-20 bg-black/50 px-3 py-1 rounded-full text-xs uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-lg">Live Preview Mode</div>
               
               {currentPreview.bg && (
                 <img src={currentPreview.bg} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity brightness-50 contrast-125 transition-all duration-1000" alt="Environment" />
               )}

               {imagePreview ? (
                 <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
                     {renderCustomizedOutput()}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center text-gray-400 opacity-60 z-10 relative bg-black/40 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
                   <ImageIcon className="w-20 h-20 mb-4" />
                   <p className="font-outfit text-xl uppercase tracking-widest text-center">Upload Image<br/>to generate Output</p>
                 </div>
               )}
             </div>

             {/* Environment Switcher */}
             <div className="grid grid-cols-4 gap-2">
               {previewStyles.map(style => (
                 <button 
                   key={style.id}
                   onClick={() => setActivePreview(style.id)}
                   className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${activePreview === style.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-black border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                 >
                   <style.icon className="w-5 h-5" />
                   <span className="text-[10px] uppercase tracking-widest text-center hidden sm:block">{style.name}</span>
                 </button>
               ))}
             </div>
          </div>

          {/* ======== RIGHT: Engineering Controls ======== */}
          <div className="flex flex-col justify-start">
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase mb-4 leading-tight">Craft your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{config.title}</span></h1>
            <p className="text-gray-400 mb-10 text-lg">{config.desc}</p>

            <div className="bg-black border border-white/10 rounded-2xl p-6 mb-8 shadow-inner">
               <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-emerald-500 flex items-center gap-2"><Settings className="w-4 h-4" /> Configure Canvas Format</label>
               <select 
                 value={selectedType} 
                 onChange={(e) => {
                   setSelectedType(e.target.value);
                   // Push URL discreetly to preserve link-sharing states without hard reloads
                   router.replace(`/design?type=${e.target.value}`, { scroll: false });
                 }} 
                 className="w-full bg-zinc-900 border border-white/20 rounded-xl px-4 py-4 text-white uppercase font-outfit font-bold tracking-widest focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xl cursor-pointer"
               >
                 {Object.entries(typeData).map(([key, data]) => (
                   <option key={key} value={key}>{data.title} - ₹{data.price}</option>
                 ))}
               </select>
            </div>

            {/* Upload Control */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">1. Master Upload Source <span className="text-red-500">*</span></label>
              <div className={`relative border-2 border-dashed transition-all rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-900/30 cursor-pointer group ${imagePreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 hover:border-white/50'}`}>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <Upload className={`w-8 h-8 mb-3 transition-colors ${imagePreview ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400'}`} />
                <p className="text-sm text-gray-300 font-bold uppercase tracking-widest text-center">{imagePreview ? "Graphic Successfully Mounted. Click to Replace." : "Click or Drop High Quality Assets"}</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-black tracking-widest">Supports JPG & PNG</p>
              </div>
            </div>

            {/* Text Control */}
            <div className="mb-10">
              <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">2. Inscription / Text (Optional)</label>
              <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., THE BEST DAY EVER" 
                  className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all uppercase font-outfit font-bold tracking-wider shadow-inner"
                  maxLength={30}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-auto border-t border-white/10 pt-8 relative z-20">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-gray-500 uppercase tracking-widest font-black text-[10px] bg-white/5 px-3 py-1 rounded border border-white/10">Configuration Subtotal</span>
                 <span className="text-4xl font-black font-outfit text-white drop-shadow-md">₹{config.price}</span>
               </div>
               <button 
                 onClick={handleAddToCart}
                 className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all transform hover:-translate-y-0.5 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3"
               >
                 <Save className="w-5 h-5" /> Finalize Customization to Cart
               </button>
               <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">Handcrafted manually • Ships in 3-7 Business days</p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DesignYourOwnPageWrap() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white"><span className="animate-pulse">LOADING WORKSPACE...</span></div>}>
      <DesignStudioContent />
    </Suspense>
  );
}
