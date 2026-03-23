"use client";
import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, Check, Info, ShoppingCart, RefreshCw } from "lucide-react";

export default function CustomPosterPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Customization States
  const [size, setSize] = useState("a3");
  const [frame, setFrame] = useState("black");
  const [finish, setFinish] = useState("matte");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pricing Logic
  const calculatePrice = () => {
    let base = 599; // A4 Base
    if (size === "a3") base = 899;
    if (size === "a2") base = 1299;
    
    if (frame === "black" || frame === "white") base += 300;
    if (frame === "wood") base += 450;
    
    if (finish === "glossy") base += 100;

    return base;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);


  // Dynamic Frame Styles
  const getFrameStyles = () => {
    if (frame === "none") return { padding: "0px", backgroundColor: "transparent" };
    if (frame === "black") return { padding: "16px", backgroundColor: "#111", border: "1px solid #333", boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)" };
    if (frame === "white") return { padding: "16px", backgroundColor: "#fdfdfd", border: "1px solid #ddd", boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)" };
    if (frame === "wood") return { padding: "16px", backgroundColor: "#8b5a2b", backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')", border: "1px solid #5c3c1a", boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)" };
    return {};
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-20 font-inter animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-outfit font-black tracking-tight mb-4">
            Print Your <span className="text-emerald-400">Masterpiece</span>
          </h1>
          <p className="text-gray-400 text-lg">
             Upload your favorite photo, digital art, or memory, and we'll craft it into a premium gallery-quality poster sent straight to your door.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* LEFT: UPLOAD & PREVIEW AREA */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
             
             {!imagePreview ? (
                // EMPTY UPLOAD STATE
                <div 
                  className={`w-full max-w-2xl aspect-[3/4] md:aspect-square lg:aspect-[4/5] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all duration-300 cursor-pointer ${
                    isHovering 
                      ? "border-emerald-500 bg-emerald-500/5 scale-[1.02]" 
                      : "border-white/20 bg-white/5 hover:border-emerald-400/50 hover:bg-white/10"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 ${isHovering ? "bg-emerald-500 text-black scale-110" : "bg-white/10 text-gray-400"}`}>
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Drag & Drop your high-res artwork</h3>
                  <p className="text-gray-500 mb-8 max-w-sm">
                    Supports JPG, PNG, WEBP. We recommend dimensions of at least 2000x3000px for the highest print quality.
                  </p>
                  <button className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-emerald-400 transition-colors shadow-xl hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                    Browse Files
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileChange}
                  />
                </div>
             ) : (
                // PREVIEW STATE
                <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-700">
                  <div 
                    className="relative max-w-lg w-full aspect-[3/4] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500"
                    style={getFrameStyles()}
                  >
                     <div className={`w-full h-full relative overflow-hidden ${finish === 'glossy' ? 'after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/0 after:to-white/20 after:pointer-events-none' : ''}`}>
                       <img 
                         src={imagePreview} 
                         alt="Your Custom Poster" 
                         className="w-full h-full object-cover"
                       />
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                       setImagePreview(null);
                       setImageFile(null);
                    }}
                    className="mt-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Change Image
                  </button>
                </div>
             )}

          </div>

          {/* RIGHT: CUSTOMIZATION PANEL */}
          <div className="lg:col-span-5 xl:col-span-4 bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl sticky top-24">
             <h3 className="text-2xl font-outfit font-black tracking-widest uppercase mb-8 border-b border-white/10 pb-4">Configuration</h3>
             
             {/* SIZE OPTIONS */}
             <div className="mb-8">
               <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex justify-between">
                 Canvas Size <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">Required</span>
               </h4>
               <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: "a4", name: "A4", dim: "21x30 cm" },
                   { id: "a3", name: "A3", dim: "30x42 cm" },
                   { id: "a2", name: "A2", dim: "42x60 cm" },
                 ].map((s) => (
                   <button
                     key={s.id}
                     onClick={() => setSize(s.id)}
                     className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all duration-200 ${
                       size === s.id 
                         ? "border-emerald-500 bg-emerald-500/10 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                         : "border-white/10 bg-black hover:border-white/30"
                     }`}
                   >
                     <span className={`font-black text-lg ${size === s.id ? "text-emerald-400" : "text-white"}`}>{s.name}</span>
                     <span className="text-gray-500 text-[10px] mt-1">{s.dim}</span>
                   </button>
                 ))}
               </div>
             </div>

             {/* FRAME OPTIONS */}
             <div className="mb-8">
               <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Frame Style</h4>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { id: "none", name: "Unframed", desc: "Rolled canvas" },
                   { id: "black", name: "Black Metal", desc: "+ ₹300" },
                   { id: "white", name: "White Wood", desc: "+ ₹300" },
                   { id: "wood", name: "Natural Oak", desc: "+ ₹450" },
                 ].map((f) => (
                   <button
                     key={f.id}
                     onClick={() => setFrame(f.id)}
                     className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                       frame === f.id 
                         ? "border-emerald-500 bg-emerald-500/10" 
                         : "border-white/10 bg-black hover:border-white/30"
                     }`}
                   >
                     <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full border border-white/20 ${
                           f.id === 'none' ? 'bg-transparent border-dashed' : 
                           f.id === 'black' ? 'bg-[#111]' : 
                           f.id === 'white' ? 'bg-white' : 'bg-[#8b5a2b]'
                        }`} />
                        <span className={`font-bold text-sm ${frame === f.id ? "text-emerald-400" : "text-white"}`}>{f.name}</span>
                     </div>
                     <span className="text-gray-500 text-[10px]">{f.desc}</span>
                   </button>
                 ))}
               </div>
             </div>

             {/* FINISH OPTIONS */}
             <div className="mb-10">
               <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                 Paper Finish
                 <Info className="w-3.5 h-3.5 text-gray-600" />
               </h4>
               <div className="flex bg-black border border-white/10 rounded-lg p-1">
                 <button 
                   onClick={() => setFinish("matte")}
                   className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${finish === 'matte' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                 >
                   Matte
                 </button>
                 <button 
                   onClick={() => setFinish("glossy")}
                   className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${finish === 'glossy' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                 >
                   Glossy (+₹100)
                 </button>
               </div>
             </div>

             {/* TOTAL & SUBMIT */}
             <div className="mt-auto pt-6 border-t border-white/10">
               <div className="flex justify-between items-end mb-6">
                 <div>
                   <span className="text-sm text-gray-400 block mb-1">Total Amount</span>
                   <div className="font-outfit font-black text-3xl text-emerald-400 tracking-tight">
                     ₹{calculatePrice()}
                   </div>
                 </div>
                 <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                   Free Shipping
                 </span>
               </div>

               <button 
                 disabled={!imageFile}
                 className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300 ${
                   imageFile 
                     ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)] transform hover:-translate-y-1 cursor-pointer" 
                     : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
                 }`}
               >
                 {imageFile ? <ShoppingCart className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                 {imageFile ? "Add to Cart" : "Upload Image First"}
               </button>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}
