"use client";
import React from "react";
import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";
import { useOffers } from "./OffersProvider";

export default function Footer() {
  const { whatsappNumber } = useOffers();

  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div>
          <h3 className="font-outfit font-bold text-xl uppercase mb-4 text-white">Poster Store</h3>
          <p className="text-gray-400 leading-relaxed">
            Premium quality prints, retro frames, and custom designs tailored to elevate your walls. We don't just sell posters; we sell art.
          </p>
        </div>
        
        <div>
          <h4 className="font-outfit font-bold uppercase mb-4 text-white">Quick Links</h4>
          <ul className="flex flex-col gap-2 text-gray-400">
            <li><Link href="/shop" className="hover:text-white transition-colors">All Posters</Link></li>
            <li><Link href="/design/custom" className="hover:text-white transition-colors">Design Your Own</Link></li>
            <li><Link href="/story" className="hover:text-white transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link href="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
          </ul>
        </div>

        <div>
           <h4 className="font-outfit font-bold uppercase mb-4 text-white">Support policies</h4>
           <ul className="flex flex-col gap-2 text-gray-400">
             <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
             <li><Link href="/returns" className="hover:text-white transition-colors">Return Policy (7 Days)</Link></li>
             <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
             <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
           </ul>
        </div>

        <div>
          <h4 className="font-outfit font-bold uppercase mb-4 text-white">Contact</h4>
          <ul className="flex flex-col gap-3 text-gray-400">
             <li className="flex items-start gap-2 max-w-[250px]"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> 9-13-51/8, New Resapuvanipalem, Opp Swarna Bharathi Indoor Stadium, Visakhapatnam-530013</li>
             <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@posterstore.in</li>
             <li className="flex items-center gap-2"><Instagram className="w-4 h-4" /> @posterstore</li>
          </ul>
          <div className="mt-4">
             <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 border border-white/10 rounded-full px-4 py-2 hover:bg-zinc-800 transition-colors inline-flex items-center gap-2 text-white">
               Chat with us on WhatsApp
             </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col items-center">
        
        <div className="mb-6 bg-red-500/5 border border-red-500/20 px-6 py-4 rounded-xl max-w-2xl text-center">
          <p className="text-red-400 font-bold font-outfit uppercase tracking-widest text-xs mb-1">Strict Return Policy</p>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">We only accept returns for items that are completely <strong className="text-white">unused and untouched</strong>. If the item has been used, unpacked, or mounted even once, it is strictly non-returnable. Unused items can be evaluated for return within <strong className="text-white">7 days</strong> of delivery.</p>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Poster Store. All rights reserved.</p>
          <p className="mt-2 md:mt-0 uppercase tracking-widest">Developed exclusively for your walls</p>
        </div>
      </div>
    </footer>
  );
}
