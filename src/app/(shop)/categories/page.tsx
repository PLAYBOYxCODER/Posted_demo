"use client";
import React from "react";
import { useOffers } from "@/components/OffersProvider";
import { useProducts } from "@/components/ProductProvider";
import Link from "next/link";
import { ArrowRight, Grid, Image as ImageIcon } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function MobileCategoriesPage() {
  const { activeCategories } = useOffers();
  const { products } = useProducts();

  // Create a beautiful mapping with thumbnail covers
  const categoryHighlights = activeCategories.filter(c => c !== "Shop All").map(cat => {
    const matchedProduct = products.find(p => p.category === cat);
    return {
       name: cat,
       cover: matchedProduct?.images[0] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=600",
       count: products.filter(p => p.category === cat).length
    };
  });

  return (
    <div className="min-h-screen bg-black pt-8 pb-32 px-4 md:px-8 max-w-7xl mx-auto selection:bg-emerald-500/30">
      
      <div className="mb-10 text-center md:text-left mt-8 md:mt-16">
         <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase text-white tracking-widest flex items-center justify-center md:justify-start gap-4">
            <Grid className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
            Categories
         </h1>
         <p className="text-gray-400 mt-4 max-w-2xl font-medium tracking-wide">
            Explore our curated collections of premium wall art. Find exactly the aesthetic you want to build your perfect room.
         </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <ScrollReveal delay={50}>
           <Link href="/shop" className="group relative block aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all shadow-xl">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
             <div className="absolute inset-0 bg-black/60 z-0 group-hover:bg-black/20 transition-all duration-700" />
             <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
             
             <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-outfit font-black uppercase text-white tracking-widest">Shop All</h2>
                  <p className="text-emerald-400 font-bold uppercase text-xs tracking-widest mt-1 group-hover:text-emerald-300 transition-colors">Complete Collection</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:text-black transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
             </div>
           </Link>
         </ScrollReveal>

         {categoryHighlights.map((cat, i) => (
           <ScrollReveal key={cat.name} delay={(i+2) * 50}>
             <Link href={`/shop?cat=${encodeURIComponent(cat.name.toLowerCase())}`} className="group relative block aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all shadow-xl">
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
               <div className="absolute inset-0 bg-black/60 z-0 group-hover:bg-black/20 transition-all duration-700" />
               <img src={cat.cover} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
               
               <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-outfit font-black uppercase text-white tracking-widest">{cat.name}</h2>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-1 flex items-center gap-1.5 group-hover:text-white transition-colors">
                      <ImageIcon className="w-3.5 h-3.5" /> {cat.count} Items
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:text-black transition-all transform group-hover:translate-x-1">
                    <ArrowRight className="w-5 h-5" />
                  </div>
               </div>
             </Link>
           </ScrollReveal>
         ))}
      </div>
    </div>
  );
}
