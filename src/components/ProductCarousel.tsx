"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { ProductModel } from "@/components/ProductProvider";
import { useCart } from "@/components/CartProvider";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: ProductModel[];
  viewAllLink?: string;
}

export default function ProductCarousel({ title, subtitle, products, viewAllLink }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setTotalItems(products.length);
  }, [products]);

  const updateIndex = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const itemWidth = scrollRef.current.children[0]?.clientWidth || 0;
      if (itemWidth > 0) {
        const index = Math.round(scrollLeft / itemWidth) + 1;
        setCurrentIndex(Math.min(index, products.length));
      }
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full relative z-20 py-8 md:py-12 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-outfit font-black uppercase text-white tracking-widest">{title}</h2>
          {subtitle && <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs md:text-sm mt-2">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={scrollLeft} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition-colors text-white active:scale-95">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={scrollRight} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition-colors text-white active:scale-95">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {viewAllLink && (
             <Link href={viewAllLink} className="hidden md:flex ml-4 px-6 py-3 border border-white/20 hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest transition-colors">
               View All
             </Link>
          )}
        </div>
      </div>

      <div 
        ref={scrollRef} 
        onScroll={updateIndex}
        className="w-full overflow-x-auto flex gap-4 md:gap-6 px-4 md:px-8 xl:px-12 pb-8 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
           <div key={product.id} className="snap-start shrink-0 w-[180px] md:w-[240px] flex flex-col group relative">
             <Link href={`/product/${product.id}`} className="block w-full aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl relative group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-500">
                <img 
                  src={product.images && product.images.length > 0 ? product.images[0] : ""} 
                  alt={product.name} 
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${product.images && product.images.length > 1 ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'}`} 
                />
                {product.images && product.images.length > 1 && (
                  <img 
                    src={product.images[1]} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
             </Link>
             
             <div className="mt-4 md:mt-5 flex justify-between items-start gap-3 md:gap-4">
               <div className="flex-1 min-w-0">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-outfit font-black text-sm md:text-lg text-white uppercase leading-tight truncate px-1 group-hover:text-emerald-400 transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 px-1 truncate">{product.category}</p>
               </div>
               <div className="text-right shrink-0 pr-1">
                  <p className="font-outfit font-black text-emerald-400 text-sm md:text-lg shrink-0">₹{product.price}</p>
               </div>
             </div>
             
             <div className="absolute top-4 right-4 md:top-6 md:right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-10">
               {product.meesho_link ? (
                 <a 
                   href={product.meesho_link} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="bg-emerald-500 text-black p-3 md:p-4 rounded-full shadow-2xl hover:bg-emerald-400 transition-colors flex items-center justify-center"
                   title="Buy on Meesho"
                 >
                   <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                 </a>
               ) : (
                 <button 
                   onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                         id: product.id,
                         name: product.name,
                         price: product.price,
                         image: product.images && product.images.length > 0 ? product.images[0] : "",
                         size: "12x18 inches",
                         quantity: 1
                      });
                   }}
                   className="bg-white text-black p-3 md:p-4 rounded-full shadow-2xl hover:bg-emerald-400 transition-colors"
                   title="Quick Add to Cart"
                 >
                   <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                 </button>
               )}
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
