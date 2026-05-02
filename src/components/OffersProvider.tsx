"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type OffersContextType = {
  marqueeText: string;
  setMarqueeText: (txt: string) => void;
  eventBanners: string[];
  setEventBanners: (imgs: string[]) => void;
  isEventActive: boolean;
  setIsEventActive: (active: boolean) => void;
  galleryItems: { image: string, text: string }[];
  setGalleryItems: (items: { image: string, text: string }[]) => void;
  activeCategories: string[];
  setActiveCategories: (cats: string[]) => void;
  activeCarousels: string[];
  setActiveCarousels: (cats: string[]) => void;
  categorySubtitles: Record<string, string>;
  setCategorySubtitles: (subs: Record<string, string>) => void;
  mobileCategoryImages: Record<string, string>;
  setMobileCategoryImages: (imgs: Record<string, string>) => void;
  isRazorpayEnabled: boolean;
  setIsRazorpayEnabled: (enabled: boolean) => void;
  isAiRecommendationsEnabled: boolean;
  setIsAiRecommendationsEnabled: (enabled: boolean) => void;
  deliveryRates: Record<string, number>;
  setDeliveryRates: (rates: Record<string, number>) => void;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;
  featuredBentoIds: string[];
  setFeaturedBentoIds: (ids: string[]) => void;
  designThumbnails: Record<string, string>;
  setDesignThumbnails: (thumbs: Record<string, string>) => void;
  // BOGO ENGINE CONFIG
  bogoCampaigns: any[];
  setBogoCampaigns: (campaigns: any[]) => void;
  upcomingDrops: { image: string; title: string; subtitle: string }[];
  setUpcomingDrops: (drops: { image: string; title: string; subtitle: string }[]) => void;
};

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export function OffersProvider({ children }: { children: React.ReactNode }) {
  const [marqueeText, setMarqueeText] = useState("⚡ GET 20% OFF ON YOUR FIRST RETRO PRINT | FREE SHIPPING ON ORDERS OVER ₹499 IN INDIA | NEW MARVEL COLLECTION OUT NOW ⚡");
  const [eventBanners, setEventBanners] = useState<string[]>([]);
  const [isEventActive, setIsEventActive] = useState(false);
  const [galleryItems, setGalleryItems] = useState<{image: string, text: string}[]>([
     { image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=600", text: "MARVEL" },
     { image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600", text: "VINTAGE" },
     { image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=600", text: "TOLLYWOOD" },
     { image: "https://images.unsplash.com/photo-1510006851064-e6056cd0e3a8?auto=format&fit=crop&q=80&w=600", text: "BOLLYWOOD" },
     { image: "https://images.unsplash.com/photo-1503376760366-5a4ddaba6132?auto=format&fit=crop&q=80&w=600", text: "RETRO CARS" }
  ]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeCarousels, setActiveCarousels] = useState<string[]>([]);
  const [categorySubtitles, setCategorySubtitles] = useState<Record<string, string>>({});
  const [mobileCategoryImages, setMobileCategoryImages] = useState<Record<string, string>>({});
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(true);
  const [isAiRecommendationsEnabled, setIsAiRecommendationsEnabled] = useState(false);
  const initialStates: Record<string, number> = {};
  const [deliveryRates, setDeliveryRates] = useState<Record<string, number>>(initialStates);
  const [whatsappNumber, setWhatsappNumber] = useState("+919876543210");
  const [featuredBentoIds, setFeaturedBentoIds] = useState<string[]>([]);
  
  // BOGO STATE
  const [bogoCampaigns, setBogoCampaigns] = useState<any[]>([]);
  const [designThumbnails, setDesignThumbnails] = useState<Record<string, string>>({});
  const [upcomingDrops, setUpcomingDrops] = useState<{ image: string; title: string; subtitle: string }[]>([
     { image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800", title: "Cyberpunk 2077 Edition", subtitle: "Coming Next Month" },
     { image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=800", title: "Vintage Cars Series", subtitle: "Dropping Soon" },
     { image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800", title: "Abstract Dimensions", subtitle: "Next Season Release" }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchGlobalConfigs = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
           const v = await res.json();
           if (Object.keys(v).length > 0) {
              if (v.marqueeText) setMarqueeText(v.marqueeText);
              if (v.isEventActive !== undefined) setIsEventActive(v.isEventActive);
              if (v.eventBanners) setEventBanners(v.eventBanners);
              if (v.deliveryRates) setDeliveryRates(v.deliveryRates);
              if (v.galleryItems && v.galleryItems.length > 0) setGalleryItems(v.galleryItems);
              if (v.activeCategories) setActiveCategories(v.activeCategories);
              if (v.activeCarousels) setActiveCarousels(v.activeCarousels);
              if (v.categorySubtitles) setCategorySubtitles(v.categorySubtitles);
              if (v.mobileCategoryImages) setMobileCategoryImages(v.mobileCategoryImages);
              if (v.isRazorpayEnabled !== undefined) setIsRazorpayEnabled(v.isRazorpayEnabled);
              if (v.isAiRecommendationsEnabled !== undefined) setIsAiRecommendationsEnabled(v.isAiRecommendationsEnabled);
              if (v.whatsappNumber) setWhatsappNumber(v.whatsappNumber);
              if (v.featuredBentoIds) setFeaturedBentoIds(v.featuredBentoIds);
              if (v.designThumbnails) setDesignThumbnails(v.designThumbnails);
              if (v.bogoCampaigns) setBogoCampaigns(v.bogoCampaigns);
              if (v.upcomingDrops && v.upcomingDrops.length > 0) setUpcomingDrops(v.upcomingDrops);
           }
        }
      } catch (e) {
          // Silently absorb fetch crashes during Next.js Hot-Reloads 
      } finally {
          setIsLoaded(true);
      }
    };

    fetchGlobalConfigs();

    // Removed aggressive polling that caused infinite loading and fetch crash loops
  }, []);

  if (!isLoaded) {
    return (
      <OffersContext.Provider value={{
        marqueeText, 
        setMarqueeText: () => {}, 
        eventBanners, 
        setEventBanners: () => {}, 
        isEventActive, 
        setIsEventActive: () => {},
        galleryItems,
        setGalleryItems: () => {},
        activeCategories,
        setActiveCategories: () => {},
        activeCarousels,
        setActiveCarousels: () => {},
        categorySubtitles,
        setCategorySubtitles: () => {},
        mobileCategoryImages,
        setMobileCategoryImages: () => {},
        isRazorpayEnabled,
        setIsRazorpayEnabled: () => {},
        isAiRecommendationsEnabled,
        setIsAiRecommendationsEnabled: () => {},
        deliveryRates,
        setDeliveryRates: () => {},
        whatsappNumber,
        setWhatsappNumber: () => {},
        featuredBentoIds,
        setFeaturedBentoIds: () => {},
        designThumbnails: {},
        setDesignThumbnails: () => {},
        bogoCampaigns: [],
        setBogoCampaigns: () => {},
        upcomingDrops: [],
        setUpcomingDrops: () => {}
      }}>
        {children}
      </OffersContext.Provider>
    );
  }

  return (
    <OffersContext.Provider value={{
      marqueeText, 
      setMarqueeText, 
      eventBanners, 
      setEventBanners, 
      isEventActive, 
      setIsEventActive,
      galleryItems,
      setGalleryItems,
      activeCategories,
      setActiveCategories,
      activeCarousels,
      setActiveCarousels,
      categorySubtitles,
      setCategorySubtitles,
      mobileCategoryImages,
      setMobileCategoryImages,
      isRazorpayEnabled,
      setIsRazorpayEnabled,
      isAiRecommendationsEnabled, 
      setIsAiRecommendationsEnabled,
      deliveryRates,
      setDeliveryRates,
      whatsappNumber,
      setWhatsappNumber,
      featuredBentoIds,
      setFeaturedBentoIds,
      designThumbnails,
      setDesignThumbnails,
      bogoCampaigns, 
      setBogoCampaigns,
      upcomingDrops,
      setUpcomingDrops
    }}>
      {children}
    </OffersContext.Provider>
  );
}

export function useOffers() {
  const context = useContext(OffersContext);
  if (!context) throw new Error("useOffers must be used within OffersProvider");
  return context;
}
