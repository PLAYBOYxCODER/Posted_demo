"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Mail, 
  Smartphone, 
  ShoppingBag, 
  Clock, 
  ShieldCheck, 
  Calendar,
  CheckCircle2,
  Package,
  Truck,
  Navigation,
  Map,
  CreditCard
} from "lucide-react";
import { useOrders } from "@/components/OrderProvider";
import ScrollReveal from "@/components/ScrollReveal";

const mockCustomers = [
  { id: "CUS-8921", name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", orders: 12, spent: "₹14,580", joined: "Jan 12, 2026", loginMethod: "Google", status: "Active", location: "Mumbai, MH", address: "Flat 12, Tower C, Horizon Apartments, MG Road, Mumbai 400001" },
  { id: "CUS-8920", name: "Priya Patel", email: "priya.p@gmail.com", phone: "+91 91234 56789", orders: 3, spent: "₹3,197", joined: "Feb 04, 2026", loginMethod: "Email", status: "Active", location: "Ahmedabad, GJ", address: "B-204, Sunrise Residency, Navrangpura, Ahmedabad 380009" },
  { id: "CUS-8919", name: "Amit Kumar", email: "amit.k@mail.com", phone: "Not provided", orders: 1, spent: "₹499", joined: "Mar 16, 2026", loginMethod: "Apple", status: "Inactive", location: "Delhi, DL", address: "H-54, South Extension, Phase 1, New Delhi 110049" },
  { id: "CUS-8918", name: "Sneha Reddy", email: "sneha99@yahoo.com", phone: "+91 99887 76655", orders: 5, spent: "₹8,295", joined: "Nov 22, 2025", loginMethod: "Google", status: "Active", location: "Hyderabad, TS", address: "Villa 32, Palm Meadows, Gachibowli, Hyderabad 500032" },
  { id: "CUS-8917", name: "Vikram Singh", email: "vikram@gmail.com", phone: "+91 98712 34567", orders: 8, spent: "₹9,592", joined: "Aug 14, 2025", loginMethod: "Email", status: "Active", location: "Jaipur, RJ", address: "Plot 15, Adarsh Nagar, Raja Park, Jaipur 302004" },
  { id: "CUS-8916", name: "Neha Gupta", email: "neha.g@outlook.com", phone: "Not provided", orders: 2, spent: "₹1,198", joined: "Mar 10, 2026", loginMethod: "Google", status: "Active", location: "Pune, MH", address: "Flat 401, Sapphire Heights, Kalyani Nagar, Pune 411014" },
  { id: "CUS-8915", name: "Anand Verma", email: "anand.v@gmail.com", phone: "+91 97654 32109", orders: 1, spent: "₹3,196", joined: "Mar 14, 2026", loginMethod: "Email", status: "Banned", location: "Bangalore, KA", address: "No 45, 3rd Cross, Indiranagar, Bangalore 560038" },
];

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { orders } = useOrders();
  
  const customerId = params.id as string;
  let customerProfile = mockCustomers.find(c => c.id === customerId);

  // If this customer isn't in mock data but placed a real order recently, find them dynamically!
  if (!customerProfile) {
     const realOrderMatch = orders.find(o => o.phone === customerId || o.email === customerId || o.id === customerId);
     if (realOrderMatch) {
       customerProfile = {
         id: realOrderMatch.id,
         name: realOrderMatch.customerName,
         email: realOrderMatch.email,
         phone: realOrderMatch.phone,
         orders: 1,
         spent: "₹" + realOrderMatch.total,
         joined: realOrderMatch.date,
         loginMethod: "Guest Checkout",
         status: "Active",
         location: "Global",
         address: realOrderMatch.address
       };
     } else {
       customerProfile = {
           id: customerId, name: "Unknown Customer", email: "Unknown", phone: "Unknown", 
           orders: 0, spent: "₹0", joined: "Unknown", loginMethod: "None", status: "Inactive", location: "Unknown", address: "No address on file" 
       };
     }
  }

  // Find actual verified orders placed by this customer ID/email
  const customerOrders = orders.filter(o => o.email === customerProfile.email || o.phone === customerProfile.phone);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><Clock className="w-3 h-3"/> Pending</span>;
      case 'processing': return <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><Package className="w-3 h-3"/> Patching</span>;
      case 'ready_to_transport': return <span className="flex items-center gap-1 text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><Navigation className="w-3 h-3"/> Ready</span>;
      case 'shipped': return <span className="flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><Truck className="w-3 h-3"/> Transit</span>;
      case 'near_city': return <span className="flex items-center gap-1 text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><Map className="w-3 h-3"/> Near City</span>;
      case 'delivered': return <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3"/> Delivered</span>;
      default: return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 h-full overflow-y-auto custom-scroll">
      
      {/* Header Back Button */}
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-30 py-4 border-b border-white/5">
         <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white hover:text-black transition-colors flex items-center justify-center border border-white/10 group">
           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
         </button>
         <div>
           <h1 className="text-2xl font-outfit font-black uppercase tracking-widest text-white flex items-center gap-3">
             Client Details
             <span className={`text-[10px] px-2 py-1 rounded bg-black border ${customerProfile.status === 'Active' ? 'border-emerald-500/50 text-emerald-400' : customerProfile.status === 'Banned' ? 'border-red-500/50 text-red-500' : 'border-gray-500/50 text-gray-400'}`}>
                {customerProfile.status} Account
             </span>
           </h1>
           <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mt-1">ID: {customerProfile.id}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Identity & Contact Pane */}
         <div className="lg:col-span-1 space-y-8">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full transition-all group-hover:scale-110 group-hover:bg-emerald-500/10"></div>
               
               <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-full bg-black border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                     <span className="font-outfit font-black text-4xl text-white">{customerProfile.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{customerProfile.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4 text-emerald-500" /> Joined {customerProfile.joined}
                    </div>
                  </div>
               </div>

               <div className="space-y-5">
                  <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Email Address</p>
                        <p className="font-medium text-white truncate">{customerProfile.email}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Mobile Contact</p>
                        <p className="font-medium text-white">{customerProfile.phone}</p>
                     </div>
                  </div>

                  <div className="flex items-start gap-4 bg-black/40 border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Primary Shipping Address</p>
                        <p className="font-medium text-gray-300 text-sm leading-relaxed">{customerProfile.address}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Login Security</p>
                        <p className="font-medium text-white">{customerProfile.loginMethod} Auth</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Lifetime Metrics */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center">
                  <CreditCard className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="font-outfit font-black text-2xl text-white">{customerProfile.spent}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Total Lifetime Value</p>
               </div>
               <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-center">
                  <ShoppingBag className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="font-outfit font-black text-2xl text-white">{customerOrders.length > 0 ? customerOrders.length : customerProfile.orders}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mt-1">Total Orders Placed</p>
               </div>
            </div>
         </div>

         {/* Purchase History Pane */}
         <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl h-full flex flex-col">
               <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                  <h3 className="font-outfit font-bold uppercase tracking-widest flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" /> True Purchase History
                  </h3>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{customerOrders.length} Live Global Orders</span>
               </div>
               
               <div className="p-6 flex-1 overflow-y-auto custom-scroll">
                  {customerOrders.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-center p-10">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                           <ShoppingBag className="w-8 h-8 text-gray-600" />
                        </div>
                        <h4 className="text-white font-bold mb-2">No Active Context Orders Found</h4>
                        <p className="text-sm text-gray-500">This user's historical database mock orders are recorded as {customerProfile.orders}, but they haven't placed any live verifiable items through the real storefront context session right now.</p>
                     </div>
                  ) : (
                     <div className="space-y-6">
                        {customerOrders.map((order, idx) => (
                          <ScrollReveal key={order.id} delay={idx * 100}>
                            <div className="border border-white/10 rounded-xl p-5 bg-black/40 hover:border-emerald-500/30 transition-all cursor-pointer group">
                               <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                                  <div>
                                     <div className="flex items-center gap-3 mb-1">
                                        <span className="font-outfit font-bold text-emerald-400 text-lg group-hover:text-emerald-300 transition-colors">{order.id}</span>
                                        {getStatusBadge(order.status)}
                                     </div>
                                     <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">{order.date}</span>
                                  </div>
                                  <div className="text-right">
                                     <span className="font-outfit font-black text-xl text-white">₹{order.total}</span>
                                     <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">{order.items.length} Items</span>
                                  </div>
                               </div>
                               
                               {/* Items Snippet */}
                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {order.items.map((item, itemIdx) => (
                                     <div key={itemIdx} className="flex gap-3 items-center bg-zinc-900 border border-white/5 rounded-lg p-2 hover:border-white/10">
                                        <img src={item.image} className="w-10 h-10 object-cover rounded bg-black shrink-0" alt="Poster"/>
                                        <div className="min-w-0">
                                           <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                           <p className="text-[10px] text-emerald-400 mt-0.5">₹{item.price} <span className="text-gray-500">x{item.quantity}</span></p>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                          </ScrollReveal>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
