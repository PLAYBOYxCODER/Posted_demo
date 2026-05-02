"use client";
import React, { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Type, Save, Layout, Monitor, Home, MonitorSpeaker, ArrowLeft, ChevronLeft, Frame, Grid3X3, CreditCard } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useOffers } from "@/components/OffersProvider";
import { supabase } from "@/lib/supabase";

const typeData: Record<string, { title: string, price: number, desc: string }> = {
  "split-poster": { title: "Split Poster", price: 999, desc: "A massive, multi-panel continuous wall piece." },
  "retro-prints": { title: "Retro Prints", price: 499, desc: "Classic polaroid-style vintage photos." },
  "mini-pocket-photos": { title: "Mini Pocket Photos", price: 299, desc: "Wallet-sized adorable prints." }
};

const previewStyles = [
  { id: 'canvas', name: 'Digital Canvas', icon: Layout, bg: null },
  { id: 'wall', name: 'Minimal Wall', icon: Home, bg: 'https://images.unsplash.com/photo-1598928506311-c55dd1b31122?auto=format&fit=crop&q=80&w=800' },
  { id: 'room', name: 'Living Room', icon: MonitorSpeaker, bg: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800' },
  { id: 'gaming', name: 'Gaming Desk', icon: Monitor, bg: 'https://images.unsplash.com/photo-1616423640778-28d1b1c2b513?auto=format&fit=crop&q=80&w=800' }
];

export default function DesignYourOwnPage({ params }: { params: Promise<{ type: string }> }) {
  const unwrappedParams = use(params);
  const typeKey = unwrappedParams.type.toLowerCase();
  const config = typeData[typeKey] || { title: typeKey.replace(/-/g, " "), price: 499, desc: "Custom designed tailored masterpiece." };
  const { galleryItems } = useOffers();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [activePreview, setActivePreview] = useState(previewStyles[0].id);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { addToCart } = useCart();
  const router = useRouter();

  // Upload image to Supabase Storage
  const uploadImageToStorage = async (base64Data: string, fileName: string) => {
    try {
      setIsUploading(true);
      
      // Convert base64 to blob
      const response = await fetch(base64Data);
      const blob = await response.blob();
      
      // Generate unique filename
      const timestamp = Date.now();
      const path = `custom-designs/${typeKey}/${timestamp}_${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('customer-uploads')
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('customer-uploads')
        .getPublicUrl(path);
      
      // Save to database
      const { error: dbError } = await supabase
        .from('customer_designs')
        .insert({
          product_type: typeKey,
          image_url: publicUrl,
          custom_text: customText,
          storage_path: path,
          created_at: new Date().toISOString()
        });
      
      if (dbError) console.error('Database error:', dbError);
      
      setUploadedImageUrl(publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const base64Data = canvas.toDataURL("image/jpeg", 0.8);
          setImagePreview(base64Data);
          
          // Upload to storage
          await uploadImageToStorage(base64Data, file.name);
        };
        if (reader.result) img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const currentPreview = previewStyles.find(p => p.id === activePreview)!;
  const displayImage = imagePreview || selectedGalleryImage;

  // Get first 6 gallery images for sample display
  const sampleImages = galleryItems.slice(0, 6);

  const handleSelectGalleryImage = (img: string) => {
    setSelectedGalleryImage(img);
    setImagePreview(null); // Clear uploaded image when selecting from gallery
  };

  const handleAddToCart = () => {
    const finalImage = imagePreview || selectedGalleryImage;
    if (!finalImage) return alert("Please upload a photo or select a sample image first!");
    
    addToCart({
      id: `custom_${typeKey}_${Date.now()}`,
      name: `Custom ${config.title}`,
      price: config.price,
      image: finalImage,
      quantity: 1,
      size: "Custom Fit",
      finish: customText ? `Text: ${customText}` : "Standard Blank",
      category: "Custom Design"
    });
    
    router.push('/cart');
  };

  // Category-specific preview renderer
  const renderCategoryPreview = () => {
    if (!displayImage) return null;

    // SPLIT POSTER - 3 Panel Triptych
    if (typeKey === 'split-poster') {
      return (
        <div className="flex gap-1 sm:gap-2 h-full items-center justify-center p-2 sm:p-4">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="h-[70%] sm:h-[80%] w-1/3 bg-white shadow-xl overflow-hidden"
              style={{ 
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                transform: i === 1 ? 'scale(1.02)' : 'scale(1)',
                zIndex: i === 1 ? 10 : 5
              }}
            >
              <img 
                src={displayImage} 
                alt={`Panel ${i + 1}`}
                className="w-full h-full object-cover"
                style={{ objectPosition: `${i * 50}% center` }}
              />
            </div>
          ))}
        </div>
      );
    }

    // RETRO PRINTS - Polaroid Style
    if (typeKey === 'retro-prints') {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <div 
            className="relative bg-white p-2 sm:p-3 pb-8 sm:pb-12 shadow-2xl"
            style={{ 
              transform: 'rotate(-2deg)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              maxWidth: '280px',
              width: '100%'
            }}
          >
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img 
                src={displayImage} 
                alt="Retro Print"
                className="w-full h-full object-cover"
              />
            </div>
            {customText && (
              <p className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center text-black font-handwriting text-xs sm:text-sm px-4 truncate">
                {customText}
              </p>
            )}
          </div>
        </div>
      );
    }

    // MINI POCKET PHOTOS - 4 Wallet Photos
    if (typeKey === 'mini-pocket-photos') {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-[240px]">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i}
                className="aspect-square bg-white p-1 shadow-lg"
                style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
              >
                <img 
                  src={displayImage} 
                  alt={`Pocket Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-black text-white pt-20 pb-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button & Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold font-outfit hidden sm:block">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronLeft className="w-3 h-3 inline mx-1 rotate-180" />
            <Link href="/design" className="hover:text-white transition-colors">Design</Link>
            <ChevronLeft className="w-3 h-3 inline mx-1 rotate-180" />
            <span className="text-white">{config.title}</span>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <h1 className="text-2xl sm:text-3xl font-outfit font-black uppercase mb-2">
            Design your <span className="text-emerald-400">{config.title}</span>
          </h1>
          <p className="text-gray-400 text-sm">{config.desc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT: Preview Canvas */}
          <div className="flex flex-col gap-4 order-1 md:order-1">
             {/* Main Preview Area */}
             <div className="bg-zinc-900 rounded-2xl border border-white/10 relative overflow-hidden aspect-square sm:aspect-[4/3] lg:min-h-[50vh]">
               {/* Preview Label */}
               <div className="absolute top-3 left-3 z-20 bg-black/60 px-3 py-1 rounded-full text-xs uppercase tracking-wider backdrop-blur-md border border-white/10">
                 {displayImage ? "Your Preview" : "Select or Upload"}
               </div>

               {/* Category-Specific Preview */}
               {displayImage ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                   {renderCategoryPreview()}
                 </div>
               ) : (
                 /* Single Placeholder when no image selected */
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-zinc-900/50">
                    <div className="w-24 h-24 mb-6 rounded-full bg-zinc-800 border-2 border-white/10 border-dashed flex items-center justify-center">
                       <Upload className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="font-outfit font-black text-xl mb-2 text-white">READY TO DESIGN</h3>
                    <p className="text-center text-sm text-gray-400 max-w-[250px]">
                      Upload your high quality photo below to see a real-time mockup of your product.
                    </p>
                 </div>
               )}
             </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="flex flex-col justify-start order-2 md:order-2">
            {/* Desktop Header */}
            <div className="hidden md:block mb-8">
              <h1 className="text-4xl xl:text-5xl font-outfit font-black uppercase mb-4">
                Design your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{config.title}</span>
              </h1>
              <p className="text-gray-400 text-lg">{config.desc}</p>
            </div>

            {/* Upload Control */}
            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 sm:mb-3 text-gray-300">
                1. {displayImage ? "Change Photo" : "Upload Your Photo"} <span className="text-red-500">*</span>
              </label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-emerald-500/50 transition-colors rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center bg-zinc-900/50 cursor-pointer group">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                <p className="text-xs sm:text-sm text-gray-300 font-bold uppercase tracking-widest text-center">{imagePreview ? "Replace Photo" : "Click to Upload Image"}</p>
                <p className="text-[10px] text-emerald-500/80 mt-1 sm:mt-2 uppercase font-black tracking-widest">JPG & PNG supported</p>
              </div>
              
              {/* Selected Gallery Image Indicator */}
              {selectedGalleryImage && !imagePreview && (
                <div className="mt-2 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <span className="text-xs text-emerald-400 font-medium">Using sample image</span>
                  <button 
                    onClick={() => setSelectedGalleryImage(null)}
                    className="text-xs text-gray-400 hover:text-white underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Text Control */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 sm:mb-3 text-gray-300">2. Custom Text (Optional)</label>
              <div className="relative group">
                <Type className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-focus-within:text-emerald-400" />
                <input 
                  type="text" 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., BEST DAY EVER" 
                  className="w-full bg-zinc-900 border border-white/20 rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors uppercase font-outfit font-bold tracking-wider text-sm"
                  maxLength={30}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-auto border-t border-white/10 pt-4 sm:pt-6">
               <div className="flex justify-between items-center mb-2 sm:mb-4">
                 <span className="text-gray-400 uppercase tracking-widest font-bold text-xs">Total</span>
                 <span className="text-2xl sm:text-4xl font-black font-outfit text-emerald-400">₹{config.price}</span>
               </div>
               <button 
                 onClick={handleAddToCart}
                 disabled={!displayImage}
                 className={`w-full py-3 sm:py-4 rounded-xl font-black uppercase tracking-widest transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 sm:gap-3 text-sm ${displayImage ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
               >
                 <Save className="w-4 h-4 sm:w-5 sm:h-5" /> 
                 {displayImage ? "Add to Cart" : "Upload Photo First"}
               </button>
               <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">3-7 Business Days Delivery</p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}
