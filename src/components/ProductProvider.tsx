"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";

export type ProductModel = {
  id: string;
  name: string;
  price: number;
  actual_price?: number;
  actualPrice?: number; // legacy prop
  category: string;
  subCategory?: string;
  images: string[];
  rating?: number;
  description?: string;
  created_at?: string;
  meesho_link?: string;
};

type ProductContextType = {
  products: ProductModel[];
  addProduct: (product: Omit<ProductModel, "id" | "rating">) => void;
  updateProduct: (id: string, updates: Partial<ProductModel>) => void;
  deleteProduct: (id: string) => void;
  deleteCategoryGlobal: (categoryName: string) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const ALL_CATEGORIES = ["Marvel", "DC", "Cars", "Music", "TFI", "Anime", "Gaming", "Bollywood", "Tollywood", "Retro"];

// Generate initial mock state with MULTIPLE IMAGES
const initialProducts: ProductModel[] = Array.from({ length: 12 }).map((_, i) => {
  const sellingPrice = 499 + ((i % 5) * 100);
  const actualPrice = sellingPrice + 300 + ((i % 3) * 150);
  
  // Create 4 images per mock product
  const baseImgStr = `https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=400&sig=`;
  
  return {
    id: `PROD-${i + 1}`,
    name: `Premium Poster Volume ${i + 1}`,
    price: sellingPrice,
    actualPrice: actualPrice,
    category: ALL_CATEGORIES[i % ALL_CATEGORIES.length],
    images: [
      `${baseImgStr}${i}1`,
      `${baseImgStr}${i}2`,
      `${baseImgStr}${i}3`,
      `${baseImgStr}${i}4`
    ],
    rating: 4.8,
    description: "High-quality premium photo-realistic poster. Printed on 300 GSM thick premium art card with matte finish."
  };
});

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      // Map columns (Supabase uses discount_price instead of actualPrice in schema, let's map loosely)
      const mapped = data.map(item => ({
        ...item,
        actualPrice: item.discount_price || item.price,
      }));
      setProducts(mapped as ProductModel[]);
    } catch (e) {
      console.error("Failed to fetch products:", e);
      setProducts([]); // fallback empty
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<ProductModel, "id" | "rating">) => {
    try {
      const supabasePayload = {
        name: product.name,
        price: product.price,
        discount_price: product.actualPrice || product.price,
        category: product.category,
        sub_category: product.subCategory || null,
        images: product.images,
        description: product.description || "",
        meesho_link: product.meesho_link || null,
      };
      
      const { data, error } = await supabase.from('products').insert([supabasePayload]).select().single();
      if (error) throw error;
      
      setProducts(prev => [{...data, actualPrice: data.discount_price}, ...prev]);
    } catch(e: any) {
      console.error("Database Insert Error:", e);
      alert("Failed to create product in Database! Ensure your 'products' table exists in Supabase with columns: id, name, price, discount_price, category, sub_category, images, description. Error details: " + e.message);
    }
  };

  const updateProduct = async (id: string, updates: Partial<ProductModel>) => {
    try {
      const supabasePayload: any = { ...updates };
      if (updates.actualPrice) supabasePayload.discount_price = updates.actualPrice;
      if (updates.meesho_link !== undefined) supabasePayload.meesho_link = updates.meesho_link;
      
      const { error } = await supabase.from('products').update(supabasePayload).eq('id', id);
      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch(e) {
      console.error(e);
    }
  };

  const deleteCategoryGlobal = async (categoryName: string) => {
    try {
      const { error } = await supabase.from('products').update({ category: 'uncategorized' }).eq('category', categoryName);
      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.category === categoryName ? { ...p, category: "Uncategorized", subCategory: "" } : p));
    } catch(e) {
      console.error(e)
    }
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, deleteCategoryGlobal }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
