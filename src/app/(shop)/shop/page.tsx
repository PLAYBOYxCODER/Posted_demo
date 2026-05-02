"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Filter, Star, SearchX, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useProducts, ProductModel } from "@/components/ProductProvider";

// Removed the hardcoded ALL_CATEGORIES array. It is now derived dynamically inside the component from existing products!

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get("cat");
  const subCategoryQuery = searchParams.get("sub");
  const searchQuery = searchParams.get("search");
  
  const { products } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<ProductModel[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Dynamically generate unique categories from products
  const dynamicCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Apply categories filter when query param changes or products list updates
  useEffect(() => {
    if (products.length === 0) return;
    
    let filtered = products;

    if (categoryQuery) {
      filtered = filtered.filter(p => p.category.toLowerCase() === categoryQuery.toLowerCase());
    }
    
    if (subCategoryQuery) {
      filtered = filtered.filter(p => p.subCategory?.toLowerCase() === subCategoryQuery.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        (p.subCategory && p.subCategory.toLowerCase().includes(q))
      );
    }

    setFilteredProducts(filtered);
  }, [categoryQuery, subCategoryQuery, searchQuery, products]);

  return (
    <>
      <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase">
              {searchQuery ? `Search: ${searchQuery}` : categoryQuery ? `${categoryQuery} Posters` : "All Posters"}
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              {searchQuery ? `Showing matching results for "${searchQuery}".` : categoryQuery 
                ? `Showing exclusive masterpieces strictly from the ${categoryQuery} collection.` 
                : "Discover our massive curated collection of absolute masterpieces."}
            </p>
          </div>
          <button 
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center gap-2 border border-white/20 px-6 py-2 rounded-full hover:bg-white/10 transition-colors uppercase tracking-widest font-bold text-sm shrink-0"
          >
            <Filter className="w-4 h-4" /> Categories & Filters
          </button>
        </div>

        {/* FULL WIDTH PRODUCT GRID */}
        <div className="w-full">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 w-full">
                {filteredProducts.map(p => (
                  <Link href={`/product/${p.id}`} key={p.id} className="group cursor-pointer">
                    <div className="relative w-full aspect-[3/4] bg-zinc-900 rounded-lg md:rounded-xl mb-3 md:mb-4 overflow-hidden border border-white/5 group-hover:border-white/20 transition-colors shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 md:group-hover:bg-transparent transition-colors z-10" />
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.15] transition-transform duration-700 ease-out" />
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 flex flex-col gap-2">
                        <div className="bg-black/70 px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-xs font-black uppercase tracking-widest text-white rounded-md backdrop-blur-md border border-white/10 shadow-md">
                          {p.category}
                        </div>
                        {p.actualPrice > p.price && (
                          <div className="bg-emerald-500 text-black px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-xs font-black uppercase tracking-widest rounded-md shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            {Math.round(((p.actualPrice - p.price) / p.actualPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>
                      {/* Quick View Button overlay on hover */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-none hidden md:block">
                        <span className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">Quick View</span>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start pt-1 px-1">
                      <div>
                        <h3 className="font-outfit font-bold text-[11px] md:text-sm lg:text-base uppercase text-gray-200 group-hover:text-white transition-colors leading-tight">{p.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-500 mt-[2px] md:mt-1">
                          <Star className="w-2 md:w-3 h-2 md:h-3 fill-current" />
                          <span className="text-[9px] md:text-xs text-gray-500 font-bold tracking-wider">(120+)</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end mt-1 md:mt-0">
                         {p.actualPrice > p.price && (
                           <span className="font-outfit text-[10px] md:text-xs text-gray-500 line-through tracking-wider">₹{p.actualPrice}</span>
                         )}
                         <span className="font-outfit font-black text-xs md:text-base text-emerald-400 tracking-wider transition-colors">₹{p.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="w-full h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-10 text-center">
                 <SearchX className="w-16 h-16 text-gray-600 mb-6" />
                 <h2 className="text-3xl font-outfit font-black uppercase tracking-wider mb-2">No Posters Found</h2>
                 <p className="text-gray-400 mb-8 max-w-md">We couldn't find any posters in the "{categoryQuery}" category. Please check back later or explore other collections.</p>
                 <Link href="/shop" className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors">
                   View All Posters
                 </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTER DRAWER SLIDE-OUT POPUP */}
      <div className={`fixed inset-0 z-[100] transform transition-transform duration-500 ease-in-out ${isFiltersOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         {/* Background blur overlay */}
         <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsFiltersOpen(false)} />
         
         {/* Menu Content */}
         <div className="absolute top-0 right-0 w-[85%] max-w-[400px] h-full bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col pt-8 px-8 pb-12 overflow-y-auto">
            <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
               <h2 className="font-outfit font-black text-2xl uppercase tracking-widest flex items-center gap-3">
                  <Filter className="w-6 h-6" /> Filters
               </h2>
               <button onClick={() => setIsFiltersOpen(false)} className="p-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                 <X className="w-6 h-6 text-white" />
               </button>
            </div>

            <div className="space-y-12">
              <div>
                 <h3 className="font-outfit font-black uppercase mb-6 tracking-[0.2em] text-sm text-gray-400">Categories</h3>
                 <ul className="space-y-4">
                   {dynamicCategories.map(c => {
                     const isActive = categoryQuery?.toLowerCase() === c.toLowerCase();
                     return (
                       <li key={c} className="flex items-center gap-3">
                         <Link 
                           href={isActive ? "/shop" : `/shop?cat=${c.toLowerCase()}`}
                           onClick={() => setIsFiltersOpen(false)} 
                           className="flex items-center gap-4 group w-full p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                         >
                           <div className={`w-5 h-5 border-white/20 border flex items-center justify-center transition-colors rounded ${isActive ? 'bg-white border-white' : 'bg-zinc-900 group-hover:border-white/50'}`}>
                              {isActive && <div className="w-3 h-3 bg-black rounded-sm" />}
                           </div>
                           <span className={`uppercase tracking-wider text-base transition-colors ${isActive ? 'text-white font-black' : 'text-gray-400 group-hover:text-gray-200'}`}>
                             {c}
                           </span>
                         </Link>
                       </li>
                     )
                   })}
                 </ul>
              </div>
              
              <div>
                 <h3 className="font-outfit font-black uppercase mb-6 tracking-[0.2em] text-sm text-gray-400">Size</h3>
                 <ul className="space-y-4">
                   {["A4 (Small)", "A3 (Medium)", "A2 (Large)"].map(c => (
                     <li key={c} className="flex items-center gap-4 w-full p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                       <input type="checkbox" className="accent-white w-5 h-5 bg-zinc-900 border-white/20 rounded" />
                       <span className="text-gray-300 uppercase tracking-wider text-base">{c}</span>
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
         </div>
      </div>
    </>
  );
}
