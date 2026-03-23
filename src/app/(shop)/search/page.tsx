"use client";
import React, { useState } from "react";
import "./CosmicSearch.css";
import { useProducts } from "@/components/ProductProvider";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CosmicSearchPage() {
  const [query, setQuery] = useState("");
  const { products } = useProducts();
  const router = useRouter();

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const liveResults = query.trim().length > 0 
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start pt-32 px-4 selection:bg-blue-500/30">
      <div className="galaxy"></div>
      
      <button 
        onClick={() => router.back()}
        className="absolute top-8 right-8 z-50 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center gap-6 mt-16 md:mt-24">
         
         <div id="search-container">
           <div className="nebula"></div>
           <div className="starfield"></div>
           <div className="cosmic-dust"></div>
           <div className="cosmic-dust"></div>
           <div className="cosmic-dust"></div>
         
           <div className="stardust"></div>
         
           <div className="cosmic-ring"></div>
         
           <div id="main">
             <input
               autoFocus
               className="cosmic-input"
               name="text"
               type="text"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={handleSearchSubmit}
               placeholder="Explore the cosmos..."
             />
             <div id="input-mask"></div>
             <div id="cosmic-glow"></div>
             <div className="wormhole-border"></div>
             <div id="wormhole-icon" onClick={() => {
                if (query.trim()) router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
             }}>
               <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="#a9c7ff" fill="none" height="20" width="20" viewBox="0 0 24 24">
                 <circle r="10" cy="12" cx="12"></circle>
                 <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                 <path d="M2 12h20"></path>
               </svg>
             </div>
             <div id="search-icon">
               <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="url(#cosmic-search)" fill="none" height="24" width="24" viewBox="0 0 24 24">
                 <circle r="8" cy="11" cx="11"></circle>
                 <line y2="16.65" x2="16.65" y1="21" x1="21"></line>
                 <defs>
                   <linearGradient gradientTransform="rotate(45)" id="cosmic-search">
                     <stop stopColor="#a9c7ff" offset="0%"></stop>
                     <stop stopColor="#6e8cff" offset="100%"></stop>
                   </linearGradient>
                 </defs>
               </svg>
             </div>
           </div>
         </div>

         <div className="w-full transition-all duration-500 max-h-[50vh] overflow-y-auto mt-6 rounded-2xl">
            {liveResults.length > 0 ? (
               <div className="bg-[#05071b]/80 backdrop-blur-xl border border-[#4d6dff]/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(77,109,255,0.1)] flex flex-col">
                  {liveResults.map(product => (
                     <Link 
                       key={product.id} 
                       href={`/product/${product.id}`}
                       className="flex items-center gap-4 p-4 border-b border-[#4d6dff]/10 hover:bg-[#4d6dff]/10 transition-colors text-left group"
                     >
                       <img src={product.images[0]} className="w-14 h-16 object-cover rounded shadow-md group-hover:scale-105 transition-transform" alt={product.name}/>
                       <div className="flex-1">
                          <p className="font-outfit font-black text-[#a9c7ff] uppercase tracking-widest text-sm">{product.name}</p>
                          <p className="text-[10px] text-[#6e8cff] uppercase font-bold">{product.category} • ₹{product.price}</p>
                       </div>
                       <ArrowRight className="w-5 h-5 text-[#4d6dff] group-hover:translate-x-1 transition-transform" />
                     </Link>
                  ))}
                  <button 
                     onClick={() => router.push(`/shop?search=${encodeURIComponent(query.trim())}`)}
                     className="w-full p-4 text-center text-[#a9c7ff] font-bold uppercase tracking-widest text-xs hover:bg-[#4d6dff]/20 transition-colors"
                  >
                     View All Results
                  </button>
               </div>
            ) : query.trim().length > 0 ? (
               <div className="text-center p-8 bg-[#05071b]/80 backdrop-blur-xl border border-[#4d6dff]/30 rounded-2xl">
                  <p className="text-[#a9c7ff] font-outfit uppercase tracking-widest font-black">No stars found in this sector</p>
                  <p className="text-[#6e8cff] text-xs font-bold mt-2">Try searching for a different universe.</p>
               </div>
            ) : null}
         </div>

      </div>
    </div>
  );
}
