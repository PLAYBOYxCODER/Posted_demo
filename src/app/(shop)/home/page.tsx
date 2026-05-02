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
import ProductCarousel from "@/components/ProductCarousel";

export default function HomePage() {
  const { photos: globalPhotos } = useVerifiedPhotos();
  const { 
    marqueeText, isEventActive, eventBanners, galleryItems, activeCategories, activeCarousels, categorySubtitles, mobileCategoryImages, featuredBentoIds, designThumbnails, upcomingDrops
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

  // Derive categories strictly mapped to whatever Admin actively toggled AND actually exist in the DB
  const dbCategories = Array.from(new Set(products.map(p => p.category))).filter(c => c && c !== "Uncategorized");
  const displayCategories = activeCategories.length > 0 
      ? activeCategories.filter(cat => dbCategories.includes(cat) || cat === 'Shop All') 
      : dbCategories;

  const menuItems = displayCategories.map(cat => {
    // Find the very first actual product graphic mapping securely to this category
    const matchingProducts = products.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    const count = matchingProducts.length;
    
    return {
      link: cat === 'Shop All' ? '/shop' : `/shop?cat=${encodeURIComponent(cat.toLowerCase())}`,
      title: cat,
      text: cat,
      count: cat === 'Shop All' ? products.length : count,
      description: categorySubtitles?.[cat] || "Explore the collection",
      // Priority 1: Admin custom image. Priority 2: Sub-Product graphic. Priority 3: Fallback list.
      image: mobileCategoryImages?.[cat] || (matchingProducts[0] && matchingProducts[0].images?.[0]) || catImageMap[cat] || 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600'
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
    <div className="bg-black text-white selection:bg-white selection:text-black animate-in fade-in duration-[1500ms] fill-mode-forwards ease-out">
      
      {/* Elite Bright Liquid Glass Welcome Promotional Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl px-4 animate-in fade-in duration-500">
           {/* Beautiful White Frost Card for Perfect Logo Contrast */}
           <div className="relative bg-white/95 border border-white rounded-[2rem] max-w-sm w-full shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-700 overflow-hidden group">
              
              {/* Subtle Glowing Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-200 blur-[80px] rounded-full pointer-events-none" />

              <button 
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/5 hover:bg-black/10 border border-black/5 rounded-full flex items-center justify-center text-black/60 hover:text-black transition-all backdrop-blur-md"
              >
                 <X className="w-4 h-4" />
              </button>
              
              <div className="p-8 text-center relative z-10">
                 {/* Logo Showcase inside Purely Black Container */}
                 <div className="w-24 h-24 mx-auto mb-6 rounded-[1.5rem] overflow-hidden bg-black border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-2 group-hover:scale-105 transition-transform duration-700">
                   <img src="/logo_pic.png" alt="Poster Store" className="w-full h-full object-contain filter drop-shadow-md" />
                 </div>
                 
                 {/* High-Contrast Beautiful Typography */}
                 <h2 className="font-outfit font-black text-4xl text-black mb-2 uppercase tracking-tighter">
                   Welcome
                 </h2>
                 <p className="text-xs font-semibold text-gray-500 mb-8 px-2 opacity-90 leading-relaxed uppercase tracking-widest">
                   Unlock custom designs & Exclusive Drops.
                 </p>

                 {/* Bright Premium Options */}
                 <div className="space-y-3">
                   <Link 
                     href="/login"
                     onClick={() => setShowWelcomePopup(false)}
                     className="relative flex items-center justify-center gap-3 w-full bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest py-4 rounded-xl text-xs transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden hover:-translate-y-1"
                   >
                     {/* Soft Shine */}
                     <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                     <ShieldCheck className="w-4 h-4 text-emerald-400" />
                     Sign In With Email
                   </Link>
                   
                   <button 
                     onClick={() => setShowWelcomePopup(false)}
                     className="w-full border-2 border-transparent hover:border-black/5 bg-gray-100 hover:bg-gray-200 text-black/70 hover:text-black font-bold uppercase tracking-widest py-4 rounded-xl text-xs transition-all shadow-inner"
                   >
                     Skip & Browse
                   </button>
                 </div>
                 
                 <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 text-emerald-500" /> Liquid Glass Encrypted
                 </div>
              </div>
           </div>
        </div>
      )}

      <section className="relative w-full h-[50vh] md:h-[80vh] overflow-hidden bg-black flex flex-col justify-end">
         
         <div className="absolute inset-0 z-0">
           <CircularGallery 
             items={galleryItems && galleryItems.length > 0 ? galleryItems : [
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
         </div>
      </section>



      {/* UPGRADED MOBILE-FRIENDLY CATEGORY GRIDS WITH COUNTS */}
      {menuItems.length > 0 && (
        <section className="py-10 md:py-14 border-b border-white/5 relative z-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-12 flex flex-col items-center justify-center text-center">
             <h2 className="text-4xl md:text-5xl font-outfit font-black uppercase mb-3 text-white tracking-widest drop-shadow-xl">Collections</h2>
             <p className="text-gray-400 uppercase tracking-widest text-[10px] md:text-xs font-bold border-b border-emerald-500/50 pb-1 inline-block text-emerald-400">Select A Category</p>
          </div>
          
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
             {/* Desktop Flowing Menu (Black Background, White hover track) */}
             <div className="hidden lg:block h-[400px] w-full relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-black mb-10">
                <FlowingMenu 
                  items={menuItems.map(m => ({ link: m.link, text: m.title, image: m.image, count: m.count.toString() }))}
                  speed={20}
                  textColor="#ffffff"
                  bgColor="#000000"
                  marqueeBgColor="#ffffff"
                  marqueeTextColor="#000000"
                  borderColor="rgba(255,255,255,0.05)"
                />
             </div>
             
             {/* Mobile Responsive Bento Cards */}
             <div className="grid lg:hidden grid-cols-2 gap-3 md:gap-5 auto-rows-[minmax(150px,auto)] md:auto-rows-[minmax(300px,min-content)]">
                {menuItems.map((item, idx) => (
                   <Link 
                     key={idx} 
                     href={item.link}
                     className={`w-full relative rounded-xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-zinc-950 flex shrink-0 ${idx === 0 || idx === 3 ? 'col-span-2 aspect-[2/1] md:aspect-auto md:row-span-2' : 'col-span-1 aspect-square md:aspect-auto'}`}
                   >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 md:p-6 flex flex-col justify-end transition-opacity duration-500 group-hover:from-[#0a0a0a]" />
                      
                      <div className="absolute inset-0 p-3 md:p-6 flex flex-col justify-between">
                         <div className="flex justify-end">
                            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 group-hover:bg-white group-hover:border-white transition-all shadow-lg">
                               <Sparkles className="w-3 h-3 text-emerald-400 group-hover:text-black hidden md:block" />
                               <span className="text-[9px] md:text-[10px] font-black text-white group-hover:text-black uppercase tracking-widest">{item.count} Items</span>
                            </div>
                         </div>
                         <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                             <h3 className="text-2xl md:text-4xl font-outfit font-black uppercase tracking-tight text-white mb-1 shadow-black drop-shadow-2xl">{item.title}</h3>
                             <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-emerald-400 drop-shadow-md pb-1 opacity-80 group-hover:opacity-100">{item.description}</p>
                         </div>
                      </div>
                   </Link>
                ))}
             </div>
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
      <ProductCarousel 
        title="Trending Right Now" 
        subtitle="The hottest designs everyone is ordering this week." 
        products={trendingProducts} 
        viewAllLink="/shop" 
      />



      {/* DESIGN YOUR OWN - REDESIGNED */}
      <section className="py-12 md:py-20 px-4 md:px-6 w-full max-w-[1600px] mx-auto border-t border-white/10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 relative z-10">
          <div className="max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
                <Sparkles className="w-4 h-4" /> Personalize Everything
             </div>
             <h3 className="text-4xl md:text-6xl font-outfit font-black uppercase text-white tracking-widest leading-[1.1]">
                Design Your<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Masterpiece</span>
             </h3>
          </div>
          <p className="text-gray-400 text-sm md:text-base max-w-md uppercase tracking-widest leading-relaxed text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-emerald-500/30 pl-4 md:pl-0 md:pr-6">
             Turn your personal memories into gallery-quality posters. We build custom sizes and deliver straight to your wall.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 relative z-10">
          {[
            { 
               key: 'split', 
               title: 'Split Posters', 
               desc: 'A massive panoramic style, sliced perfectly across three separate modern panels.',
               url: '/design/split-poster',
               mobileImage: designThumbnails?.split_mobile || designThumbnails?.split || 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&q=80&w=800',
               desktopImage: designThumbnails?.split_desktop || designThumbnails?.split || 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&q=80&w=800',
               desktopHover: designThumbnails?.split_hover || null
            },
            { 
               key: 'retro', 
               title: 'Retro Prints', 
               desc: 'Classic thick-bordered vintage photography style with iconic bottom caption text.',
               url: '/design/retro-prints',
               mobileImage: designThumbnails?.retro_mobile || designThumbnails?.retro || 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600',
               desktopImage: designThumbnails?.retro_desktop || designThumbnails?.retro || 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600',
               desktopHover: designThumbnails?.retro_hover || null
            },
            { 
               key: 'mini', 
               title: 'Mini Pocket', 
               desc: 'Adorable wallet-sized prints to keep your distinct memories close.',
               url: '/design/mini-pocket-photos',
               mobileImage: designThumbnails?.mini_mobile || designThumbnails?.mini || 'https://images.unsplash.com/photo-1542044801-30d3e45ae401?auto=format&fit=crop&q=80&w=600',
               desktopImage: designThumbnails?.mini_desktop || designThumbnails?.mini || 'https://images.unsplash.com/photo-1542044801-30d3e45ae401?auto=format&fit=crop&q=80&w=600',
               desktopHover: designThumbnails?.mini_hover || null
            }
          ].map((item, index) => (
            <Link 
               href={item.url} 
               key={index} 
               className={`group block relative rounded-[2rem] overflow-hidden bg-black border border-white/10 hover:border-emerald-500/60 transition-all duration-500 shadow-2xl hover:shadow-[0_0_50px_rgba(16,185,129,0.2)] ${index === 0 ? 'order-last md:order-none col-span-2 md:col-span-1 aspect-[1.5/1] sm:aspect-[2/1] md:aspect-[4/5]' : 'col-span-1 aspect-square md:aspect-[4/5]'}`}
            >
              
              {/* Image Container */}
              <div className="absolute inset-0 w-full h-full bg-zinc-900">
                 {/* Mobile ONLY Image */}
                 <img 
                    src={item.mobileImage} 
                    alt={`${item.title} Mobile`} 
                    className="md:hidden w-full h-full absolute inset-0 object-cover object-center" 
                 />

                 {/* Desktop Base Image (Hides on hover if a hover image exists) */}
                 <img 
                    src={item.desktopImage} 
                    alt={`${item.title} Desktop`} 
                    className={`hidden md:block w-full h-full absolute inset-0 object-cover transition-all duration-700 ease-out opacity-70 group-hover:scale-110 ${item.desktopHover ? 'group-hover:opacity-0' : 'group-hover:opacity-100'} object-center`} 
                 />

                 {/* Desktop Hover Image */}
                 {item.desktopHover && (
                    <img 
                       src={item.desktopHover} 
                       alt={`${item.title} Hover`} 
                       className="hidden md:block w-full h-full absolute inset-0 object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-110 object-center" 
                    />
                 )}
                 {/* Premium Overlay Gradient */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
              </div>
              
              {/* Content Panel */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-left z-20">
                 <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl md:text-4xl font-outfit font-black uppercase text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors drop-shadow-xl blur-0">{item.title}</h3>
                    
                    <p className={`text-xs md:text-sm text-gray-300 mb-6 font-medium leading-relaxed drop-shadow-md max-w-[90%] transition-opacity duration-500 ${index === 0 ? 'block opacity-100' : 'hidden md:block opacity-0 group-hover:opacity-100'}`}>
                       {item.desc}
                    </p>
                    
                    <div className="flex items-center gap-4">
                       <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/50 group-hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-emerald-400 group-hover:after:w-full after:transition-all after:duration-500">
                          Configure Now
                       </span>
                       <div className="w-8 h-8 rounded-full bg-white/5 border border-white/20 flex items-center justify-center backdrop-blur-md group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:text-black transition-all duration-300 group-hover:scale-110 group-hover:rotate-45">
                          <ArrowUpRight className="w-4 h-4 text-current" />
                       </div>
                    </div>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* DYNAMIC ACM (Admin Content Management) CAROUSELS GENERATION */}
      {/* We iterate through whichever categories the admin selected specifically for Carousels */}
      {(activeCarousels || []).map(categoryName => {
         const categoryProducts = products.filter(p => p.category === categoryName);
         if (categoryProducts.length === 0) return null;
         
         return (
            <ProductCarousel 
              key={categoryName}
              title={categoryName} 
              subtitle={`Explore The Premium ${categoryName} Collection`} 
              products={categoryProducts.slice(0, 10)} // only show top 10 per carousel
              viewAllLink={`/shop?cat=${encodeURIComponent(categoryName.toLowerCase())}`}
            />
         );
      })}

      {mappedBentoCards.length > 0 && (
         <div className="max-w-7xl mx-auto w-full my-20 px-4 md:px-6">
             <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                   <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-5xl font-outfit font-black uppercase tracking-tighter text-white">Featured Drops</h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Exclusive products curated by Admin</p>
                </div>
             </div>
             <MagicBento cardsData={mappedBentoCards} glowColor="255, 255, 255" />
         </div>
      )}

      {/* RECOMMENDED FOR YOU (Moved Above Reviews) */}
      <div className="pt-2 pb-20 border-t border-white/10">
         <ProductCarousel 
           title="Recommended For You" 
           subtitle="Based on your recent viewing history" 
           products={recommendedProducts} 
         />
      </div>

      {/* UPCOMING DROPS (Non-clickable previews) */}
      {upcomingDrops && upcomingDrops.length > 0 && (
         <div className="max-w-7xl mx-auto w-full mb-20 px-4 md:px-6">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
               <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/30">
                  <Star className="w-6 h-6 text-rose-400" />
               </div>
               <div>
                  <h2 className="text-3xl md:text-5xl font-outfit font-black uppercase tracking-tighter text-white">Upcoming Drops</h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Sneak Peek • Not Yet Available For Purchase</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
               {upcomingDrops.map((drop, idx) => (
                  <div key={idx} className="relative group rounded-3xl md:rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-950/50 aspect-[4/5] flex flex-col justify-end shadow-2xl">
                     <img src={drop.image} alt={drop.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent opacity-80 pointer-events-none" />
                     <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-md self-start px-3 py-1.5 rounded-full border border-white/20">
                           <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">{drop.subtitle}</span>
                        </div>
                        <div className="flex flex-col gap-2 relative z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                           <h3 className="text-2xl font-outfit font-black uppercase tracking-widest text-white shadow-black drop-shadow-lg leading-tight">{drop.title}</h3>
                           <p className="text-[11px] text-gray-300 font-medium italic leading-relaxed font-serif border-l-2 border-rose-500/60 pl-3 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block">
                              "A new aesthetic paradigm. Curated for the bold."
                           </p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

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
                       <p className="text-xs font-inter italic mb-1 text-gray-200 leading-snug">"{rev.text}"</p>
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
                       <p className="text-[13px] font-inter italic mb-2 text-gray-200 leading-relaxed font-medium">"{rev.text}"</p>
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
                       <p className="text-xs font-inter italic mb-1 text-gray-200 leading-snug">"{rev.text}"</p>
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
                       <p className="text-[13px] font-inter italic mb-2 text-gray-200 leading-relaxed font-medium">"{rev.text}"</p>
                       <span className="text-xs text-gray-400 uppercase tracking-widest font-black">— {rev.name}</span>
                    </div>
                  </div>
                )}
              />
             </div>
          </div>
        </div>
      </section>



      {/* THE MANIFESTO (Why Choose Us Replacement - Minimized) */}
      <section className="py-16 md:py-24 border-t border-white/10 bg-black relative overflow-hidden group hover:bg-zinc-950 transition-colors cursor-pointer" onClick={() => window.location.href='/story'}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[600px] h-[400px] md:h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-rose-500/10 transition-all duration-1000" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center w-full">
          <h2 className="font-outfit font-black text-rose-500 text-[10px] md:text-sm uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-2 md:gap-4">
             <span className="w-4 md:w-8 h-[1px] bg-rose-500/50"></span>
             Our Story & Mission
             <span className="w-4 md:w-8 h-[1px] bg-rose-500/50"></span>
          </h2>
          
          <h3 className="font-outfit font-black text-2xl md:text-5xl text-white uppercase leading-[1.2] md:leading-[1.1] mb-6 md:mb-8 tracking-tight group-hover:-translate-y-2 transition-transform duration-500">
            We don’t sell posters.<br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700"> We build your space.</span>
          </h3>

          <p className="font-inter font-medium text-xs md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
             Every drop is curated like a playlist. Not random. Not mass. Intentional. Built for the creators, the dreamers, and the late-night grinders.
          </p>

          <Link href="/story" className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-6 md:px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs md:text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-105">
             Read Our Story <ArrowUpRight className="w-4 h-4" />
          </Link>
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

      {/* ALL SECTIONS MOVED UP */}

    </div>
  );
}
