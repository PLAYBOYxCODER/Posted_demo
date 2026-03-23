"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { ProductModel } from "./ProductProvider";

type WishlistContextType = {
  wishlistIds: string[];
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("poster_wishlist");
    if (stored) {
      try {
        setWishlistIds(JSON.parse(stored));
      } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("poster_wishlist", JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, isLoaded]);

  const toggleWishlist = (id: string) => {
    setWishlistIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const isInWishlist = (id: string) => wishlistIds.includes(id);
  const clearWishlist = () => setWishlistIds([]);

  if (!isLoaded) {
    return (
      <WishlistContext.Provider value={{ wishlistIds: [], toggleWishlist, isInWishlist, clearWishlist }}>
        {children}
      </WishlistContext.Provider>
    );
  }

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
