"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle2, Navigation, Map, MapPin, Star, Camera, Settings, LogOut, Save, User, Edit3, Heart, CreditCard, Clock, Shield, Lock, Image, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/components/OrderProvider";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { orders } = useOrders();
  const { user, profile, isLoading, signOut, uploadAvatar, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState("details"); // orders, details
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Sync edit states
  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditPhone(profile.phone_number || "");
      setEditAddress(profile.address || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);
  
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [reviewRatings, setReviewRatings] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewStatus("submitting");
    setTimeout(() => {
      setReviewStatus("success");
      setTimeout(() => {
         setReviewStatus("idle");
         setReviewOrder(null);
      }, 2000);
    }, 1500);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateProfile({
        full_name: editName,
        phone_number: editPhone,
        address: editAddress
      });
      alert("Profile settings saved successfully!");
    } catch(e) {
      alert("Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(p => p < 90 ? p + Math.random() * 15 : p);
    }, 150);

    try {
      const base64: string = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
           const img = new window.Image();
           img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              
              const MAX_SIZE = 256;
              let width = img.width;
              let height = img.height;
              
              if (width > height) {
                  if (width > MAX_SIZE) {
                      height *= MAX_SIZE / width;
                      width = MAX_SIZE;
                  }
              } else {
                  if (height > MAX_SIZE) {
                      width *= MAX_SIZE / height;
                      height = MAX_SIZE;
                  }
              }
              
              canvas.width = width;
              canvas.height = height;
              ctx?.drawImage(img, 0, 0, width, height);
              
              // Compress to highly optimized JPEG Base64
              resolve(canvas.toDataURL("image/jpeg", 0.7));
           };
           img.onerror = reject;
           img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await updateProfile({ avatar_url: base64 });
      setUploadProgress(100);
      
      setTimeout(() => setIsUploading(false), 500);
    } catch (err: any) {
      console.error("Upload crash:", err);
      alert("Error: " + (err.message || JSON.stringify(err)));
      setIsUploading(false);
    } finally {
      clearInterval(interval);
    }
  };

  if (isLoading || !user) {
    return (
       <div className="min-h-screen bg-black flex items-center justify-center">
         <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:py-20 relative">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* SIDEBAR: Profile Metrics & Navigation */}
          <div className="w-full md:w-80 shrink-0 space-y-6">
             {/* Profile Card Professional */}
             <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
                
                <div className="relative">
                   <div className="w-32 h-32 mx-auto bg-black border-4 border-white/5 rounded-full flex items-center justify-center font-outfit font-black text-4xl uppercase mb-6 shadow-2xl overflow-hidden relative">
                     {profile?.avatar_url ? (
                       <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                       <User className="w-12 h-12 text-gray-500" />
                     )}
                   </div>
                   
                   {/* Verified Badge */}
                   <div className="absolute bottom-4 right-1/2 translate-x-12 translate-y-2 bg-emerald-500 rounded-full p-1.5 border-4 border-zinc-900 shadow-lg" title="Identity Verified">
                     <CheckCircle2 className="w-4 h-4 text-black" />
                   </div>
                </div>
                
                {isUploading && (
                   <div className="w-full mt-2 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Network Sync</span>
                        <span className="text-[10px] text-emerald-400 font-black tracking-widest">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5 relative">
                         <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300" style={{ width: `${Math.min(uploadProgress, 100)}%` }}>
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                         </div>
                      </div>
                   </div>
                )}
                
                <h2 className="text-xl font-outfit font-black uppercase tracking-widest leading-none mb-1 mt-2">{profile?.full_name || "Guest Patron"}</h2>
                <div className="flex items-center gap-2 mt-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{user?.email}</p>
                </div>
             </div>

             {/* Navigation Nav */}
             <div className="bg-zinc-900 border border-white/10 rounded-3xl p-4 space-y-2">
                <button 
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Package className="w-5 h-5" /> Order History
                </button>
                <button 
                  onClick={() => router.push('/wishlist')}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Heart className="w-5 h-5" /> Saved Wishlist
                </button>
                <button 
                  onClick={() => setActiveTab("details")}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'details' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <User className="w-5 h-5" /> Account Details
                </button>
                
                <div className="pt-4 mt-4 border-t border-white/10">
                   <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                     Sign Out
                   </button>
                </div>
             </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 w-full relative">
             
             {/* Tab 1: Orders */}
             {activeTab === "orders" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8">
                     <h2 className="text-3xl font-outfit font-black uppercase flex items-center gap-3">
                       <Package className="w-8 h-8 text-emerald-500" /> Order History
                     </h2>
                     <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest font-semibold flex items-center gap-2">
                       Everything you've bought, sitting in one place.
                     </p>
                  </div>

                  <div className="space-y-6">
                     {orders.length === 0 ? (
                       <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10 text-center">
                         <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                         <h3 className="font-outfit font-bold uppercase tracking-widest text-lg">No Orders Yet</h3>
                         <p className="text-gray-400 text-sm mt-2 uppercase tracking-wide">You haven't placed any orders. Start building your collection!</p>
                       </div>
                     ) : (
                       orders.map(order => (
                         <div key={order.id} className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 hover:border-white/30 transition-all flex flex-col md:flex-row items-start md:items-center gap-8 shadow-lg">
                            
                            <div className="w-24 h-32 shrink-0 bg-black rounded-xl overflow-hidden shadow-inner border border-white/10 hidden sm:block">
                               <img src={order.items[0]?.image || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-cover" alt="Order Thumbnail" />
                            </div>
  
                            <div className="flex-1 w-full">
                               <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                                 <div>
                                   <h3 className="font-outfit font-black uppercase text-xl md:text-2xl text-white">Order {order.id}</h3>
                                   <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] md:text-sm font-bold mt-1">{order.date} • {order.items.length} Items</p>
                                 </div>
                                 <div className="text-right">
                                   <h4 className="font-outfit font-black text-xl md:text-2xl text-emerald-400">₹{order.total}</h4>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Total Paid</p>
                               </div>
                             </div>
                             
                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <StatusBadge status={order.status} />
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                   <button onClick={(e) => { e.preventDefault(); setExpandedOrder(expandedOrder === order.id ? null : order.id); }} className="flex-1 sm:flex-none justify-center flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors bg-white/5 px-4 py-3 rounded-lg border border-white/10 hover:bg-white/10">
                                     {expandedOrder === order.id ? 'Hide Details' : 'Track Details'} <Truck className="w-4 h-4 ml-1" />
                                   </button>
                                </div>
                             </div>
                             
                             {/* Tracking Timeline Modal/Extension */}
                             {expandedOrder === order.id && (
                                <div className="mt-8 pt-8 border-t border-white/5 w-full animate-in fade-in slide-in-from-top-4 duration-300">
                                   <div className="flex justify-between items-center mb-10">
                                     <h4 className="font-outfit font-bold uppercase tracking-widest text-[11px] text-gray-400">Live Logistics Timeline</h4>
                                     <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded text-[10px] uppercase font-black uppercase tracking-widest">Tracking Active</span>
                                   </div>
                                   
                                   <div className="relative flex justify-between items-start pt-2 w-full px-2 overflow-x-auto hide-scrollbar custom-scroll pb-4 min-w-[500px] md:min-w-0 md:pb-0 md:pt-0">
                                      {/* Background Empty Line */}
                                      <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1 bg-white/10 rounded-full" />
                                      {/* Active Progress Line */}
                                      <div className="absolute left-6 top-5 -translate-y-1/2 h-1 bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                           style={{ 
                                             width: order.status === 'processing' ? '20%' : 
                                                    order.status === 'ready_to_transport' ? '40%' : 
                                                    order.status === 'shipped' ? '60%' : 
                                                    order.status === 'near_city' ? '80%' : 
                                                    order.status === 'delivered' ? '98%' : '0%' 
                                           }} />

                                      {/* Node 1: Placed */}
                                      <div className="relative z-10 flex flex-col items-center gap-2 flex-1 shrink-0 px-1">
                                         <div className="w-8 h-8 rounded-full border-2 bg-black border-emerald-500 text-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                            <CheckCircle2 className="w-4 h-4" />
                                         </div>
                                         <span className="text-[9px] uppercase font-bold tracking-[0.1em] text-white text-center">Order<br/>Taken</span>
                                      </div>
                                      
                                      {/* Node 2: Processing */}
                                      <div className="relative z-10 flex flex-col items-center gap-2 flex-1 shrink-0 px-1">
                                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-black ${['processing','ready_to_transport','shipped','near_city','delivered'].includes(order.status) ? 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/20 text-gray-500'}`}>
                                            <Package className="w-4 h-4" />
                                         </div>
                                         <span className={`text-[9px] uppercase font-bold tracking-[0.1em] text-center ${['processing','ready_to_transport','shipped','near_city','delivered'].includes(order.status) ? 'text-gray-200' : 'text-gray-600'}`}>Patch<br/>Packet</span>
                                      </div>

                                      {/* Node 3: Ready */}
                                      <div className="relative z-10 flex flex-col items-center gap-2 flex-1 shrink-0 px-1">
                                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-black ${['ready_to_transport','shipped','near_city','delivered'].includes(order.status) ? 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/20 text-gray-500'}`}>
                                            <Navigation className="w-4 h-4" />
                                         </div>
                                         <span className={`text-[9px] uppercase font-bold tracking-[0.1em] text-center ${['ready_to_transport','shipped','near_city','delivered'].includes(order.status) ? 'text-gray-200' : 'text-gray-600'}`}>Ready to<br/>Transport</span>
                                      </div>

                                      {/* Node 4: Shipped */}
                                      <div className="relative z-10 flex flex-col items-center gap-2 flex-1 shrink-0 px-1">
                                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-black ${['shipped','near_city','delivered'].includes(order.status) ? 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/20 text-gray-500'}`}>
                                            <Truck className="w-4 h-4" />
                                         </div>
                                         <span className={`text-[9px] uppercase font-bold tracking-[0.1em] text-center ${['shipped','near_city','delivered'].includes(order.status) ? 'text-gray-200' : 'text-gray-600'}`}>Transporting</span>
                                      </div>

                                      {/* Node 5: Near City */}
                                      <div className="relative z-10 flex flex-col items-center gap-2 flex-1 shrink-0 px-1">
                                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-black ${['near_city','delivered'].includes(order.status) ? 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/20 text-gray-500'}`}>
                                            <Map className="w-4 h-4" />
                                         </div>
                                         <span className={`text-[9px] uppercase font-bold tracking-[0.1em] text-center ${['near_city','delivered'].includes(order.status) ? 'text-gray-200' : 'text-gray-600'}`}>Reached<br/>City</span>
                                      </div>

                                      {/* Node 6: Delivered */}
                                      <div className="relative z-10 flex flex-col items-center gap-2 flex-1 shrink-0 px-1">
                                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-black ${order.status === 'delivered' ? 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/20 text-gray-500'}`}>
                                            <MapPin className="w-4 h-4" />
                                         </div>
                                         <span className={`text-[9px] uppercase font-bold tracking-[0.1em] text-center ${order.status === 'delivered' ? 'text-gray-200' : 'text-gray-600'}`}>Delivered</span>
                                      </div>
                                    </div>
                                    
                                    {order.status === 'delivered' && (
                                      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div>
                                          <h4 className="font-outfit font-black uppercase text-emerald-400 text-lg">Leave Verified Feedback</h4>
                                          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Upload a photo of your poster on your wall to help others!</p>
                                        </div>
                                        <button 
                                          onClick={() => setReviewOrder(order)}
                                          className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg"
                                        >
                                          <Camera className="w-4 h-4" /> Share Feedback
                                        </button>
                                      </div>
                                    )}
                                 </div>
                              )}
                          </div>

                       </div>
                       ))
                     )}
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                     <div className="relative z-10">
                       <h3 className="font-outfit font-black uppercase text-2xl text-white mb-2">Need a custom print?</h3>
                       <p className="text-sm text-gray-400 max-w-sm uppercase tracking-widest leading-relaxed">Turn your personal memories into museum-grade 300gsm posters right now.</p>
                     </div>
                     <Link href="/design" className="relative z-10 shrink-0 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1 text-center">
                       Design Custom Poster
                     </Link>
                  </div>
                </div>
             )}

             {/* Feedback Modal */}
             {reviewOrder && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                   <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                      {reviewStatus === "success" ? (
                         <div className="p-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-outfit font-black uppercase tracking-widest text-white mb-2">Review Published!</h3>
                            <p className="text-emerald-400 uppercase tracking-widest text-xs font-bold leading-relaxed mb-8">
                               Thank you! Your verified photo and feedback has been securely linked to the catalog. You earned 50 Reward Points.
                            </p>
                         </div>
                      ) : (
                         <form onSubmit={handleSubmitReview} className="p-8">
                            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
                               <div>
                                 <h3 className="font-outfit font-black uppercase text-xl text-emerald-400">Rate Your Purchase</h3>
                                 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Order {reviewOrder.id} • Verified Buyer</p>
                               </div>
                               <button type="button" onClick={() => setReviewOrder(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5"/></button>
                            </div>
                            
                            <div className="space-y-6">
                               <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scroll">
                                  {reviewOrder?.items?.map((item: any, idx: number) => {
                                     const currentRating = reviewRatings[item.id] || 5;
                                     return (
                                       <div key={`${item.id}-${idx}`} className="bg-black/50 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                         <div className="flex items-center gap-3 w-full sm:w-1/2">
                                            {item.image && <img src={item.image} className="w-10 h-14 object-cover rounded bg-black border border-white/10" />}
                                            <p className="font-bold text-xs uppercase tracking-widest text-white truncate flex-1">{item.name}</p>
                                         </div>
                                         <div className="flex gap-1 shrink-0">
                                            {[1,2,3,4,5].map(star => (
                                              <button 
                                                key={star} type="button" 
                                                onClick={() => setReviewRatings(prev => ({...prev, [item.id]: star}))}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentRating >= star ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-black border-white/10 text-gray-600 hover:border-white/30'}`}
                                              >
                                                <Star className={`w-4 h-4 ${currentRating >= star ? 'fill-emerald-500' : ''}`} />
                                              </button>
                                            ))}
                                         </div>
                                       </div>
                                     );
                                  })}
                               </div>
                               
                               <div>
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Photo Upload (Optional)</label>
                                  <div className="w-full h-32 border-2 border-dashed border-white/20 hover:border-emerald-500 transition-colors bg-black rounded-xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
                                     <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                     <Camera className="w-8 h-8 text-gray-600 group-hover:text-emerald-500 transition-colors mb-2" />
                                     <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Tap to add wall photo</span>
                                  </div>
                               </div>

                               <div>
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Your Feedback</label>
                                  <textarea 
                                    required value={reviewText} onChange={e => setReviewText(e.target.value)}
                                    placeholder="Tell us what you loved about the print quality..."
                                    className="w-full h-32 bg-black border border-white/20 focus:border-emerald-500 rounded-xl p-4 text-white text-sm outline-none resize-none transition-colors"
                                  />
                               </div>
                            </div>

                            <button type="submit" disabled={reviewStatus === "submitting"} className="w-full mt-8 bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                               {reviewStatus === "submitting" ? <span className="animate-pulse">Uploading Review...</span> : "Publish Verified Feedback"}
                            </button>
                         </form>
                      )}
                   </div>
                </div>
             )}

             {/* Tab 2: Account Details */}
             {activeTab === "details" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-zinc-900 border border-white/10 rounded-3xl p-8 md:p-12">
                   <h2 className="text-3xl font-outfit font-black uppercase mb-8 flex items-center gap-3 border-b border-white/10 pb-6">
                     <Settings className="w-8 h-8 text-emerald-500" /> Account Settings
                   </h2>
                   
                   <form className="space-y-8">
                     
                     {/* REALISTIC PHOTO UPLOAD MODULE */}
                     <div className="bg-black/40 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                        <div className="relative group shrink-0 w-32 h-32">
                           <div className="w-full h-full rounded-2xl bg-zinc-950 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500 shadow-xl relative z-10">
                              {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <User className="w-12 h-12 text-gray-600 group-hover:text-emerald-500 transition-colors" />
                              )}
                              
                              <div 
                                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Camera className="w-8 h-8 text-white mb-2" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 text-center leading-tight">Secure<br/>Upload</span>
                              </div>
                           </div>
                           
                           {/* Tech Decals */}
                           <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded flex items-center justify-center z-20 shadow-lg" title="Facial Data Encrypted">
                              <Shield className="w-3.5 h-3.5 text-white" />
                           </div>
                           <div className="absolute -bottom-2 -left-2 w-10 h-4 bg-zinc-800 rounded flex items-center justify-center z-20 shadow-lg text-[7px] font-black tracking-widest text-gray-400 uppercase border border-white/10">
                              ID: {user?.id.substring(0,4)}
                           </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="font-outfit font-black uppercase text-xl text-white flex items-center justify-center md:justify-start gap-2 mb-2">
                            Identity Verification <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </h3>
                          <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            Upload a clear, front-facing image to be securely bound to your global Poster Store ID. Your visual identity unlocks custom framing services and verified community trust.
                          </p>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                             <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5 text-blue-400" /> <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">End-to-End Encrypted</span>
                             </div>
                             <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded flex items-center gap-2">
                                <Image className="w-3.5 h-3.5 text-emerald-400" /> <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">JPEG/PNG Only</span>
                             </div>
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded font-black uppercase tracking-widest text-[9px] transition-colors">
                                Browse Files
                             </button>
                          </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                         <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-3">Full Name</label>
                         <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors uppercase tracking-wider text-sm font-bold" />
                       </div>
                       <div>
                         <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-3">Email Address</label>
                         <input type="email" readOnly className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-gray-500 focus:outline-none transition-colors uppercase tracking-wider text-sm font-bold cursor-not-allowed" defaultValue={user?.email || ""} />
                       </div>
                       <div className="md:col-span-2">
                         <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-3">Phone Number</label>
                         <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors uppercase tracking-wider text-sm font-bold" />
                       </div>
                       <div className="md:col-span-2">
                         <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-3">Shipping Address (For Admin Deliveries)</label>
                         <textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="w-full bg-black border border-white/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors uppercase tracking-wider text-sm font-bold min-h-[100px]" />
                       </div>
                     </div>
                     
                     <div className="pt-4 border-t border-white/10">
                       <button 
                         type="button" 
                         onClick={handleSaveProfile}
                         disabled={isSavingProfile}
                         className={`bg-emerald-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 w-full sm:w-auto ${isSavingProfile ? 'opacity-80 scale-95 cursor-not-allowed' : 'hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}
                       >
                         {isSavingProfile ? <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                         {isSavingProfile ? 'Saving...' : 'Save Account Details'}
                       </button>
                     </div>
                   </form>
                </div>
             )}

          </div>

        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'processing':
       return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-500/20"><Package className="w-4 h-4" /> Processing Frame</span>;
    case 'shipped':
       return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-black uppercase tracking-widest border border-orange-500/20"><Truck className="w-4 h-4" /> Transit Shipped</span>;
    case 'delivered':
       return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20"><CheckCircle2 className="w-4 h-4" /> Order Delivered</span>;
    default:
       return null;
  }
}
