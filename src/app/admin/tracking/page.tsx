"use client";
import React, { useState } from "react";
import { useOrders } from "@/components/OrderProvider";
import { 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle2, 
  Info,
  PackageOpen,
  Navigation,
  User,
  Phone,
  Mail,
  ShoppingBag,
  Clock,
  Map
} from "lucide-react";
import { useAdminAuth } from "@/components/AdminProvider";

export default function TrackingManagementPage() {
  const { adminEmail, adminPass } = useAdminAuth();
  const { orders, updateOrderStatus } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filter out delivered orders to keep tracking management focused on active shipping
  const activeOrders = orders.filter(o => o.status !== "delivered");
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] gap-6 overflow-hidden animate-in fade-in">
      
      {/* Left List Pane */}
      <div className={`w-full lg:w-1/3 lg:min-w-[300px] border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl flex-col overflow-hidden shadow-2xl h-[60vh] lg:h-full ${selectedOrderId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-5 border-b border-white/10 bg-white/5">
          <h2 className="font-outfit font-black text-xl flex items-center gap-3 uppercase tracking-widest">
            <Navigation className="w-5 h-5 text-emerald-500" /> Active Tracking
          </h2>
          <p className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-wider">{activeOrders.length} Shipments in Progress</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
          {activeOrders.length === 0 ? (
             <div className="text-center p-10 text-gray-500 text-sm font-bold uppercase tracking-widest">No active orders</div>
          ) : (
            activeOrders.map(order => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedOrderId === order.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-outfit font-bold ${selectedOrderId === order.id ? 'text-emerald-400' : 'text-white'}`}>{order.id}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{order.date}</span>
                </div>
                <div className="text-sm text-gray-300 font-medium truncate mb-2">{order.customerName}</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'pending' ? 'bg-orange-500' : 
                    order.status === 'processing' ? 'bg-blue-500' : 
                    order.status === 'ready_to_transport' ? 'bg-indigo-500' : 
                    order.status === 'shipped' ? 'bg-purple-500' :
                    order.status === 'near_city' ? 'bg-pink-500' : 'bg-emerald-500'
                  }`}></div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                    {order.status === 'pending' ? 'Waiting Acceptance' : 
                     order.status === 'processing' ? 'Packaging' : 
                     order.status === 'ready_to_transport' ? 'Ready for Transport' :
                     order.status === 'shipped' ? 'In Transit' :
                     order.status === 'near_city' ? 'Near City' : 'Delivered'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Detailed Pane */}
      <div className={`w-full lg:flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-y-auto custom-scroll relative h-[80vh] lg:h-full ${!selectedOrderId ? 'hidden lg:block' : 'block'}`}>
        {!selectedOrder ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
             <MapPin className="w-16 h-16 mb-6 opacity-20" />
             <h3 className="font-outfit font-black text-2xl uppercase tracking-widest text-center">Select an Order</h3>
             <p className="text-sm uppercase tracking-widest mt-2 font-bold text-center">To manage its tracking & logistics</p>
          </div>
        ) : (
          <div className="p-4 md:p-8 pb-32">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
                <div>
                  <button onClick={() => setSelectedOrderId(null)} className="lg:hidden text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 hover:text-emerald-300 w-fit block bg-emerald-500/10 px-3 py-1 rounded-full">← Back to List</button>
                  <h2 className="font-outfit font-black text-2xl md:text-3xl text-white uppercase tracking-wider mb-2">Logistics: {selectedOrder.id}</h2>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Placed on {selectedOrder.date}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-outfit font-black text-emerald-400">₹{selectedOrder.total}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Total Value</div>
                </div>
             </div>

             {/* Interactive Logistics Timeline Control */}
             <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full"></div>
                
                <h3 className="font-outfit font-bold uppercase tracking-widest text-lg mb-8 text-white flex items-center gap-3">
                  <PackageOpen className="w-6 h-6 text-emerald-500" /> Admin Tracking Controls
                </h3>

                <div className="space-y-6 relative z-10">
                  {/* Step 1: Accept */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${selectedOrder.status !== 'pending' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-transparent border-white/20 text-gray-500'}`}>
                          <Clock className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="font-bold text-white uppercase tracking-widest text-sm">Step 1: Order Taken</h4>
                         <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">Clear payment & approve for printing</p>
                       </div>
                     </div>
                     {selectedOrder.status === 'pending' ? (
                       <button onClick={() => updateOrderStatus(selectedOrder.id, 'processing', { email: adminEmail, password: adminPass })} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95">Accept & Print</button>
                     ) : (
                       <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest px-4">Completed</span>
                     )}
                  </div>

                  {/* Step 2: Pack & Dispatch */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${['ready_to_transport', 'shipped', 'near_city', 'delivered'].includes(selectedOrder.status) ? 'bg-emerald-500 border-emerald-500 text-black' : selectedOrder.status === 'processing' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-transparent border-white/20 text-gray-500'}`}>
                          <Package className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="font-bold text-white uppercase tracking-widest text-sm">Step 2: Patching Packet</h4>
                         <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">Box the items & prepare for pickup</p>
                       </div>
                     </div>
                     {['ready_to_transport', 'shipped', 'near_city', 'delivered'].includes(selectedOrder.status) ? (
                       <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest px-4">Packed</span>
                     ) : selectedOrder.status === 'processing' ? (
                       <button onClick={() => updateOrderStatus(selectedOrder.id, 'ready_to_transport', { email: adminEmail, password: adminPass })} className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95">Mark Ready</button>
                     ) : (
                       <span className="text-gray-600 border border-gray-800 rounded px-4 py-2 text-[10px] font-bold uppercase tracking-widest block opacity-50">Locked</span>
                     )}
                  </div>

                  {/* Step 3: Ready to transport */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${['shipped', 'near_city', 'delivered'].includes(selectedOrder.status) ? 'bg-emerald-500 border-emerald-500 text-black' : selectedOrder.status === 'ready_to_transport' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-transparent border-white/20 text-gray-500'}`}>
                          <Navigation className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="font-bold text-white uppercase tracking-widest text-sm">Step 3: Ready to Transport</h4>
                         <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">Give packet to transportation</p>
                       </div>
                     </div>
                     {['shipped', 'near_city', 'delivered'].includes(selectedOrder.status) ? (
                       <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest px-4">Dispatched</span>
                     ) : selectedOrder.status === 'ready_to_transport' ? (
                       <button onClick={() => updateOrderStatus(selectedOrder.id, 'shipped', { email: adminEmail, password: adminPass })} className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95">Pass to Transport</button>
                     ) : (
                       <span className="text-gray-600 border border-gray-800 rounded px-4 py-2 text-[10px] font-bold uppercase tracking-widest block opacity-50">Locked</span>
                     )}
                  </div>

                  {/* Step 4: Transportation */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${['near_city', 'delivered'].includes(selectedOrder.status) ? 'bg-emerald-500 border-emerald-500 text-black' : selectedOrder.status === 'shipped' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-transparent border-white/20 text-gray-500'}`}>
                          <Truck className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="font-bold text-white uppercase tracking-widest text-sm">Step 4: Transportation</h4>
                         <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">In transit to destination city</p>
                       </div>
                     </div>
                     {['near_city', 'delivered'].includes(selectedOrder.status) ? (
                       <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest px-4">Reached City</span>
                     ) : selectedOrder.status === 'shipped' ? (
                       <button onClick={() => updateOrderStatus(selectedOrder.id, 'near_city', { email: adminEmail, password: adminPass })} className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95">Mark Near City</button>
                     ) : (
                       <span className="text-gray-600 border border-gray-800 rounded px-4 py-2 text-[10px] font-bold uppercase tracking-widest block opacity-50">Locked</span>
                     )}
                  </div>

                  {/* Step 5: Near City / Delivered */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${selectedOrder.status === 'delivered' ? 'bg-emerald-500 border-emerald-500 text-black' : selectedOrder.status === 'near_city' ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-transparent border-white/20 text-gray-500'}`}>
                          <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="font-bold text-white uppercase tracking-widest text-sm">Step 5: Location Reached</h4>
                         <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">Near your city / Delivered status</p>
                       </div>
                     </div>
                     {selectedOrder.status === 'delivered' ? (
                       <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest px-4">Delivered</span>
                     ) : selectedOrder.status === 'near_city' ? (
                       <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered', { email: adminEmail, password: adminPass })} className="bg-pink-500 hover:bg-pink-400 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95">Complete Delivery</button>
                     ) : (
                       <span className="text-gray-600 border border-gray-800 rounded px-4 py-2 text-[10px] font-bold uppercase tracking-widest block opacity-50">Locked</span>
                     )}
                  </div>
                </div>
             </div>

             {/* Deep Dive Information */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Destination Details */}
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-5">
                    <MapPin className="w-40 h-40" />
                  </div>
                  <h3 className="font-outfit font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-3 flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-emerald-500" /> Destination Info
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                       <User className="w-5 h-5 text-gray-500 shrink-0" />
                       <div>
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Customer Name</p>
                         <p className="text-white font-medium">{selectedOrder.customerName}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Mail className="w-5 h-5 text-gray-500 shrink-0" />
                       <div className="min-w-0">
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Email Contact</p>
                         <p className="text-emerald-400 font-medium truncate">{selectedOrder.email}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Phone className="w-5 h-5 text-gray-500 shrink-0" />
                       <div>
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Phone Contact</p>
                         <p className="text-white font-medium">{selectedOrder.phone}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
                       <div>
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Full Shipping Address</p>
                         <p className="text-gray-300 font-medium leading-relaxed">{selectedOrder.address}</p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Package Contents */}
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5">
                    <ShoppingBag className="w-40 h-40" />
                  </div>
                  <h3 className="font-outfit font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-3 flex items-center gap-2 text-sm text-gray-300">
                    <ShoppingBag className="w-4 h-4 text-emerald-500" /> Package Contents
                  </h3>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scroll pr-2 relative z-10">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-black/40 border border-white/5 p-3 rounded-xl">
                        <img src={item.image} className="w-16 h-16 object-cover rounded-lg border border-white/10 shrink-0" alt="Poster" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Size: {item.size}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-emerald-400">₹{item.price}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}
