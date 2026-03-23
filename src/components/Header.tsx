"use client";
import React, { useState } from "react";
import { ShoppingCart, User, Search, X, ChevronRight, Package, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StaggeredMenu from "@/components/StaggeredMenu";
import { useOffers } from "@/components/OffersProvider";
import { useCart } from "@/components/CartProvider";
import { useProducts } from "@/components/ProductProvider";
import { useAuth } from "@/components/AuthProvider";

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const { marqueeText, activeCategories } = useOffers();
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const { products } = useProducts();
  
  // Dynamically map ONLY Admin-activated categories to the Global Header Nav
  const categoryMap = new Map<string, Set<string>>();
  activeCategories.forEach(cat => {
    if (cat === "Shop All") return; // Handled as explicit menu item often
    categoryMap.set(cat, new Set());
    products.forEach(p => {
       if (p.category === cat && p.subCategory) {
          categoryMap.get(cat)!.add(p.subCategory);
       }
    });
  });

  const dynamicCategories = Array.from(categoryMap.entries()).map(([cat, subs]) => ({
    label: cat,
    ariaLabel: `${cat} Posters`,
    link: `/shop?cat=${encodeURIComponent(cat.toLowerCase())}`,
    subcategories: Array.from(subs).map(sub => ({
      label: sub,
      ariaLabel: `${sub} Posters`,
      link: `/shop?cat=${encodeURIComponent(cat.toLowerCase())}&sub=${encodeURIComponent(sub.toLowerCase())}`
    }))
  }));

  const staggeredMenuItems: any[] = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'Shop All', ariaLabel: 'Go to shop', link: '/shop' },
    { label: 'Make Your Own', ariaLabel: 'Make your own poster', link: '/design' },
    ...dynamicCategories
  ];

  const socialItems: any[] = [
    { label: 'Instagram', link: 'https://instagram.com' },
    { label: 'YouTube', link: 'https://youtube.com' },
    { label: 'Twitter', link: 'https://twitter.com' }
  ];

  return (
    <>

      <header className="fixed top-0 w-full z-50 bg-black border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* MOBILE VIEW (< md) */}
          <div className="flex md:hidden flex-row items-center justify-between px-4 h-20 relative w-full border-b border-white/5 bg-black/50 backdrop-blur-lg">
            
            <div className="flex items-center z-20">
               {/* @ts-ignore */}
               <StaggeredMenu
                  position="left"
                  items={staggeredMenuItems as any}
                  socialItems={socialItems as any}
                  displaySocials
                  displayItemNumbering={false}
                  menuButtonColor="#ffffff"
                  openMenuButtonColor="#ffffff"
                  changeMenuColorOnOpen={true}
                  colors={['#18181b', '#27272a']} 
                  accentColor="#10b981"
                />
            </div>

            {/* Center: Absolute Logo ONLY. Rest handled by MobileDock */}
            <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[72px] w-[140px] flex items-center justify-center z-10 rounded-lg">
              <div className="absolute inset-0 bg-transparent z-10" />
              <video 
                src="/logo.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover scale-[1.35] pointer-events-none"
              />
            </Link>
            
            <div className="flex items-center justify-end z-20 gap-4">
               <button onClick={() => router.push('/search')} className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:text-emerald-400 hover:bg-white/10 transition-colors shadow-lg">
                  <Search className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* DESKTOP / TV VIEW (md and higher) */}
          <div className="hidden md:flex flex-col">
            <div className="flex items-center justify-between px-6 h-32">
              {/* Left side: Hamburger & Animated Logo */}
              <div className="flex items-center gap-6">
                {/* @ts-ignore */}
                <StaggeredMenu
                  position="left"
                  items={staggeredMenuItems as any}
                  socialItems={socialItems as any}
                  displaySocials
                  displayItemNumbering={true}
                  menuButtonColor="#ffffff"
                  openMenuButtonColor="#ffffff"
                  changeMenuColorOnOpen={true}
                  colors={['#18181b', '#27272a']} 
                  accentColor="#10b981"
                />
                <Link href="/" className="h-28 w-64 overflow-hidden flex items-center justify-center rounded-2xl shadow-xl border border-white/5 hover:border-white/20 transition-all group">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                  <video 
                    src="/logo.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover scale-[1.3] translate-y-4 pointer-events-none"
                  />
                </Link>
              </div>

              {/* Right side: Quick Links & Icons */}
              <div className="flex items-center gap-8">
                {/* 3 Main Header Options */}
                <nav className="flex items-center gap-6 relative">
                  <Link href="/shop" className="text-gray-300 hover:text-white transition-colors uppercase font-outfit font-bold tracking-widest text-sm">Shop All</Link>
                  
                  {/* Categories Dropdown */}
                  <div className="group relative">
                    <button className="text-gray-300 group-hover:text-white transition-colors uppercase font-outfit font-bold tracking-widest text-sm py-2">
                       Categories
                    </button>
                    {/* The Dropdown Menu */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-4 z-50">
                        <div className="absolute -top-2 left-0 w-full h-4 bg-transparent" /> {/* hover bridge */}
                        {Array.from(categoryMap.entries()).map(([cat, subs]) => (
                          <div key={cat} className="group/sub relative">
                            <Link 
                              href={`/shop?cat=${cat.toLowerCase()}`} 
                              className="px-6 py-2 text-[11px] font-outfit font-black uppercase tracking-widest text-gray-400 hover:text-emerald-400 hover:bg-white/5 transition-colors flex items-center justify-between"
                            >
                              {cat}
                              {subs.size > 0 && <span className="ml-2">▸</span>}
                            </Link>
                            
                            {/* Hover Sub-menu for Desktop */}
                            {subs.size > 0 && (
                               <div className="absolute top-0 left-full ml-0 w-48 bg-zinc-950 border border-emerald-500/20 rounded-lg shadow-2xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 flex flex-col py-2 z-50">
                                  <div className="absolute top-0 -left-2 w-2 h-full bg-transparent" />
                                  {Array.from(subs).map(sub => (
                                     <Link 
                                       key={sub} 
                                       href={`/shop?cat=${encodeURIComponent(cat.toLowerCase())}&sub=${encodeURIComponent(sub.toLowerCase())}`} 
                                       className="px-6 py-2 text-[10px] font-outfit font-black uppercase tracking-widest text-gray-500 hover:text-emerald-400 hover:bg-white/5 transition-colors"
                                     >
                                       {sub}
                                     </Link>
                                  ))}
                               </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <Link href="/design" className="text-gray-300 hover:text-white transition-colors uppercase font-outfit font-bold tracking-widest text-sm border border-white/20 px-4 py-2 rounded-full hover:bg-white/10">Make Your Own</Link>
                </nav>
                
                <div className="flex items-center gap-6 border-l border-white/20 pl-6">
                  <Search onClick={() => router.push('/search')} className="w-5 h-5 text-white cursor-pointer hover:text-emerald-400 transition-colors hover:scale-110" />
                  
                  {user ? (
                    <div className="relative group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden group-hover:border-emerald-400 transition-colors shadow-lg relative z-10 cursor-pointer">
                        {profile?.avatar_url ? (
                           <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover scale-110" />
                        ) : (
                           <span className="text-white font-black font-outfit uppercase tracking-widest text-sm">
                             {profile?.full_name ? profile.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2) : "ME"}
                           </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                      
                      {/* Desktop Dropdown Pop Up */}
                      <div className="absolute top-full right-0 mt-6 w-64 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col p-2 z-50 transform origin-top group-hover:translate-y-0 translate-y-2">
                          <div className="absolute -top-6 right-0 w-full h-8 bg-transparent" /> {/* hover bridge */}
                          <div className="px-5 py-5 border-b border-white/10 mb-2">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <p className="text-white font-outfit font-black uppercase text-lg truncate">{profile?.full_name || "User Account"}</p>
                            </div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-5 truncate">{user.email}</p>
                          </div>
                          
                          <Link href="/profile" className="px-5 py-3 text-xs font-outfit font-black uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-xl flex items-center gap-3"><User className="w-4 h-4 text-emerald-500"/> Account Setup</Link>
                          <Link href="/profile" className="px-5 py-3 text-xs font-outfit font-black uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-xl flex items-center gap-3"><Package className="w-4 h-4 text-emerald-500"/> Order History</Link>
                          <Link href="/wishlist" className="px-5 py-3 text-xs font-outfit font-black uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-xl flex items-center gap-3"><Heart className="w-4 h-4 text-emerald-500"/> Saved Posters</Link>
                          
                          <div className="border-t border-white/10 mt-2 pt-2">
                            <button onClick={signOut} className="w-full text-left px-5 py-4 text-xs font-outfit font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors rounded-xl flex items-center gap-3">
                              Sign Out Session
                            </button>
                          </div>
                      </div>
                    </div>
                  ) : (
                    <Link href="/login" className="text-white hover:text-emerald-400 transition-colors uppercase font-outfit font-black tracking-widest text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10">
                      Login
                    </Link>
                  )}

                  <Link href="/cart" className="relative group">
                    <div className="bg-white/10 p-2 rounded-full border border-white/20 group-hover:bg-white/20 transition-all">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center font-inter shadow-lg">{cartCount}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrolling Notice Bar - Always present below header nav */}
        <div className="w-full bg-[#f8f8f8] text-black py-[8px] overflow-hidden flex whitespace-nowrap">
          <p className="animate-marquee inline-block text-[10px] md:text-xs font-black tracking-widest uppercase px-4 flex items-center gap-8">
            <span>{marqueeText || "WELCOME TO THE POSTER STORE ⚡"}</span><span>|</span>
            <span>{marqueeText || "WELCOME TO THE POSTER STORE ⚡"}</span><span>|</span>
            <span>{marqueeText || "WELCOME TO THE POSTER STORE ⚡"}</span>
            <span>{marqueeText || "WELCOME TO THE POSTER STORE ⚡"}</span><span>|</span>
            <span>{marqueeText || "WELCOME TO THE POSTER STORE ⚡"}</span><span>|</span>
            <span>{marqueeText || "WELCOME TO THE POSTER STORE ⚡"}</span>
          </p>
        </div>
      </header>
      
      {/* Spacer to prevent content overlap */}
      <div className="h-[148px] md:h-[160px]" />

      {/* MOBILE FULL-SCREEN SLIDING MENU (Removed, now handled by StaggeredMenu) */}
    </>
  );
}
