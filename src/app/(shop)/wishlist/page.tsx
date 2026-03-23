"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock Wishlist Items
const initialWishlist = [
  { id: 1, name: "The Godfather Vintage", price: 699, actualPrice: 999, image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400", size: "A2 (Large)" },
  { id: 2, name: "Iron Man Blueprint", price: 899, actualPrice: 1299, image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=400", size: "A3 (Medium)" },
  { id: 3, name: "Cyberpunk Cityscape", price: 999, actualPrice: 1499, image: "https://images.unsplash.com/photo-1515239991444-a0b8d5a1b3df?auto=format&fit=crop&q=80&w=400", size: "A4 (Small)" }
];

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState(initialWishlist);

  const removeItem = (id: number) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const handleAddToCart = (id: number) => {
    // In real app, push to cart state, then maybe redirect
    // "add to the cart after they have money" - user feature request
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase flex items-center gap-4">
              <Heart className="w-10 h-10 text-red-500 fill-current" /> My Wishlist
            </h1>
            <p className="text-gray-400 mt-2 uppercase tracking-widest text-sm font-semibold">Your saved favorite posters for future orders</p>
          </div>
          <p className="text-xl font-outfit font-bold uppercase mt-4 md:mt-0 bg-white/5 py-2 px-6 rounded-full border border-white/10">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
          </p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                {wishlistItems.map((item, idx) => {
                  const quotes = [
                    "A blank wall is a wasted opportunity.",
                    "This masterpiece is waiting for you.",
                    "Future you will thank you for this.",
                    "Don't let this artwork slip away."
                  ];
                  const quote = quotes[idx % quotes.length];
                  
                  return (
                  <div key={item.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex flex-row gap-4 md:gap-6 items-center hover:border-white/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                     {/* Image - Strict small size for mobile */}
                     <Link href={`/product/${item.id}`} className="w-20 md:w-28 shrink-0 aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden cursor-pointer block relative">
                        <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                     </Link>
                     
                     {/* Data - Stacked content */}
                     <div className="flex-1 flex flex-col justify-center w-full min-w-0">
                        <div className="flex justify-between items-start mb-1">
                           <Link href={`/product/${item.id}`} className="hover:text-emerald-400 transition-colors truncate pr-2">
                             <h3 className="font-outfit font-bold text-sm md:text-xl uppercase tracking-wider truncate">{item.name}</h3>
                           </Link>
                           <button 
                             onClick={() => removeItem(item.id)}
                             className="text-gray-500 hover:text-red-500 p-1 md:p-2 rounded-full transition-colors shrink-0"
                             title="Remove from Wishlist"
                           >
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                           </button>
                        </div>
                        
                        <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest mt-0.5 mb-2 truncate">
                           Size: <span className="text-white border px-1.5 py-0.5 rounded border-white/20 bg-black">{item.size}</span>
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                           <span className="font-outfit font-black text-lg md:text-2xl text-emerald-400">₹{item.price}</span>
                           <span className="text-[10px] md:text-sm text-gray-500 line-through">₹{item.actualPrice}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/5 pt-3 mt-1">
                           <p className="text-[9px] md:text-[11px] text-gray-500 italic uppercase tracking-widest">
                             &quot;{quote}&quot;
                           </p>
                           <button 
                             onClick={() => handleAddToCart(item.id)}
                             className="w-full sm:w-auto bg-white hover:bg-emerald-400 hover:text-black text-black px-4 md:px-6 py-2 md:py-3 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0"
                           >
                              Add to Cart <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                           </button>
                        </div>
                     </div>
                  </div>
                  );
                })}
             </div>

             {/* Right Sticky Summary (Motivational conversion layer) */}
             <div className="lg:col-span-1 border border-white/10 rounded-3xl p-8 bg-zinc-900/50 sticky top-24 h-fit border-t-emerald-500 border-t-2">
                <h3 className="font-outfit font-bold uppercase tracking-widest text-xl mb-4 text-emerald-400 flex items-center gap-2">
                   Why wishful thinking?
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed uppercase tracking-wider mb-8">
                   You have <strong className="text-white bg-black px-2 py-1 rounded inline-block mx-1 border border-white/10">{wishlistItems.length} masterpieces</strong> sitting completely alone here. Add your favorite prints straight to the cart directly from your wishlist wall whenever you are ready!
                </p>
                <div className="space-y-4 pt-6 border-t border-white/10">
                   <div className="flex justify-between items-center bg-black rounded-lg p-4 border border-white/5">
                      <span className="text-xs uppercase font-bold text-gray-400">Total Wishlist Value</span>
                      <span className="font-outfit font-bold text-lg">₹{wishlistItems.reduce((acc, curr) => acc + curr.price, 0)}</span>
                   </div>
                   <button 
                     onClick={() => router.push('/cart')}
                     className="w-full bg-transparent border-2 border-white/20 hover:border-white text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4"
                   >
                      Go to Cart <ArrowRight className="w-4 h-4" />
                   </button>
                   <Link href="/shop" className="block text-center pt-2 pb-2 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                     Back to Shop Browsing
                   </Link>
                </div>
             </div>
          </div>
        ) : (
          <div className="w-full h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-zinc-900/30 text-center p-8">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-gray-600" />
             </div>
             <h2 className="text-2xl md:text-3xl font-outfit font-black uppercase tracking-wider mb-2">Your Wishlist is Empty</h2>
             <p className="text-gray-400 mb-8 max-w-sm text-sm uppercase tracking-widest leading-relaxed">You haven't added any premium posters to your wishlist yet.</p>
             <Link href="/shop" className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors">
                Start Exploring Designs
             </Link>
          </div>
        )}

      </div>
    </div>
  );
}
