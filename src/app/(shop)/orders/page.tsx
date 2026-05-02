"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, XCircle, ExternalLink, RefreshCw, Search, Filter, ChevronDown, MapPin, ReceiptText, ChevronLeft, Navigation } from "lucide-react";
import { useOrders } from "@/components/OrderProvider";
import { useAuth } from "@/components/AuthProvider";
import ScrollReveal from "@/components/ScrollReveal";
import Image from "next/image";

type OrderStatus = 'pending' | 'processing' | 'ready_to_transport' | 'shipped' | 'near_city' | 'delivered' | 'cancelled' | 'return_requested' | 'returned';

export default function MyOrdersPage() {
  const { orders, refreshOrders, updateOrderStatus } = useOrders();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [customerEmail, setCustomerEmail] = useState('');
  
  const { profile } = useAuth();
  
  // To handle the client-side hydration for localStorage
  useEffect(() => {
    const email = profile?.email || localStorage.getItem('customer_email') || '';
    setCustomerEmail(email);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [profile]);

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'Order Placed', step: 1 };
      case 'processing':
        return { icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'Processing', step: 1.5 };
      case 'ready_to_transport':
        return { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', text: 'Ready For Dispatch', step: 2 };
      case 'shipped':
        return { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'Shipped', step: 3 };
      case 'near_city':
        return { icon: Navigation, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', text: 'In Destination City', step: 3.5 };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'Delivered', step: 4 };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'Cancelled', step: 0 };
      case 'return_requested':
        return { icon: RefreshCw, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'Return Requested', step: 4 };
      case 'returned':
        return { icon: CheckCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'Returned', step: 4 };
      default:
        return { icon: Package, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: status, step: 0 };
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const handleCustomerCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
    try {
      await updateOrderStatus(orderId, 'cancelled');
      alert("Order cancelled successfully.");
    } catch(err) {
      alert("Failed to cancel order.");
    }
  };

  const handleCustomerReturn = async (orderId: string) => {
    if (!confirm("Are you sure you want to initiate a return?")) return;
    try {
      await updateOrderStatus(orderId, 'return_requested');
      alert("Return request submitted successfully. Our team will contact you soon.");
    } catch(err) {
      alert("Failed to submit return request.");
    }
  };

  const isReturnable = (deliveredAtStr?: string, statusHistory?: any[]) => {
    if (!deliveredAtStr && !statusHistory) return false;
    let deliveredTime = deliveredAtStr ? new Date(deliveredAtStr) : null;
    
    // In case deliveredAtStr is omitted but we have history logs
    if (!deliveredTime && statusHistory) {
       const deliveredLog = statusHistory.find(s => s.new_status === 'delivered');
       if (deliveredLog) deliveredTime = new Date(deliveredLog.created_at);
    }
    
    if (!deliveredTime) return false;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - deliveredTime.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  const filteredOrders = orders.filter(order => {
    const orderEmail = order.customer_email || order.email;
    const matchesEmail = Boolean(customerEmail && orderEmail && orderEmail.toLowerCase() === customerEmail.toLowerCase());
    
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      (order.order_id || order.id).toLowerCase().includes(term) ||
      (order.items || order.product_details?.items || []).some((item: any) => 
        item.name?.toLowerCase().includes(term)
      );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesEmail && matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-12 flex flex-col items-center justify-center">
         <RefreshCw className="w-10 h-10 animate-spin text-emerald-500 mb-6" />
         <h2 className="text-xl font-outfit font-black tracking-widest uppercase">Fetching Records</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Navigation & Header */}
        <div className="mb-10">
           <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold mb-6">
              <ChevronLeft className="w-4 h-4" /> Back to Store
           </Link>
           <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">Order History</h1>
           <p className="text-gray-400 mt-2 text-lg">Track your shipment status and view past purchases.</p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-zinc-900/50 border border-white/5 p-2 rounded-2xl backdrop-blur-md">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by Order ID or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black transition-all"
              />
           </div>
           
           <div className="flex gap-2 shrink-0 pb-2 md:pb-0">
              <button
                onClick={refreshOrders}
                className="px-6 py-3 rounded-xl bg-black/50 text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center shrink-0 border border-white/10 w-full md:w-auto"
                title="Refresh Orders"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </button>
           </div>
        </div>

        {/* Order Feed */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/20 border border-white/5 rounded-3xl">
             <Package className="w-16 h-16 text-gray-700 mx-auto mb-6" />
             <h3 className="text-2xl font-outfit font-black text-gray-400 uppercase tracking-widest mb-2">No Records Found</h3>
             <p className="text-gray-600 max-w-sm mx-auto">We couldn't find any orders matching your criteria. Double check the email associated with your checkout.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, i) => {
              const config = getStatusConfig(order.status);
              const isExpanded = expandedOrders.has(order.order_id || order.id);
              const items = order.items || order.product_details?.items || [];
              const Icon = config.icon;

              return (
                <ScrollReveal key={order.order_id || order.id} delay={i * 50}>
                  <div className={`group bg-zinc-900/80 backdrop-blur-sm border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-white/20 rounded-3xl shadow-2xl relative z-10' : 'border-white/5 rounded-2xl hover:border-white/15'}`}>
                    
                    {/* Collapsed Header Bar */}
                    <div 
                       className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 relative bg-gradient-to-r from-transparent via-transparent to-white/[0.02]"
                       onClick={() => toggleOrderExpansion(order.order_id || order.id)}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${config.bg} ${config.color} ${config.border}`}>
                             <Icon className="w-6 h-6" />
                          </div>
                          <div>
                             <h3 className="text-xl font-outfit font-black uppercase text-white tracking-widest">{formatDate(order.created_at || order.timestamp)}</h3>
                             <p className="text-sm text-gray-500 font-medium tracking-wide mt-0.5">{order.order_id || `ORD-${(order.id || '').slice(0,6).toUpperCase()}`}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pl-16 md:pl-0">
                          <div className="flex flex-col items-start md:items-end">
                             <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                                {config.text}
                             </div>
                             <div className="font-outfit text-xs text-gray-400 mt-1.5 uppercase font-bold tracking-wider md:text-right">
                                {['delivered', 'cancelled', 'returned', 'return_requested'].includes(order.status) 
                                   ? `Total: ₹${order.total || order.product_details?.total || 0}` 
                                   : `Expected: ${formatDate(new Date(new Date(order.created_at || order.timestamp || Date.now()).getTime() + 7*24*60*60*1000).toISOString())}`}
                             </div>
                          </div>
                          <div className={`w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/10 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white text-black' : 'text-gray-400 group-hover:text-white'}`}>
                             <ChevronDown className="w-5 h-5" />
                          </div>
                       </div>
                    </div>

                    {/* Progress Bar (Hidden if cancelled) */}
                    {order.status !== 'cancelled' && (
                       <div className="px-6 pb-4">
                         <div className="h-1.5 w-full bg-black rounded-full overflow-hidden flex items-center relative">
                            {/* Filled Track */}
                            <div 
                               className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${config.bg.replace('/10','')} opacity-50`} 
                               style={{ width: `${(config.step / 4) * 100}%` }}
                            />
                            {/* Progress Dots */}
                            {[1,2,3,4].map((stepLoc) => (
                               <div key={stepLoc} className="flex-1 flex justify-end">
                                  <div className={`w-1.5 h-1.5 rounded-full z-10 mr-1 ${stepLoc <= config.step ? 'bg-white' : 'bg-gray-800'}`} />
                               </div>
                            ))}
                         </div>
                       </div>
                    )}

                    {/* Expanded Content Area */}
                    <div className={`grid grid-rows-1 transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] border-t border-white/5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-black/50">
                           
                           {/* Left Col: Order Items */}
                           <div>
                              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                                <ReceiptText className="w-4 h-4" /> Purchased Items
                              </h4>
                              <div className="space-y-3">
                                {items.map((item: any, idx: number) => (
                                   <div key={idx} className="flex gap-4 p-3 rounded-xl bg-zinc-900 border border-white/5">
                                      {item.image ? (
                                        <div className="w-16 h-16 rounded-lg bg-black shrink-0 relative overflow-hidden border border-white/10">
                                            {/* In a real app we'd use Next Image, using plain img here for dynamic compatibility */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                                        </div>
                                      ) : (
                                        <div className="w-16 h-16 rounded-lg bg-zinc-800 shrink-0 border border-white/10 flex items-center justify-center">
                                           <Package className="w-6 h-6 text-gray-500" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0 py-1">
                                         <p className="font-bold text-sm text-gray-200 truncate">{item.name}</p>
                                         <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{item.size || 'Standard'}</p>
                                         <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs font-bold text-gray-400">QTY: {item.quantity}</span>
                                            <span className="font-outfit font-bold text-emerald-400">₹{item.price * item.quantity}</span>
                                         </div>
                                      </div>
                                   </div>
                                ))}
                              </div>
                           </div>

                           {/* Right Col: Tracking & Timeline */}
                           <div className="space-y-6">
                              
                              {/* Address */}
                              <div>
                                 <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                                   <MapPin className="w-4 h-4" /> Destination
                                 </h4>
                                 <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 text-sm">
                                    <p className="font-bold text-white mb-1">{order.customerName || order.customer_name || 'Customer'}</p>
                                    <p className="text-gray-400 leading-relaxed">
                                       {order.address || (typeof order.shipping_address === 'string' 
                                          ? order.shipping_address 
                                          : `${order.shipping_address?.street || ''}, ${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} ${order.shipping_address?.postal_code || ''}`
                                       )}
                                    </p>
                                    <p className="text-gray-500 mt-2">{order.phone || order.customer_phone}</p>
                                 </div>
                              </div>

                              {/* Live Timeline Tracker */}
                              <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                                 <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 ml-1">Timeline</h4>
                                 <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                                    {order.order_status_history?.map((event: any, idx: number) => {
                                      const isLast = idx === 0; // Assuming newest first
                                      return (
                                       <div key={idx} className="relative">
                                          <div className={`absolute -left-[29px] top-1 w-[10px] h-[10px] rounded-full ring-4 ring-zinc-900 ${isLast ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-gray-600'}`} />
                                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                                             <p className={`text-sm font-bold uppercase tracking-wider ${isLast ? 'text-white' : 'text-gray-400'}`}>{event.new_status}</p>
                                             <span className="text-xs text-gray-600">{formatDate(event.created_at)} at {formatTime(event.created_at)}</span>
                                          </div>
                                          {event.notes && (
                                            <p className="text-xs text-gray-500 mt-1">{event.notes}</p>
                                          )}
                                       </div>
                                      )
                                    })}
                                    
                                    {/* Fallback Timeline if history is empty */}
                                    {(!order.order_status_history || order.order_status_history.length === 0) && (
                                      <div className="relative">
                                          <div className="absolute -left-[29px] top-1 w-[10px] h-[10px] rounded-full ring-4 ring-zinc-900 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                          <p className="text-sm font-bold uppercase tracking-wider text-white">Order Registered</p>
                                          <span className="text-xs text-gray-600 truncate">{formatDate(order.created_at)}</span>
                                      </div>
                                    )}
                                 </div>
                              </div>

                              {/* Active Actions */}
                              {order.tracking_id && order.status === 'shipped' && (
                                 <a 
                                   href={order.shiprocket_tracking_url || `https://shiprocket.co/tracking/${order.tracking_id}`}
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black uppercase tracking-widest text-sm transition-colors shadow-xl shadow-purple-500/20 mb-3"
                                 >
                                    <ExternalLink className="w-5 h-5" /> Trace Live Shipment
                                 </a>
                              )}
                              
                              {(order.status === 'pending' || order.status === 'processing') && (
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleCustomerCancel(order.id); }}
                                   className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-black uppercase tracking-widest text-sm transition-colors mb-3"
                                 >
                                    <XCircle className="w-5 h-5" /> Cancel Order
                                 </button>
                              )}

                              {order.status === 'delivered' && isReturnable(order.delivered_at || order.updated_at, order.order_status_history) && (
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleCustomerReturn(order.id); }}
                                   className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-black uppercase tracking-widest text-sm transition-colors mb-3"
                                 >
                                    <RefreshCw className="w-5 h-5" /> Return Order (Valid 7 Days)
                                 </button>
                              )}

                              {order.status === 'return_requested' && (
                                 <div className="w-full text-center py-3 rounded-xl bg-zinc-800 border border-white/10 text-orange-400 font-bold uppercase tracking-widest text-xs">
                                     Return Under Review
                                 </div>
                              )}
                           </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
