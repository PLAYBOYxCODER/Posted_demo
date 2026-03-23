"use client";
import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck,
  Eye,
  Trash2,
  X,
  CreditCard,
  AlertTriangle,
  ShoppingCart
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useOrders } from "@/components/OrderProvider";

export default function OrderHistoryPage() {
  const { orders: realOrders, deleteOrder } = useOrders();
  
  const [activeStatus, setActiveStatus] = useState("all");
  const [orderType, setOrderType] = useState("all");
  
  // Interactive Popup States
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handleDelete = () => {
    if(orderToDelete) {
      deleteOrder(orderToDelete);
      setOrderToDelete(null);
    }
  };

  const pastOrders = realOrders.filter(o => ['delivered', 'cancelled', 'returned'].includes(o.status));
  const orders = pastOrders;



  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-2">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-outfit font-black uppercase tracking-widest text-white">Order History</h1>
          <p className="text-sm text-gray-400 mt-1">Archived log of delivered, returned, and cancelled orders separated by day.</p>
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
               {['all', 'delivered', 'cancelled', 'returned'].map((filter) => (
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

            <button className="flex items-center gap-2 bg-black border border-white/10 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition-colors">
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
           {orders.map((order, index) => {
             if(activeStatus !== 'all' && order.status !== activeStatus) return null;
             
             // Check if it's a new date to render a date separator header
             const isFirstOfDate = index === 0 || orders[index - 1].date !== order.date;

             return (
               <React.Fragment key={order.id}>
                 {isFirstOfDate && (
                   <ScrollReveal delay={0}>
                     <div className="pt-6 pb-2 pl-2 flex items-center gap-4">
                       <span className="text-white text-lg font-outfit font-black tracking-widest uppercase">{order.date}</span>
                       <div className="flex-1 h-px bg-white/10"></div>
                     </div>
                   </ScrollReveal>
                 )}
                 <ScrollReveal delay={(index % 5) * 50}>
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
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedOrderDetails(order); }} className="bg-white/5 hover:bg-emerald-500/10 text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Details</button>
                          <button onClick={(e) => { e.stopPropagation(); setOrderToDelete(order.id); }} className="bg-white/5 hover:bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Purge</button>
                        </div>
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
                        <div className="min-w-0">
                          <div className="font-bold text-gray-200 text-sm truncate">{order.customerName}</div>
                          <div className="text-xs text-gray-500 truncate">{order.email}</div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="col-span-1 text-sm text-gray-300 font-medium">
                        {order.items?.length || 0} items
                      </div>
                      <div className="col-span-2 font-outfit font-bold text-gray-200 text-xl tracking-tight">
                        ₹{order.total}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedOrderDetails(order); }} className="p-2.5 bg-black/50 hover:bg-white text-gray-300 hover:text-black rounded-xl transition-all shadow-sm z-10 relative" title="View Details">
                           <Eye className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button 
                           onClick={(e) => { e.stopPropagation(); setOrderToDelete(order.id); }}
                           className="p-2.5 bg-black/50 hover:bg-red-500 text-gray-300 hover:text-white rounded-xl transition-all shadow-sm z-10 relative" 
                           title="Delete Order"
                        >
                           <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button className="p-2.5 bg-black/50 hover:bg-white/10 text-gray-300 rounded-xl transition-all shadow-sm z-10 relative">
                           <MoreVertical className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                 </div>
                 </ScrollReveal>
               </React.Fragment>
             );
           })}
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

      {/* --- MODALS --- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300" onClick={() => setSelectedOrderDetails(null)}>
           <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="p-6 md:p-8 flex flex-col">
                 <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
                    <div>
                      <h2 className="text-2xl font-outfit font-black text-emerald-400 uppercase tracking-widest">{selectedOrderDetails.id} Detailed Breakdown</h2>
                      <p className="text-gray-400 text-sm mt-1">{selectedOrderDetails.customerName} • {selectedOrderDetails.date}</p>
                    </div>
                    <button onClick={() => setSelectedOrderDetails(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X className="w-6 h-6" /></button>
                 </div>

                  <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto custom-scroll pr-2">
                    {selectedOrderDetails.items?.map((item: any, idx: number) => (
                     <div key={idx} className="bg-black border border-white/5 rounded-xl p-4 flex gap-4 items-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/10"><ShoppingCart className="w-6 h-6 text-emerald-500" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white uppercase text-sm truncate">{item.name}</p>
                          <p className="text-gray-400 text-xs mt-1 uppercase">₹{item.price} each</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs font-bold uppercase">Qty</p>
                          <p className="font-black text-xl text-emerald-400">x{item.quantity}</p>
                        </div>
                        <div className="text-right w-20">
                          <p className="text-gray-500 text-xs font-bold uppercase">Sub</p>
                          <p className="font-bold text-white uppercase">₹{(item.price * item.quantity)}</p>
                        </div>
                     </div>
                   ))}
                 </div>

                 <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-gray-400 uppercase tracking-widest">Total Valuation</span>
                    <span className="text-3xl font-outfit font-black text-emerald-400">{selectedOrderDetails.total}</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {orderToDelete && (
        <div className="fixed inset-0 bg-red-950/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200" onClick={() => setOrderToDelete(null)}>
           <div className="bg-black border border-red-500/30 rounded-3xl w-full max-w-md p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]" onClick={e => e.stopPropagation()}>
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-outfit font-black text-white uppercase tracking-widest mb-2">Delete Record?</h2>
              <p className="text-gray-400 mb-8">You are about to perfectly purge Order {orderToDelete} from the encrypted archives. This operation cannot be reversed.</p>
              <div className="flex gap-4">
                 <button onClick={() => setOrderToDelete(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase tracking-widest transition-colors">Cancel</button>
                 <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-black rounded-xl font-black uppercase tracking-widest shadow-lg transition-colors">Confirm Purge</button>
              </div>
           </div>
        </div>
      )}

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
          <Package className="w-3.5 h-3.5" /> Processing
        </span>
      );
    case 'shipped': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
          <Truck className="w-3.5 h-3.5" /> Shipped
        </span>
      );
    case 'delivered': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    case 'returned': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest border border-red-500/20">
          <Clock className="w-3.5 h-3.5" /> Returned
        </span>
      );
    case 'cancelled': 
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs font-bold uppercase tracking-widest border border-gray-500/20">
          <MoreVertical className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    default: 
      return null;
  }
}
