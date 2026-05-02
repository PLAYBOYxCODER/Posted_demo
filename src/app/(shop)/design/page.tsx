"use client";
import React, { Suspense } from "react";
import { ArrowRight, Split, ImageIcon, Wallet, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOffers } from "@/components/OffersProvider";

// Product types with their details - 3 categories only
const productTypes = [
  {
    id: "split-poster",
    title: "Split Poster (Triptych)",
    price: 999,
    desc: "A massive panoramic style, sliced perfectly across three separate modern panels.",
    icon: Split,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&q=80&w=600",
    color: "from-emerald-500/20 to-cyan-500/20"
  },
  {
    id: "retro-prints",
    title: "Retro Polaroid Prints",
    price: 499,
    desc: "Classic thick-bordered vintage photography style with iconic bottom caption.",
    icon: ImageIcon,
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600",
    color: "from-orange-500/20 to-red-500/20"
  },
  {
    id: "mini-pocket-photos",
    title: "Mini Pocket Photos",
    price: 299,
    desc: "Adorable wallet-sized prints to keep your distinct memories close.",
    icon: Wallet,
    image: "https://images.unsplash.com/photo-1542044801-30d3e45ae401?auto=format&fit=crop&q=80&w=600",
    color: "from-purple-500/20 to-pink-500/20"
  }
];

function DesignLandingContent() {
  const router = useRouter();
  const { designThumbnails } = useOffers();

  return (
    <main className="min-h-screen bg-black text-white pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-outfit font-black uppercase mb-4">
            Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Masterpiece</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Choose your product type and create personalized prints with your own photos
          </p>
        </div>

        {/* Product Type Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {productTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Link
                key={type.id}
                href={`/design/${type.id}`}
                className="group relative bg-zinc-900 border border-white/10 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={designThumbnails[`${type.id.split('-')[0]}_desktop`] || designThumbnails[type.id.split('-')[0]] || type.image} 
                    alt={type.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-emerald-500 text-black font-black text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                    ₹{type.price}
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="font-outfit font-bold text-base sm:text-lg uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
                      {type.title}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm mb-4 line-clamp-2">
                    {type.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 uppercase tracking-wider font-bold">Customize</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-emerald-500 flex items-center justify-center transition-all group-hover:scale-110">
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm sm:text-base mb-1">Upload Photos</h4>
            <p className="text-gray-500 text-xs sm:text-sm">Select from gallery or upload your own images</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Split className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm sm:text-base mb-1">Customize Design</h4>
            <p className="text-gray-500 text-xs sm:text-sm">Add text, choose layouts, preview in real-time</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm sm:text-base mb-1">Order & Ship</h4>
            <p className="text-gray-500 text-xs sm:text-sm">Handcrafted and delivered in 3-7 days</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DesignLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <span className="animate-pulse text-sm">Loading...</span>
      </div>
    }>
      <DesignLandingContent />
    </Suspense>
  );
}
