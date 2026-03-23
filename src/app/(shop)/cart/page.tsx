"use client";
import React from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, total } = useCart();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase mb-10 flex items-center gap-4">
          <ShoppingBag className="w-10 h-10" /> Your Cart
        </h1>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {items.length === 0 ? (
               <div className="bg-zinc-900 border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                 <ShoppingBag className="w-12 h-12 text-gray-500 mb-4" />
                 <h2 className="font-outfit font-bold uppercase tracking-widest text-xl mb-2">Cart is empty</h2>
                 <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest">You haven't added any masterpieces yet.</p>
                 <button onClick={() => router.push('/shop')} className="px-6 py-3 border border-emerald-500/50 text-emerald-400 font-bold uppercase tracking-widest text-xs rounded-full hover:bg-emerald-500/10">Browse Posters</button>
               </div>
            ) : (
                items.map((item, idx) => (
                  <div key={item.id + idx} className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex flex-row gap-4 items-start md:items-center hover:border-white/20 transition-colors relative">
                    <div className="w-24 md:w-32 aspect-[3/4] bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0 pr-8 md:pr-0">
                      <h3 className="font-outfit font-bold text-sm md:text-xl uppercase tracking-wider mb-1 line-clamp-2 md:truncate pr-2">{item.name}</h3>
                      <p className="text-gray-400 text-[10px] md:text-sm uppercase tracking-widest mb-3 truncate">Size: {item.size}</p>
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 w-full">
                          <span className="font-outfit font-bold text-lg md:text-xl text-emerald-400">₹{item.price}</span>
                          <div className="flex items-center border border-white/20 rounded-lg overflow-hidden shrink-0">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 md:px-4 py-1 hover:bg-white/10 transition-colors text-sm">-</button>
                            <span className="px-3 md:px-4 py-1 font-bold text-xs md:text-sm border-x border-white/10">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 md:px-4 py-1 hover:bg-white/10 transition-colors text-sm">+</button>
                          </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 md:relative md:top-auto md:right-auto text-gray-500 hover:text-red-500 transition-colors p-2 shrink-0 self-start">
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ))
            )}
          </div>

          {/* Checkout Summary */}
          <div className="w-full md:w-80 shrink-0">
             <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sticky top-36">
                <h3 className="font-outfit font-bold uppercase tracking-widest text-lg mb-6 border-b border-white/10 pb-4">Order Summary</h3>
                <div className="space-y-4 mb-6 text-sm text-gray-400 uppercase tracking-widest">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-bold">{total > 0 ? "FREE" : "₹0"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-6 mb-8">
                  <span className="font-outfit font-black uppercase tracking-widest text-lg">Total</span>
                  <span className="font-outfit font-black text-2xl">₹{total}</span>
                </div>
                <button 
                  onClick={() => router.push('/checkout')}
                  disabled={items.length === 0}
                  className={`w-full py-4 rounded-full font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${items.length === 0 ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
                >
                  Secure Checkout <ArrowRight className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
