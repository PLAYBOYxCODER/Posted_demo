"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  finish?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("poster_cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("poster_cart", JSON.stringify(items));
      } catch (e) {
        console.warn("Storage Quota Exceeded for cart");
        try {
           // Keep only top 10 items in cart to prevent locking
           localStorage.setItem("poster_cart", JSON.stringify(items.slice(-10)));
        } catch(err2) {
           console.error("Critical Quota Failure, nuking cart to unbrick user session.", err2);
           localStorage.setItem("poster_cart", "[]");
        }
      }
    }
  }, [items, isLoaded]);

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      // Find matching product with same size/finish
      const existing = prev.find(i => i.id === item.id && i.size === item.size && i.finish === item.finish);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  
  const updateQuantity = (id: string, qty: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  };
  
  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const [notification, setNotification] = useState<{item: CartItem, message: string} | null>(null);

  const cutePhrases = [
    "Ooh, you have excellent taste! 🎨",
    "Boom! Safely tucked in your bag. 🛍️",
    "That's going to look amazing on your wall! ✨",
    "We love that one! Added to cart. ❤️",
    "Masterpiece secured. 🚀"
  ];

  const triggerAddToCart = (item: CartItem) => {
     addToCart(item);
     const randomPhrase = cutePhrases[Math.floor(Math.random() * cutePhrases.length)];
     setNotification({ item, message: randomPhrase });
     setTimeout(() => setNotification(null), 3000); // Quick elegant toast duration
  };

  // Expose an empty cart silently during SSR to avoid hydration mismatch
  if (!isLoaded) {
    return (
      <CartContext.Provider value={{ items: [], addToCart: triggerAddToCart, removeFromCart, updateQuantity, clearCart, total: 0 }}>
        {children}
      </CartContext.Provider>
    );
  }

  return (
    <CartContext.Provider value={{ items, addToCart: triggerAddToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
      
      {/* Global Add to Cart Animation Overlay */}
      {notification && (
         <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right fade-in slide-out-to-top duration-500">
            <div className="bg-black/90 backdrop-blur-md border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-2xl p-4 flex flex-col gap-3 w-80 overflow-hidden">
               <div className="flex gap-4 items-center">
                  <div className="w-12 h-16 rounded border border-white/20 shrink-0 bg-zinc-900 overflow-hidden shadow-inner">
                     <img src={notification.item.image} className="w-full h-full object-cover" alt="item" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                       {notification.message}
                     </p>
                     <h4 className="text-white font-bold text-[10px] uppercase truncate leading-tight">{notification.item.name}</h4>
                     <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">₹{notification.item.price}</p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
