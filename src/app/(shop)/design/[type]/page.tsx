"use client";
import React, { useState } from "react";
import { Upload, Image as ImageIcon, Type, Save, Layout, Monitor, Home, MonitorSpeaker } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

const typeData: Record<string, { title: string, price: number, desc: string }> = {
  "split-poster": { title: "Split Poster", price: 999, desc: "A massive, multi-panel continuous wall piece." },
  "retro-prints": { title: "Retro Prints", price: 499, desc: "Classic polaroid-style vintage photos." },
  "mini-pocket-photos": { title: "Mini Pocket Photos", price: 299, desc: "Wallet-sized adorable prints." },
  "booth-strip": { title: "Booth Strip", price: 199, desc: "Classic 4-photo photo booth strip." }
};

const previewStyles = [
  { id: 'canvas', name: 'Digital Canvas', icon: Layout, bg: null },
  { id: 'wall', name: 'Minimal Wall', icon: Home, bg: 'https://images.unsplash.com/photo-1598928506311-c55dd1b31122?auto=format&fit=crop&q=80&w=800' },
  { id: 'room', name: 'Living Room', icon: MonitorSpeaker, bg: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800' },
  { id: 'gaming', name: 'Gaming Desk', icon: Monitor, bg: 'https://images.unsplash.com/photo-1616423640778-28d1b1c2b513?auto=format&fit=crop&q=80&w=800' }
];

export default function DesignYourOwnPage({ params }: { params: Promise<{ type: string }> }) {
  const unwrappedParams = use(params);
  const typeKey = unwrappedParams.type.toLowerCase();
  const config = typeData[typeKey] || { title: typeKey.replace(/-/g, " "), price: 499, desc: "Custom designed tailored masterpiece." };
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [activePreview, setActivePreview] = useState(previewStyles[0].id);

  const { addToCart } = useCart();
  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600; // Compress down to prevent LocalStorage Quota Exceeded
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
      id: `custom_${typeKey}_${Date.now()}`,
      name: `Custom ${config.title}`,
      price: config.price,
      image: imagePreview,
      quantity: 1,
      size: "Custom Fit",
      finish: customText ? `Text: ${customText}` : "Standard Blank"
    });
    
    router.push('/cart');
  };

  const currentPreview = previewStyles.find(p => p.id === activePreview)!;

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 text-sm text-gray-400 uppercase tracking-widest font-semibold font-outfit">
          <Link href="/" className="hover:text-white transition-colors">Home</Link> &gt; Design &gt; <span className="text-white">{config.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT: Preview Canvas */}
          <div className="flex flex-col gap-4">
             <div className="bg-zinc-900 rounded-2xl border border-white/10 p-0 flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden group">
               <div className="absolute top-4 left-4 z-20 bg-black/50 px-3 py-1 rounded-full text-xs uppercase tracking-wider backdrop-blur-md border border-white/10">Preview Environment</div>
               
               {/* Background Environment Image */}
               {currentPreview.bg && (
                 <img src={currentPreview.bg} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Environment" />
               )}

               {imagePreview ? (
                 <div className={`relative bg-white shadow-2xl transition-all duration-700 ease-out z-10 flex flex-col ${currentPreview.id === 'canvas' ? 'w-full max-w-md aspect-[3/4] p-2 md:p-4 rotate-1 group-hover:rotate-0' : 'w-1/2 aspect-[3/4] border-4 border-black p-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'}`}>
                   <img src={imagePreview} alt="User Upload" className="w-full h-full object-cover rounded-sm flex-1" />
                   {currentPreview.id === 'canvas' && (
                      <div className="h-[15%] shrink-0 flex items-center justify-center mt-2">
                        <p className="text-black font-outfit font-bold text-center uppercase tracking-widest text-lg md:text-2xl w-full break-words">
                          {customText || "YOUR TEXT"}
                        </p>
                      </div>
                   )}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center text-gray-400 opacity-60 z-10 relative bg-black/50 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
                   <ImageIcon className="w-20 h-20 mb-4" />
                   <p className="font-outfit text-xl uppercase tracking-widest text-center">Upload Image<br/>to generate Preview</p>
                 </div>
               )}
             </div>

             {/* Environment Switcher */}
             <div className="grid grid-cols-4 gap-2">
               {previewStyles.map(style => (
                 <button 
                   key={style.id}
                   onClick={() => setActivePreview(style.id)}
                   className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${activePreview === style.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-black border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                 >
                   <style.icon className="w-5 h-5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-center">{style.name}</span>
                 </button>
               ))}
             </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="flex flex-col justify-start">
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase mb-4">Design your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{config.title}</span></h1>
            <p className="text-gray-400 mb-10 text-lg">{config.desc}</p>

            {/* Upload Control */}
            <div className="mb-8">
              <label className="block text-sm font-bold uppercase tracking-widest mb-3 text-gray-300">1. Upload Photo <span className="text-red-500">*</span></label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-emerald-500/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-900/50 cursor-pointer group">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                <p className="text-sm text-gray-300 font-bold uppercase tracking-widest">{imagePreview ? "Replace Currently Uploaded Photo" : "Click or Drag High Quality Image"}</p>
                <p className="text-[10px] text-emerald-500/80 mt-2 uppercase font-black tracking-widest">Supports JPG & PNG</p>
              </div>
            </div>

            {/* Text Control */}
            <div className="mb-10">
              <label className="block text-sm font-bold uppercase tracking-widest mb-3 text-gray-300">2. Add Custom Text (Optional)</label>
              <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400" />
                <input 
                  type="text" 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., THE BEST DAY EVER" 
                  className="w-full bg-zinc-900 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors uppercase font-outfit font-bold tracking-wider"
                  maxLength={30}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-auto border-t border-white/10 pt-8">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-gray-400 uppercase tracking-widest font-bold text-xs">Total Configuration</span>
                 <span className="text-4xl font-black font-outfit text-emerald-400">₹{config.price}</span>
               </div>
               <button 
                 onClick={handleAddToCart}
                 className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3"
               >
                 <Save className="w-5 h-5" /> Push Custom Design to Cart
               </button>
               <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">Handmade and Shipped • Estimated delivery: 3-7 Business days</p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}
