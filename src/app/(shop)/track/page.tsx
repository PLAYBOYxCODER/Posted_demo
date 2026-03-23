"use client";
import React, { useState } from "react";
import { Package, Search } from "lucide-react";
import { useOrders } from "@/components/OrderProvider";
import Link from "next/link";

export default function TrackOrderPage() {
  const [searchId, setSearchId] = useState("");
  const { orders } = useOrders();
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(!searchId.trim()) return;
    
    setHasSearched(true);
    const order = orders.find(o => o.id.toLowerCase() === searchId.toLowerCase().trim());
    setFoundOrder(order || null);
  };

  const statusMap: Record<string, string> = {
    'pending': 'Order Placed (Awaiting Dispatch)',
    'processing': 'Processing Artwork',
    'ready_to_transport': 'Ready for Courier Pickup',
    'shipped': 'In Transit (Left Hub)',
    'near_city': 'Arrived at Destination City',
    'delivered': 'Successfully Delivered'
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:py-24">
      <div className="max-w-3xl mx-auto">
         <div className="flex flex-col items-center justify-center text-center mb-12">
            <Package className="w-16 h-16 text-emerald-500 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
            <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-widest text-white mb-4">Track Dispatch</h1>
            <p className="text-gray-400 max-w-lg mb-8 tracking-widest uppercase text-xs font-bold">Instantly locate your securely packaged poster anywhere in transit from our facility to your wall.</p>
            
            <form onSubmit={handleSearch} className="w-full relative flex gap-2 max-w-xl mx-auto">
               <input 
                 type="text"
                 value={searchId}
                 onChange={(e) => setSearchId(e.target.value)}
                 placeholder="Enter Tracking ID (e.g., ORD-123456)"
                 className="w-full bg-zinc-900 border-2 border-white/20 hover:border-white/50 focus:border-emerald-500 transition-colors rounded-2xl py-4 pl-6 pr-16 uppercase tracking-widest font-bold placeholder-gray-600 outline-none" 
               />
               <button type="submit" className="absolute right-2 top-2 bottom-2 bg-emerald-500 text-black px-6 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-lg">
                 Track <Search className="w-4 h-4 ml-2 inline-block -mt-0.5" />
               </button>
            </form>
         </div>
         
         {hasSearched && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {foundOrder ? (
                 <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-6">
                       <div>
                          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-1">Found Tracking ID</p>
                          <h2 className="text-3xl font-outfit font-black uppercase tracking-widest text-white">{foundOrder.id}</h2>
                          <p className="text-gray-400 text-sm mt-1">{foundOrder.date}</p>
                       </div>
                       <Link href="/profile" className="mt-4 md:mt-0 px-4 py-2 border border-white/20 hover:bg-white hover:text-black rounded-lg text-xs uppercase font-bold tracking-widest transition-colors">
                         View Full Invoice
                       </Link>
                    </div>
                    
                    <div className="space-y-6 relative border-l-2 border-emerald-500/30 ml-4 pl-8 min-h-[200px]">
                       <div className="absolute top-0 -left-[11px] w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-4 border-black animate-pulse" />
                       <div>
                          <p className="text-xs uppercase font-bold tracking-widest text-emerald-500 mb-1">Live Status</p>
                          <h3 className="text-2xl font-outfit font-black text-white italic uppercase">{statusMap[foundOrder.status] || "Unknown Transit"}</h3>
                       </div>
                       
                       <p className="text-sm text-gray-400 bg-black/50 p-4 rounded-xl border border-white/5 leading-relaxed tracking-wider">
                          <strong className="text-white block uppercase tracking-widest text-xs mb-1">Shipping Sub-Address</strong>
                          {foundOrder.address}
                       </p>
                    </div>
                 </div>
               ) : (
                 <div className="bg-zinc-900 border border-red-500/20 p-8 rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                      <Search className="w-6 h-6 text-red-400" />
                    </div>
                    <h2 className="text-xl font-outfit font-bold uppercase tracking-widest text-white">ID Not Recognized</h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">We couldn't track that exact Order ID inside our live system. Make sure you entered it exactly as printed on your receipt.</p>
                 </div>
               )}
            </div>
         )}
         
      </div>
    </div>
  );
}
