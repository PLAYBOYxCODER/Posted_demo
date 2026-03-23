"use client";
import React, { useState } from "react";
import { Download, CheckCircle2, Wand2, ArrowUpRight, Maximize2, X } from "lucide-react";
import { useOrders, OrderModel } from "@/components/OrderProvider";
import { CartItem } from "@/components/CartProvider";

import { useAdminAuth } from "@/components/AdminProvider";

export default function CustomOrdersPage() {
  const { adminEmail, adminPass } = useAdminAuth();
  const { orders, updateOrderStatus } = useOrders();
  
  // Isolate only PENDING orders that contain customized User-Uploaded files
  const customTaskOrders = orders.filter(o => 
    o.status === "pending" && o?.items?.some((item: CartItem) => item.id?.startsWith("custom_") || item.name?.includes("Custom Design"))
  );

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDownloadOriginal = (base64String: string, orderId: string, itemName: string) => {
    // Generate clean filename
    const sanitizedName = itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${orderId}_${sanitizedName}_HD_Source.jpg`;
    
    // Create physical DOM trigger structure
    const a = document.createElement("a");
    a.href = base64String;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Group orders purely by day for UI
  const groupedOrders = customTaskOrders.reduce((acc, order) => {
    const d = order.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(order);
    return acc;
  }, {} as Record<string, OrderModel[]>);

  return (
    <div className="animate-in fade-in h-full flex flex-col p-4 md:p-8 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 border-b border-white/10 pb-6">
         <h1 className="text-3xl md:text-4xl font-outfit font-black uppercase text-white tracking-widest flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-emerald-400" /> 
            Customization Orders Inbox
         </h1>
         <p className="text-gray-400 mt-2">Special Priority Queue: Process user-uploaded designs, review requirements, and grab HD source files for printing.</p>
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
          <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 p-4 hover:bg-white/10 rounded-full transition-colors text-white group">
             <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <img src={previewImage} className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl rounded-sm" />
        </div>
      )}

      {customTaskOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 rounded-3xl p-12 bg-zinc-900/30">
           <Wand2 className="w-16 h-16 text-gray-700 mb-6 mx-auto opacity-50" />
           <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-500 mb-2">Queue is Empty</h2>
           <p className="text-gray-600 text-sm">No new custom creation orders have been logged yet.</p>
        </div>
      ) : (
        <div className="space-y-12 pb-24">
           {Object.entries(groupedOrders).map(([date, dateOrders]) => (
             <div key={date} className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 sticky top-0 z-10 backdrop-blur-md">
                   <div className="bg-emerald-500 text-black px-4 py-1.5 font-black shrink-0 uppercase tracking-widest rounded-lg text-sm">{date}</div>
                   <div className="text-gray-400 font-bold uppercase tracking-widest text-xs shrink-0">Processing Inbox: <span className="text-white text-sm">{dateOrders.length} Tasks</span></div>
                   <div className="h-[1px] bg-white/10 flex-1 ml-4 hidden md:block"></div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                   {dateOrders.map((order) => {
             // Only target the specific items that need printing
             const customPrintItems = order.items?.filter((i: CartItem) => i.id?.startsWith("custom_") || i.name?.includes("Custom Design")) || [];
             
             return (
                <div key={order.id} className="bg-zinc-900 border border-emerald-500/20 rounded-3xl p-6 lg:p-8 flex flex-col xl:flex-row gap-8 shadow-xl relative overflow-hidden">
                   
                   {/* Urgent Indicator Stripe */}
                   {order.status === "pending" || order.status === "processing" ? (
                      <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-emerald-400 to-cyan-500" />
                   ) : (
                      <div className="absolute top-0 right-0 h-full w-2 bg-gray-600" />
                   )}

                   {/* Customer Meta */}
                   <div className="w-full xl:w-1/3 shrink-0 flex flex-col justify-between">
                     <div>
                       <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                          <span className="bg-emerald-500 text-black px-3 py-1 text-xs font-black tracking-widest uppercase rounded">Priority Custom</span>
                          <span className="text-sm font-bold text-gray-400">{order.date}</span>
                       </div>
                       
                       <h3 className="text-3xl font-outfit font-black text-white tracking-widest mb-1">{order.id}</h3>
                       <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
                           Client: <span className="text-emerald-400 font-bold">{order.customerName}</span>
                       </p>

                       <div className="bg-black border border-white/10 rounded-xl p-4">
                          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Delivery Target</p>
                          <p className="text-sm text-gray-300 font-medium leading-relaxed">{order.address}</p>
                          <p className="text-sm text-gray-400 mt-2">{order.email}</p>
                       </div>
                     </div>

                     <div className="mt-6 flex gap-3">
                        <button 
                           onClick={() => updateOrderStatus(order.id, "processing", { email: adminEmail, password: adminPass })}
                           className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                           <CheckCircle2 className="w-4 h-4" /> Mark As Printed
                        </button>
                     </div>
                   </div>

                   {/* Custom Print Payloads Array */}
                   <div className="w-full xl:w-2/3 flex flex-col gap-4">
                      {customPrintItems.map((item, idx) => (
                         <div key={item.id} className="bg-black border border-white/10 rounded-2xl flex flex-col md:flex-row shadow-inner overflow-hidden relative group">
                            
                            {/* Hidden Image Meta */}
                            <div className="relative w-full md:w-48 aspect-square md:aspect-auto md:h-full shrink-0 bg-zinc-950 border-r border-white/10 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(item.image)}>
                               <img src={item.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                  <Maximize2 className="w-8 h-8 text-white drop-shadow-md" />
                               </div>
                               <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] uppercase font-bold text-white backdrop-blur">
                                  Attachment #{idx+1}
                               </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col justify-between">
                               <div>
                                  <h4 className="text-lg font-bold font-outfit text-emerald-400 uppercase tracking-widest mb-2">{item.name}</h4>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                     <span className="bg-white/10 border border-white/5 px-2 py-1 rounded font-bold text-gray-300">Format: {item.size || "Standard Target"}</span>
                                     <span className="bg-white/10 border border-white/5 px-2 py-1 rounded font-bold text-gray-300">Total Copies: x{item.quantity}</span>
                                     <span className="bg-white/10 border border-white/5 px-2 py-1 rounded font-bold text-gray-300">Price Subtotal: ₹{item.price * item.quantity}</span>
                                     {item.finish && (
                                        <span className="bg-emerald-500/20 border border-emerald-500/50 px-2 py-1 rounded font-black text-emerald-400">Spec: {item.finish}</span>
                                     )}
                                  </div>
                               </div>

                               <div className="mt-6 flex flex-wrap gap-3">
                                  <button onClick={() => handleDownloadOriginal(item.image, order.id, item.name)} className="bg-white text-black hover:bg-emerald-400 px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_5px_15px_rgba(16,185,129,0.3)] w-full sm:w-auto">
                                     <Download className="w-4 h-4" /> Download True Source (HD)
                                  </button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             );
           })}
          </div>
        </div>
        ))}
      </div>
      )}
    </div>
  );
}
