"use client";
import React, { useState } from "react";
import { Upload, ShoppingCart, Image as ImageIcon, Frame, Sparkles, Wand2, X, CheckCircle2, ArrowRight } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STYLES = [
  { id: "borderless", name: "Modern Borderless", priceAdd: 0 },
  { id: "polaroid", name: "Retro Polaroid", priceAdd: 100 },
  { id: "black-frame", name: "Classic Black Frame", priceAdd: 300 },
  { id: "neon-glow", name: "Neon Glow Outline", priceAdd: 500 }
];

export default function CustomPosterPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const basePrice = 699;
  const imageCount = Math.max(1, uploadedImages.length);
  const finalPrice = (basePrice + selectedStyle.priceAdd) * quantity * imageCount;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400; // Aggressive downsampling to prevent Local Storage Quota crash
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setUploadedImages(prev => [...prev, canvas.toDataURL("image/jpeg", 0.5)]);
        };
        if(event.target?.result) img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddToCart = () => {
    if (uploadedImages.length === 0) return;
    setIsAdding(true);
    
    uploadedImages.forEach((img, i) => {
      addToCart({
        id: `custom_${Date.now()}_${i}`,
        name: `Custom Design - ${selectedStyle.name} (${i+1}/${uploadedImages.length})`,
        price: basePrice + selectedStyle.priceAdd,
        quantity: quantity,
        image: img,
        size: "A3"
      });
    });

    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(true);
    }, 600);
  };

  const handleResetForNextOrder = () => {
    setShowSuccess(false);
    setUploadedImages([]);
    setActiveIndex(0);
    setQuantity(1);
  };

  const getStyleClasses = () => {
    switch (selectedStyle.id) {
      case "polaroid": return "p-4 pb-16 bg-white shadow-xl";
      case "black-frame": return "border-[16px] border-zinc-900 border-x-[#1a1a1a] border-y-[#0a0a0a] shadow-[0_30px_60px_rgba(0,0,0,0.6)]";
      case "neon-glow": return "rounded-xl border border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] bg-black p-1";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto relative">
      
      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-outfit font-black uppercase tracking-widest text-white mb-2">Added to Cart!</h2>
              <p className="text-gray-400 text-sm mb-8">Your custom design is securely loaded in your cart queue.</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleResetForNextOrder}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs transition-colors"
                >
                  Create Another Custom Poster
                </button>
                <Link href="/shop" className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2">
                  Browse Pre-made Collection
                </Link>
                <button 
                  onClick={() => router.push('/cart')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1 mt-2"
                >
                  Proceed to Checkout
                </button>
              </div>
           </div>
        </div>
      )}

      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-4 flex items-center justify-center gap-3">
          <Wand2 className="text-emerald-400 w-10 h-10" /> Create Your Own
        </h1>
        <p className="text-gray-400 uppercase tracking-widest text-sm">Upload your favorite memories, select a premium style, and build your custom masterpiece.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* LEFT COMPOSER PANEL */}
        <div className="w-full lg:w-7/12 sticky top-28 hidden lg:block">
           <div className="w-full aspect-[4/5] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col p-6 shadow-2xl relative">
              
              {uploadedImages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <ImageIcon className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest">Awaiting Your Photos</p>
                </div>
              ) : (
                <>
                  <div className={`relative w-full flex-1 flex items-center justify-center overflow-hidden transition-all duration-500 rounded-2xl ${selectedStyle.id === "polaroid" ? "bg-[#f5f5f5]" : "bg-zinc-800"} ${getStyleClasses()}`}>
                     <img src={uploadedImages[activeIndex]} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  {/* Thumbnail Selector */}
                  {uploadedImages.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scroll">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} onClick={() => setActiveIndex(idx)} className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-colors ${activeIndex === idx ? 'border-emerald-500' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

           </div>
        </div>

        {/* RIGHT CONTROLS PANEL */}
        <div className="w-full lg:w-5/12 space-y-8">
           
           {/* Mobile View Preview Box*/}
           <div className="lg:hidden w-full aspect-square bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col p-4 relative">
              {uploadedImages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Awaiting Photos</p>
                </div>
              ) : (
                <>
                  <div className={`relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-xl ${getStyleClasses()}`}>
                     <img src={uploadedImages[activeIndex]} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  {uploadedImages.length > 1 && (
                    <div className="flex gap-2 mt-2 py-2 overflow-x-auto hide-scrollbar">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} onClick={() => setActiveIndex(idx)} className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer border ${activeIndex === idx ? 'border-emerald-500' : 'border-transparent opacity-50'}`}>
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
           </div>

           {/* Step 1: Upload */}
           <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 relative">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm">1</div>
                 <h2 className="text-xl font-bold uppercase tracking-widest">Upload Image</h2>
              </div>
              
               {!uploadedImages.length ? (
                <div className="border-2 border-dashed border-white/20 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative">
                   <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   <Upload className="w-10 h-10 text-emerald-400 mb-4" />
                   <h3 className="font-bold uppercase tracking-widest text-sm mb-2">Tap to Select Multiple Photos</h3>
                   <p className="text-xs text-gray-500">HD JPG, PNG, WEBP (Max 20MB)</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-black border border-emerald-500/30 p-4 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-zinc-800 overflow-hidden shrink-0 relative">
                         <img src={uploadedImages[0]} className="w-full h-full object-cover opacity-80" />
                         <div className="absolute inset-0 flex items-center justify-center font-black text-xs">+{uploadedImages.length}</div>
                      </div>
                      <div>
                         <p className="font-bold text-sm text-emerald-400 uppercase">{uploadedImages.length} Image(s) Loaded</p>
                         <p className="text-xs text-gray-500">Ready for bulk styling</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="relative overflow-hidden cursor-pointer bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors border border-white/10">
                        <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <span className="text-xs font-bold uppercase mapping-widest">Add More</span>
                     </div>
                     <button 
                       onClick={() => { setUploadedImages([]); setActiveIndex(0); }}
                       className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </div>
                </div>
              )}
           </div>

           {/* Step 2: Choose Style */}
           <div className={`bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 transition-opacity duration-300 ${!uploadedImages.length ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm">2</div>
                 <h2 className="text-xl font-bold uppercase tracking-widest">Select Frame / Style</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`text-left p-4 rounded-xl border transition-all ${selectedStyle.id === style.id ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-black border-white/10 hover:border-white/30'}`}
                    >
                       <Frame className={`w-6 h-6 mb-3 ${selectedStyle.id === style.id ? 'text-emerald-400' : 'text-gray-500'}`} />
                       <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-1">{style.name}</h3>
                       <p className={`text-xs font-bold ${selectedStyle.id === style.id ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {style.priceAdd > 0 ? `+ ₹${style.priceAdd}` : 'Included'}
                       </p>
                    </button>
                 ))}
              </div>
           </div>

           {/* Step 3: Add to Cart */}
           <div className={`bg-black border border-emerald-500/20 rounded-3xl p-6 md:p-8 transition-opacity duration-300 ${!uploadedImages.length ? 'opacity-50 pointer-events-none' : ''}`}>
              
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                 <div>
                    <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-1">Base Print (A3)</h3>
                    <p className="text-white font-mono">₹{basePrice}</p>
                 </div>
                 <div className="text-right">
                    <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-1">Style Addition</h3>
                    <p className="text-emerald-400 font-mono">+{selectedStyle.priceAdd > 0 ? `₹${selectedStyle.priceAdd}` : 'Free'}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10 text-sm">
                 <span className="text-gray-400 uppercase tracking-widest font-bold">Total Designs:</span>
                 <span className="font-mono text-white bg-white/10 px-3 py-1 rounded font-bold">{uploadedImages.length} Image(s)</span>
              </div>
              
              <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-2xl font-outfit font-black mb-1 text-emerald-400 tracking-wider">₹{finalPrice.toLocaleString()}</h3>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Free Shipping Applicable</p>
                 </div>
                 
                 <div className="flex flex-col items-end">
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Copies per Image</p>
                   <div className="flex items-center gap-4 bg-zinc-900 border border-white/10 rounded-xl px-2 py-1">
                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 text-xl hover:text-emerald-400 transition-colors">-</button>
                     <span className="font-bold min-w-[20px] text-center">{quantity}</span>
                     <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 text-xl hover:text-emerald-400 transition-colors">+</button>
                   </div>
                 </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isAdding || uploadedImages.length === 0}
                className={`w-full bg-emerald-500 text-black py-5 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${isAdding ? 'opacity-80 scale-95' : 'hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1'}`}
              >
                 {isAdding ? <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" /> : <ShoppingCart className="w-5 h-5" />}
                 {isAdding ? 'Processing Batch...' : `Add All ${uploadedImages.length} to Cart`}
              </button>
           </div>

        </div>
      </div>
    </div>
  );
}
