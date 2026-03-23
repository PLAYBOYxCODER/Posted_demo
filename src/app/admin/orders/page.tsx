"use client";
import React, { useState } from "react";
import { 
  User, 
  MapPin, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  FileDown,
  Smartphone,
  Mail,
  Filter,
  Navigation,
  Map
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useOrders } from "@/components/OrderProvider";

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useOrders();
  const [activeStatus, setActiveStatus] = useState("all");
  const [orderType, setOrderType] = useState("all");

  const generateAndDownloadReceipt = (order: any) => {
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${order.id}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; background: #fdfdfd; color: #000; padding: 40px; text-align: center; }
          .receipt-container { max-width: 420px; margin: 0 auto; background: #fff; border: 1px dashed #ccc; padding: 30px; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: 900; margin-bottom: 5px; font-family: sans-serif; letter-spacing: 2px; }
          .store-name { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
          .details { margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 20px; font-size: 14px; line-height: 1.6; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .total { font-size: 22px; font-weight: 900; display: flex; justify-content: space-between; margin-top: 20px; border-top: 2px dashed #000; padding-top: 20px; }
          .footer { text-align: center; margin-top: 40px; font-size: 13px; font-style: italic; color: #555; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo">POSTER STORE</div>
            <div class="store-name">PREMIUM WALL ART</div>
            <div>123 Poster Street, Creative District</div>
            <div>Mumbai, MH 400001, India</div>
            <div>support@posterstore.com</div>
          </div>
          
          <div class="details">
            <div class="row"><span><strong>Order ID:</strong></span> <strong>${order.id}</strong></div>
            <div class="row"><span><strong>Date:</strong></span> <span>${order.date}</span></div>
          </div>

          <div class="details">
            <div style="font-weight: bold; margin-bottom: 10px; text-decoration: underline;">Shipping Details:</div>
            <div>${order.customerName}</div>
            <div>${order.email}</div>
            <div>${order.phone}</div>
          </div>

          <div class="details">
            <div class="row"><span><strong>Description</strong></span> <span><strong>Amount</strong></span></div>
            <div class="row">
              <span>${order.items.length}x Poster Print</span> 
              <span>₹${order.total}</span>
            </div>
          </div>

          <div class="total">
            <span>TOTAL:</span>
            <span>₹${order.total}</span>
          </div>

          <div class="footer">
            Thank you for shopping with Poster Store!<br/>
            We hope you love your new art.
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PosterStore_Receipt_${order.id.replace('#', '')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-2">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-outfit font-black uppercase tracking-widest text-white">Live Orders</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage orders currently in production or transit</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          {/* Order Type Tabs (Custom Priority) */}
          <div className="flex bg-zinc-900 border border-emerald-500/30 rounded-lg overflow-hidden p-1 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
             {['all', 'standard', 'custom'].map((type) => (
                <button 
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-6 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${
                    orderType === type 
                      ? type === 'custom' ? 'bg-emerald-500 text-black shadow-md' : 'bg-white text-black shadow-md' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {type === 'custom' ? '🔥 Customization Orders' : type + ' orders'}
                </button>
             ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-black border border-white/10 rounded-lg overflow-hidden p-1">
               {['all', 'pending', 'processing', 'shipped'].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setActiveStatus(filter)}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${
                      activeStatus === filter ? 'bg-white/20 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {filter}
                  </button>
               ))}
            </div>

            <button className="flex items-center gap-2 bg-black border border-white/10 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition-colors text-white">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* ANIMATED LIST DATA */}
      <div className="flex flex-col mt-4 gap-3">
        {/* Fake Header Row */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-gray-400 uppercase text-xs tracking-widest font-outfit font-bold rounded-t-2xl bg-zinc-900 shadow-sm sticky top-0 z-10 opacity-70">
           <div className="col-span-2">Order ID</div>
           <div className="col-span-3">Customer</div>
           <div className="col-span-2">Status</div>
           <div className="col-span-1">Items</div>
           <div className="col-span-2">Total</div>
           <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Scrollable List Container (Now driven by Parent Layout) */}
        <div className="space-y-3 pb-24 pt-4">
           {orders.length === 0 ? (
             <div className="text-center py-20 text-gray-500 uppercase tracking-widest font-bold">No orders found.</div>
           ) : (
           orders.map((order, index) => {
             if(activeStatus !== 'all' && order.status !== activeStatus) return null;
             return (
               <ScrollReveal key={order.id} delay={index * 50}>
                 <div className="group bg-zinc-900 border border-white/5 hover:border-white/20 rounded-2xl md:rounded-xl p-5 md:p-6 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)] hover:-translate-y-1 relative cursor-pointer">
                    
                    {/* Mobile View Layout (Card based) */}
                    <div className="flex flex-col md:hidden space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="font-outfit font-bold text-lg text-emerald-400">{order.id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center font-bold text-base uppercase shadow-inner text-white flex-shrink-0">
                          {order.customerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-200 text-base truncate">{order.customerName}</div>
                          <div className="text-sm text-gray-500 truncate">{order.email}</div>
                          <div className="text-sm text-gray-400 truncate">{order.phone}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/10 gap-2">
                        <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                generateAndDownloadReceipt(order);
                             }}
                             className="bg-white/5 hover:bg-emerald-500/10 text-gray-300 hover:text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-emerald-500/30 transition-all flex items-center gap-2"
                             title="Download Receipt"
                        >
                             <FileDown className="w-4 h-4" /> Receipt
                        </button>
                        <div className="font-outfit font-bold text-xl text-white">₹{order.total}</div>
                      </div>
                    </div>

                    {/* Desktop View Layout (Grid based) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                         <div className="flex items-center gap-2">
                           <span className="font-outfit font-bold text-emerald-400 text-lg">{order.id}</span>
                         </div>
                         <div className="text-xs text-gray-500 mt-1">{order.date}</div>
                      </div>
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center font-bold text-xs uppercase shadow-inner flex-shrink-0 text-white">
                          {order.customerName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex flex-col gap-1">
                           <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-white truncate grow">{order.customerName}</h3>
                           </div>
                           <div className="flex flex-col gap-1.5 text-sm text-gray-400">
                             <span className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5" />{order.email}</span>
                             <span className="flex items-center gap-1.5 truncate text-gray-300 font-medium"><Smartphone className="w-3.5 h-3.5" />{order.phone}</span>
                           </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="col-span-1 text-sm text-gray-300 font-medium whitespace-nowrap">
                        {order.items?.length || 0} items
                      </div>
                      <div className="col-span-2 font-outfit font-bold text-gray-200 text-xl tracking-tight">
                        ₹{order.total}
                      </div>
                      <div className="col-span-2 flex flex-col items-end justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        
                        <div className="flex items-center justify-between w-full">
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               generateAndDownloadReceipt(order);
                            }}
                            className="bg-white/5 hover:bg-emerald-500/10 text-gray-300 hover:text-emerald-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-emerald-500/30 transition-all flex items-center gap-2"
                            title="Download Official Receipt HTML File"
                          >
                            <FileDown className="w-4 h-4" /> Receipt
                          </button>
                          
                          <div className="flex items-center gap-2">
                            {/* Actions moved to dedicated Tracking page */}
                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest px-2">Use Tracking Panel</span>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
               </ScrollReveal>
             );
           }))}
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-white/10 bg-black/50 flex items-center justify-between text-sm text-gray-400">
           <span>Showing 1 to 7 of 142 entries</span>
           <div className="flex gap-2">
              <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 transition-colors cursor-not-allowed opacity-50">Prev</button>
              <button className="px-3 py-1 bg-white text-black font-bold rounded">1</button>
              <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 transition-colors">2</button>
              <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 transition-colors">3</button>
              <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 transition-colors">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch(status) {
    case 'pending': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest border border-orange-500/20">
          <Clock className="w-3.5 h-3.5" /> Pending
        </span>
      );
    case 'processing': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20">
          <Package className="w-3.5 h-3.5" /> Patching
        </span>
      );
    case 'ready_to_transport': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
          <Navigation className="w-3.5 h-3.5" /> Ready
        </span>
      );
    case 'shipped': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
          <Truck className="w-3.5 h-3.5" /> Transport
        </span>
      );
    case 'near_city': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold uppercase tracking-widest border border-pink-500/20">
          <Map className="w-3.5 h-3.5" /> Near City
        </span>
      );
    case 'delivered': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    default: 
      return null;
  }
}
