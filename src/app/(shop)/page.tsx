"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ShieldCheck, Truck, Sparkles, ThumbsUp, CreditCard, ArrowUpRight, X, Heart } from "lucide-react";
import FlowingMenu from "@/components/FlowingMenu";
import LogoLoop from "@/components/LogoLoop";
import BorderGlow from "@/components/BorderGlow";
import CircularGallery from "@/components/CircularGallery";
import { useVerifiedPhotos } from "@/components/VerifiedPhotoProvider";
import { useOffers } from "@/components/OffersProvider";
import { useProducts } from "@/components/ProductProvider";
import { useCart } from "@/components/CartProvider";
import { useOrders } from "@/components/OrderProvider";
import MagicBento from "@/components/MagicBento";

export default function HomePage() {
  const { photos: globalPhotos } = useVerifiedPhotos();
  const { 
    marqueeText, isEventActive, eventBanners, galleryItems, activeCategories, featuredBentoIds
  } = useOffers();
  const { products } = useProducts();
  const { orders } = useOrders();
  
  // Dynamic Algorithm: Trending by Pure Aggregate Sales Volume over All Time
  const getTrendingProducts = () => {
    if (products.length === 0) return [];
    const salesRecord: Record<string, number> = {};
    
    // Tally up every single item ever legally ordered 
    orders.forEach(order => {
      order.items.forEach(item => {
        salesRecord[item.id] = (salesRecord[item.id] || 0) + item.quantity;
      });
    });

    // Score and rank products strictly based on numerical sales
    return [...products]
      .sort((a, b) => (salesRecord[b.id] || 0) - (salesRecord[a.id] || 0))
      .slice(0, 4);
  };

  const trendingProducts = getTrendingProducts();

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if(!isEventActive || eventBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % eventBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [eventBanners.length, isEventActive]);

  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  useEffect(() => {
     if(!sessionStorage.getItem("hasViewedWelcome")) {
        const t = setTimeout(() => {
           setShowWelcomePopup(true);
           sessionStorage.setItem("hasViewedWelcome", "true");
        }, 1500);
        return () => clearTimeout(t);
     }
  }, []);

  // Dynamically derive recommended from real products database
  const realProducts = [...products];

  const recommendedProducts = realProducts.length >= 8 
    ? realProducts.slice(4, 8) 
    : realProducts.slice(0, 4);

  // Fallback map to generate images for categories if they aren't explicitly saved
  const catImageMap: Record<string, string> = {
    'Marvel': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=600',
    'DC': 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=600',
    'Anime': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
    'Gaming': 'https://images.unsplash.com/photo-1515239991444-a0b8d5a1b3df?auto=format&fit=crop&q=80&w=600',
    'Cars': 'https://images.unsplash.com/photo-1503376760366-5a4ddaba6132?auto=format&fit=crop&q=80&w=600',
    'Music': 'https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=600',
    'Retro': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
    'Bollywood': 'https://images.unsplash.com/photo-1510006851064-e6056cd0e3a8?auto=format&fit=crop&q=80&w=600',
    'Shop All': 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=600'
  };

  // Derive categories strictly mapped to whatever Admin actively toggled
  const displayCategories = activeCategories.length > 0 ? activeCategories : Array.from(new Set(products.map(p => p.category))).filter(c => c && c !== "Uncategorized");

  const menuItems = displayCategories.map(cat => {
    // Find the very first actual product graphic mapping securely to this category
    const matchingProduct = products.find(p => p.category.toLowerCase() === cat.toLowerCase());
    
    return {
      link: cat === 'Shop All' ? '/shop' : `/shop?cat=${encodeURIComponent(cat.toLowerCase())}`,
      text: cat,
      // Priority 1: Use actual matching catalogue poster image. Priority 2: Unsplash placeholder fallback
      image: (matchingProduct && matchingProduct.images?.[0]) || catImageMap[cat] || 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600'
    };
  });

  // Cleaned up unused shopByCategoryItems as user wants FlowingMenu bound directly to activeCategories (Admin controlled)

  // Dynamically split admin-verified photos into two marquee rows, filling fallback if empty
  const midpoint = Math.ceil(globalPhotos.length / 2) || 1;
  const reviewImagesRow1 = globalPhotos.length > 0 ? globalPhotos.slice(0, midpoint) : [
    {
       img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800', 
       alt: 'Living Room Frame',
       text: 'Absolutely stunning quality. The frame is premium and the print is extremely vivid.',
       name: 'Rahul S.'
    }
  ];
  
  const reviewImagesRow2 = globalPhotos.length > 1 ? globalPhotos.slice(midpoint) : [
    {
       img: 'https://images.unsplash.com/photo-1598928506311-c55dd1b31122?auto=format&fit=crop&q=80&w=800', 
       alt: 'Workspace',
       text: 'The best decor I have bought. Adds so much flavor to my work desk area.',
       name: 'Arjun P.'
    }
  ];

  const mappedBentoCards = (featuredBentoIds || []).map(id => {
      const p = products.find(prod => prod.id === id);
      if (!p) return null;
      return {
         id: p.id,
         color: '#060010',
         title: p.name,
         description: p.description,
         label: p.category,
         image: p.images[0],
         price: p.price
      };
  }).filter(Boolean);

  return (
    <div className="bg-black text-white selection:bg-white selection:text-black">
      
      {/* Global Welcome Promotional Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-zinc-950 border border-emerald-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.2)] relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
              <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />
              <button 
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
              >
                 <X className="w-5 h-5" />
              </button>
              
              <div className="h-48 overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                 <div className="absolute bottom-4 left-6 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-xl">
                    <Sparkles className="w-3 h-3" /> Exclusive Unlocked
                 </div>
              </div>
              
              <div className="p-8 pt-4 text-center relative z-10 flex flex-col items-center">
                 <h2 className="font-outfit font-black text-4xl uppercase tracking-tighter text-white mb-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                   Welcome to our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Store</span>
                 </h2>
                 <p className="text-sm font-bold uppercase tracking-widest text-gray-400 leading-relaxed mb-8 max-w-sm">
                   Explore the best premium posters on the market. Change your room's transformation instantly. Start browsing below.
                 </p>
                 
                 <button 
                   onClick={() => setShowWelcomePopup(false)}
                   className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] flex items-center justify-center gap-2"
                 >
                   <Heart className="w-4 h-4" /> Start Exploring Postings
                 </button>
              </div>
           </div>
        </div>
      )}

      <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden bg-black flex flex-col justify-end">
         
         <div className="absolute inset-0 z-0">
           {/* @ts-ignore */}
           <CircularGallery 
             items={galleryItems.length > 0 ? galleryItems : [
               { image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=600", text: "MARVEL" }
             ]}
             bend={2.5}
             scrollSpeed={2}
           />
         </div>

         {/* Gradient overlay to make text readable */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 pointer-events-none z-10" />

         <div className="relative z-20 max-w-7xl mx-auto w-full px-6 pb-16 md:pb-24 pointer-events-none">
            <h1 className="text-4xl md:text-7xl font-outfit font-black mb-4 uppercase leading-tight md:leading-normal">
              Design Your <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">Masterpiece</span>
            </h1>
            <p className="text-gray-300 mb-6 max-w-md text-sm md:text-lg leading-relaxed uppercase tracking-widest font-bold">Scroll horizontally to explore our 3D gallery.</p>
            <button className="bg-white text-black px-8 py-4 rounded-xl font-black transition-colors uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 pointer-events-auto hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:text-black">
              Explore Collection <Sparkles className="w-5 h-5 ml-2" />
            </button>
         </div>
      </section>

      {/* SPECIAL DELIVERY HIGHLIGHT */}
      <div className="w-full bg-emerald-500/10 border-t border-b border-emerald-500/20 py-4 px-6 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left relative z-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-400" />
               </div>
               <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-white">⚡ 1-DAY DELIVERY IN VISAKHAPATNAM</p>
                  <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold mt-0.5">5-6 DAYS PAN INDIA ANYWHERE ELSE</p>
               </div>
            </div>
            <Link href="/terms" className="md:ml-8 text-[11px] uppercase tracking-widest font-black text-black bg-emerald-400 hover:bg-emerald-300 px-5 py-2.5 rounded-full transition-colors flex items-center gap-1">
               See More Policies <ArrowUpRight className="w-3 h-3" />
            </Link>
         </div>
      </div>

      {/* UPGRADED CATEGORIES SECTION */}
      {menuItems.length > 0 && (
        <section className="py-20 border-b border-white/10">
          <h2 className="text-3xl md:text-5xl font-outfit font-black uppercase mb-2 text-center">Shop By Category</h2>
          <p className="text-center text-gray-400 mb-12 uppercase tracking-widest text-sm font-semibold">Hover to interact</p>
          <div style={{ height: '450px', position: 'relative' }} className="w-full">
            <FlowingMenu 
              items={menuItems}
              speed={20}
              textColor="#ffffff"
              bgColor="#000000"
              marqueeBgColor="#ffffff"
              marqueeTextColor="#000000"
              borderColor="#333333"
            />
          </div>
        </section>
      )}

      {/* GLOBAL EVENT CAROUSEL (Relocated Below Categories, Clean Fade UI) */}
      {isEventActive && eventBanners.length > 0 && (
         <div className="w-full relative shadow-2xl z-40 bg-black animate-in fade-in duration-1000 h-[30vh] md:h-[50vh] xl:h-[65vh] overflow-hidden group border-b border-t border-white/5">
            {eventBanners.map((bannerImg, idx) => (
               <div 
                 key={idx} 
                 className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
               >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={bannerImg} 
                    alt={`Event Banner Template ${idx + 1}`} 
                    className="w-full h-full object-cover md:object-contain bg-black pointer-events-none"
                  />
                  <Link href="/shop" className="absolute inset-0 z-20" aria-label="Shop Event Deals" />
               </div>
            ))}
            
            {/* Minimal Dot Indicators */}
            {eventBanners.length > 1 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-30 pointer-events-none">
                 {eventBanners.map((_, i) => (
                   <div key={i} className={`h-1.5 rounded-full backdrop-blur-md transition-all duration-500 ${i === currentSlide ? 'w-8 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'w-2 bg-white/30'}`} />
                 ))}
               </div>
            )}
         </div>
      )}

      {/* TRENDING PRODUCTS (ML Mockup) */}
      <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-outfit font-black uppercase">Trending right now</h2>
            <p className="text-gray-400 text-sm mt-2">The hottest designs everyone is ordering this week.</p>
          </div>
          <Link href="/shop" className="text-xs font-bold uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors hidden md:block">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {trendingProducts.map(p => (
            <Link href={`/product/${p.id}`} key={p.id} className="group cursor-pointer">
                <div className="relative w-full aspect-[3/4] bg-zinc-900 rounded-lg md:rounded-xl mb-3 md:mb-4 overflow-hidden border border-white/5 group-hover:border-white/30 transition-colors shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=400'} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.12] transition-transform duration-700 ease-out" />
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 flex flex-col gap-2">
                    <div className="bg-red-600 px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-xs font-black uppercase tracking-widest text-white rounded-md shadow-md flex items-center gap-1">
                      🔥 HOT
                    </div>
                    {p.actualPrice && p.actualPrice > p.price ? (
                      <div className="bg-emerald-500 text-black px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-xs font-black uppercase tracking-widest rounded-md shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                        {Math.round(((p.actualPrice - p.price) / p.actualPrice) * 100)}% OFF
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start px-1 mt-2">
                  <div>
                    <h3 className="font-outfit font-bold text-xs md:text-base uppercase text-gray-200 group-hover:text-white transition-colors leading-tight">{p.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{p.category}</p>
                  </div>
                  <div className="flex flex-col items-end mt-1 md:mt-0">
                     {p.actualPrice > p.price && (
                       <span className="font-outfit text-[10px] md:text-xs text-gray-500 line-through tracking-wider">₹{p.actualPrice}</span>
                     )}
                     <span className="font-outfit font-black text-sm md:text-lg text-emerald-400 tracking-wider">₹{p.price}</span>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DESIGN YOUR OWN */}
      <section className="py-16 md:py-20 px-4 md:px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-zinc-900 border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-transparent" />
          </div>
          <div className="z-10 relative max-w-lg">
            <h2 className="text-3xl md:text-5xl font-outfit font-black uppercase mb-4">Design Your Own</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">Turn your personal memories into gallery-quality posters. We build custom sizes, apply retro frames, and deliver straight to your wall.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {['Split Poster', 'Retro Prints', 'Mini Pocket Photos', 'Booth Strip'].map((item, index) => (
            <Link href={`/design?type=${item.toLowerCase().replace(/ /g, '-')}`} key={index} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 md:p-6 hover:bg-zinc-800 transition-colors cursor-pointer group block text-center">
              <div className="w-full aspect-square bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow">
                 <img src={`https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=400&sig=${index}`} alt={item} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" />
              </div>
              <h3 className="text-sm md:text-lg font-outfit font-bold uppercase group-hover:text-white text-gray-200 transition-colors">{item}</h3>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Make Your Own &rarr;</p>
            </Link>
          ))}
        </div>
      </section>

      {/* RECOMMENDED FOR YOU (Based on simple mock ML logic) */}
      <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-4xl font-outfit font-black uppercase inline-flex items-center gap-3">
             <Star className="w-6 h-6 text-yellow-500 fill-current" /> Recommended For You
          </h2>
          <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">Based on your recent viewing history</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {recommendedProducts.map(p => (
            <Link href={`/product/${p.id}`} key={p.id} className="group cursor-pointer">
                <div className="relative w-full aspect-[3/4] bg-zinc-900 rounded-lg md:rounded-xl mb-3 md:mb-4 overflow-hidden border border-white/5 group-hover:border-white/20 transition-colors shadow-lg">
                  <div className="absolute inset-0 bg-black/10 md:group-hover:bg-transparent transition-colors z-10" />
                  <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.12] transition-transform duration-700 ease-out" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-none hidden md:block">
                    <span className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                       <CreditCard className="w-3 h-3" /> Buy Now
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
                     {p.actualPrice > p.price && (
                       <div className="bg-emerald-500 text-black px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-xs font-black uppercase tracking-widest rounded-md shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                         {Math.round(((p.actualPrice - p.price) / p.actualPrice) * 100)}% OFF
                       </div>
                     )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start px-1 mt-2">
                  <div>
                    <h3 className="font-outfit font-bold text-xs md:text-base uppercase text-gray-200 group-hover:text-white transition-colors leading-tight">{p.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">4.9 / 5</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end mt-1 md:mt-0">
                     {p.actualPrice > p.price && (
                       <span className="font-outfit text-[10px] md:text-xs text-gray-500 line-through tracking-wider">₹{p.actualPrice}</span>
                     )}
                     <span className="font-outfit font-black text-sm md:text-lg text-emerald-400 tracking-wider">₹{p.price}</span>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      </section>

      {/* GALLERY LOOP REVIEWS SECTION */}
      <section className="py-20 border-t border-white/10 bg-black overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-outfit font-black uppercase">Verified Reviews in Real Homes</h2>
            <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">Loved by thousands of customers nationwide</p>
          </div>
        </div>
          
        <div className="w-full flex flex-col gap-4 md:gap-6 py-4">
          <div className="w-full relative">
            <div className="md:hidden block">
              <LogoLoop logos={reviewImagesRow1} speed={60} direction="left" logoHeight={250} gap={16} pauseOnHover={true}
                renderItem={(rev: any) => (
                  <div className="relative w-[200px] h-[250px] rounded-2xl overflow-hidden group border border-white/10 shrink-0">
                    <img src={rev.img} alt={rev.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                       <p className="text-sm font-outfit font-bold italic mb-1 text-white leading-tight">"{rev.text}"</p>
                       <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">— {rev.name}</span>
                    </div>
                  </div>
                )}
              />
            </div>
            <div className="hidden md:block h-[450px]">
              <LogoLoop logos={reviewImagesRow1} speed={60} direction="left" logoHeight={450} gap={24} pauseOnHover={true}
                renderItem={(rev: any) => (
                  <div className="relative w-[350px] h-[450px] rounded-3xl overflow-hidden group border border-white/10 shrink-0">
                    <img src={rev.img} alt={rev.alt} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                       <div className="flex gap-1 text-yellow-500 mb-2">
                         {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-current" />)}
                       </div>
                       <p className="text-xl font-outfit font-bold italic mb-2 text-white leading-tight">"{rev.text}"</p>
                       <span className="text-xs text-gray-400 uppercase tracking-widest font-black">— {rev.name}</span>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="w-full relative">
             <div className="md:hidden block mt-2">
              <LogoLoop logos={reviewImagesRow2} speed={50} direction="right" logoHeight={250} gap={16} pauseOnHover={true}
                renderItem={(rev: any) => (
                  <div className="relative w-[200px] h-[250px] rounded-2xl overflow-hidden group border border-white/10 shrink-0">
                    <img src={rev.img} alt={rev.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                       <p className="text-sm font-outfit font-bold italic mb-1 text-white leading-tight">"{rev.text}"</p>
                       <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">— {rev.name}</span>
                    </div>
                  </div>
                )}
              />
             </div>
             <div className="hidden md:block h-[450px]">
              <LogoLoop logos={reviewImagesRow2} speed={50} direction="right" logoHeight={450} gap={24} pauseOnHover={true}
                renderItem={(rev: any) => (
                  <div className="relative w-[350px] h-[450px] rounded-3xl overflow-hidden group border border-white/10 shrink-0">
                    <img src={rev.img} alt={rev.alt} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                       <div className="flex gap-1 text-yellow-500 mb-2">
                         {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-current" />)}
                       </div>
                       <p className="text-xl font-outfit font-bold italic mb-2 text-white leading-tight">"{rev.text}"</p>
                       <span className="text-xs text-gray-400 uppercase tracking-widest font-black">— {rev.name}</span>
                    </div>
                  </div>
                )}
              />
             </div>
          </div>
        </div>
      </section>

      {mappedBentoCards.length > 0 && (
         <div className="max-w-[54em] mx-auto w-full my-20">
             <div className="flex items-center gap-4 mb-8 px-6 border-b border-white/10 pb-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                   <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-5xl font-outfit font-black uppercase tracking-tighter text-white">Featured Drops</h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Exclusive products curated by Admin</p>
                </div>
             </div>
             <MagicBento cardsData={mappedBentoCards} />
         </div>
      )}

      {/* THE MANIFESTO (Why Choose Us Replacement - Minimized) */}
      <section className="py-24 border-t border-white/10 bg-black relative overflow-hidden group hover:bg-zinc-950 transition-colors cursor-pointer" onClick={() => window.location.href='/story'}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-rose-500/10 transition-all duration-1000" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="font-outfit font-black text-rose-500 text-xs md:text-sm uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-4">
             <span className="w-8 h-[1px] bg-rose-500/50"></span>
             Our Story & Mission
             <span className="w-8 h-[1px] bg-rose-500/50"></span>
          </h2>
          
          <h3 className="font-outfit font-black text-3xl md:text-5xl text-white uppercase leading-[1.1] mb-8 tracking-tight group-hover:-translate-y-2 transition-transform duration-500">
            We don’t sell posters.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700">We build your space.</span>
          </h3>

          <p className="font-outfit font-medium text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
             Every drop is curated like a playlist. Not random. Not mass. Intentional. Built for the creators, the dreamers, and the late-night grinders.
          </p>

          <Link href="/story" className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-8 py-3.5 rounded-full font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-105">
             Read Our Story <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
