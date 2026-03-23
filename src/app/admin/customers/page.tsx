"use client";
import React, { useEffect, useState } from "react";
import { User, Mail, Calendar, Search, Trash2, Ban, Eye, X, Package, CreditCard, Box } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import { useOrders } from "@/components/OrderProvider";

export default function CustomersPage() {
  const { orders } = useOrders();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-2">
         <div>
           <h1 className="text-3xl font-outfit font-black uppercase tracking-widest text-white">Customers</h1>
           <p className="text-gray-400 mt-1">Manage customer profiles and historical data</p>
         </div>
         
         <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
           <div className="relative w-full sm:w-auto">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
             <input 
               type="text" 
               placeholder="Search customers..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full sm:w-64 bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner placeholder-gray-500 font-medium" 
             />
           </div>
         </div>
      </div>

      <div className="flex-1 pb-24 overflow-y-auto w-full">
         {loading ? (
             <div className="text-emerald-500 mt-20 text-center uppercase tracking-widest font-black text-sm animate-pulse">Scanning Database...</div>
         ) : filteredCustomers.length === 0 ? (
             <div className="text-gray-500 mt-20 text-center uppercase tracking-widest font-bold text-sm">No Customers Discovered.</div>
         ) : (
            <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl w-full">
               <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[800px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-black/40 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                         <th className="p-4 pl-6">Customer</th>
                         <th className="p-4">Contact Detail</th>
                         <th className="p-4">Registration Date</th>
                         <th className="p-4 text-center">Status</th>
                         <th className="p-4 pr-6 text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {filteredCustomers.map((customer, idx) => (
                         <tr key={customer.id} className="hover:bg-white/5 items-center transition-colors group">
                           <td className="p-4 pl-6 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0 bg-black flex items-center justify-center">
                                  {customer.avatar_url ? (
                                    <img src={customer.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                                <span className="font-outfit font-black uppercase text-white truncate max-w-[150px] sm:max-w-[200px]">
                                  {customer.full_name || "Unknown Identity"}
                                </span>
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="flex flex-col gap-1.5 min-w-0">
                               <div className="flex items-center gap-2 text-xs text-gray-400 font-medium tracking-wide">
                                 <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                 <span className="truncate max-w-[150px] sm:max-w-xs">{customer.email || "No Email"}</span>
                               </div>
                               {customer.auth_provider && (
                                 <span className="text-[9px] uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded self-start inline-flex">
                                   {customer.auth_provider}
                                 </span>
                               )}
                             </div>
                           </td>
                           <td className="p-4 text-xs text-gray-400 uppercase tracking-widest font-medium">
                             {new Date(customer.created_at || Date.now()).toLocaleDateString('en-GB')}
                           </td>
                           <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] uppercase font-black tracking-widest ${customer.is_blocked ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                 {customer.is_blocked ? "Restricted" : "Active"}
                              </span>
                           </td>
                           <td className="p-4 pr-6">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setViewingCustomer(customer)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/30" title="Inspect Profile & Orders">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={async () => {
                                   if (!confirm(customer.is_blocked ? "Unblock this user?" : "Block this user from checking out?")) return;
                                   const targetVal = !customer.is_blocked;
                                   const { error } = await supabase.rpc('admin_block_customer', { target_email: customer.email, block_status: targetVal });
                                   if (!error) {
                                      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, is_blocked: targetVal } : c));
                                   } else {
                                      alert("Block Failed. Did you run the SQL?");
                                   }
                                }} className={`p-2 rounded-lg transition-colors border border-transparent ${customer.is_blocked ? 'bg-red-500/20 text-white border-red-500/50' : 'hover:bg-orange-500/20 text-orange-500 hover:border-orange-500/30'}`} title="Block Access">
                                  <Ban className="w-4 h-4" />
                                </button>
                                <button onClick={async () => {
                                   if (!confirm("Permanently wipe this user from the Entire Database AND Auth network? This cannot be undone!")) return;
                                   const { error } = await supabase.rpc('admin_delete_customer', { target_email: customer.email });
                                   if (!error) {
                                      setCustomers(prev => prev.filter(c => c.id !== customer.id));
                                   } else {
                                      alert("Wipe Failed. Check network.");
                                   }
                                }} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/30" title="Delete Patron">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>

      {/* Customer Full Profile & Orders Modal */}
      {viewingCustomer && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
               
               {/* Modal Header Profile Sync */}
               <div className="p-8 border-b border-white/10 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none z-0" />
                  
                  <button onClick={() => setViewingCustomer(null)} className="absolute top-4 right-4 md:top-6 md:right-6 p-3 md:p-2 bg-zinc-950 md:bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-white md:text-gray-400 transition-all z-50 shadow-2xl cursor-pointer flex items-center justify-center">
                     <X className="w-6 h-6 md:w-5 md:h-5" />
                  </button>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                     <div className="w-24 h-24 rounded-full border-2 border-emerald-500/40 bg-black overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        {viewingCustomer.avatar_url ? (
                           <img src={viewingCustomer.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                           <User className="w-10 h-10 text-gray-600" />
                        )}
                     </div>
                     <div>
                        <h2 className="text-3xl font-outfit font-black uppercase tracking-widest text-white mb-2">{viewingCustomer.full_name || "Unknown Identity"}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                           <span className="flex items-center gap-1.5 bg-black px-3 py-1.5 rounded-full border border-white/10"><Mail className="w-3.5 h-3.5 text-emerald-500" /> {viewingCustomer.email || "No Email"}</span>
                           <span className="flex items-center gap-1.5 bg-black px-3 py-1.5 rounded-full border border-white/10"><Calendar className="w-3.5 h-3.5 text-blue-500" /> Joined {new Date(viewingCustomer.created_at || Date.now()).toLocaleDateString('en-GB')}</span>
                           {viewingCustomer.auth_provider && (
                             <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                {viewingCustomer.auth_provider} Check
                             </span>
                           )}
                        </div>
                        {viewingCustomer.phone_number && (
                           <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                             <span className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 px-3 py-1.5 rounded">
                                Phone: {viewingCustomer.phone_number}
                             </span>
                           </div>
                        )}
                        {viewingCustomer.address && (
                           <div className="mt-2 text-xs font-medium text-gray-500 border border-white/10 bg-black/50 p-3 rounded-lg max-w-sm">
                             <span className="font-bold text-gray-400 uppercase tracking-widest block mb-1">Shipping Address:</span>
                             {viewingCustomer.address}
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Orders Data Mapping */}
               <div className="flex-1 overflow-y-auto p-8 custom-scroll bg-black">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="font-outfit font-black text-xl text-white uppercase flex items-center gap-3">
                        <Package className="w-6 h-6 text-emerald-500" /> Order History Log
                     </h3>
                     
                     {/* Dynamic Stats for this specific customer */}
                     {(() => {
                        const customerOrders = orders.filter(o => o.email?.toLowerCase() === viewingCustomer.email?.toLowerCase());
                        const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
                        return (
                           <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                              <span className="text-gray-500">Total Placed: <span className="text-white ml-1">{customerOrders.length}</span></span>
                              <span className="text-gray-500 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Spend: <span className="text-emerald-400 ml-1 block border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">₹{totalSpent}</span></span>
                           </div>
                        );
                     })()}
                  </div>

                  {(() => {
                     const customerOrders = orders.filter(o => o.email?.toLowerCase() === viewingCustomer.email?.toLowerCase());
                     if (customerOrders.length === 0) {
                        return (
                           <div className="bg-zinc-900 border border-white/5 border-dashed rounded-3xl p-12 text-center flex flex-col items-center">
                              <Box className="w-12 h-12 text-gray-600 mb-4" />
                              <h4 className="font-outfit font-black uppercase text-gray-400 text-lg">No Orders Attached</h4>
                              <p className="text-xs uppercase font-bold tracking-widest text-gray-600 mt-2">This customer has not placed any verified orders yet.</p>
                           </div>
                        );
                     }

                     return (
                        <div className="space-y-4">
                           {customerOrders.map(order => (
                              <div key={order.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group">
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-20 shrink-0 bg-black rounded-lg overflow-hidden border border-white/5 hidden sm:block">
                                       <img src={order.items[0]?.image || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                       <h4 className="font-outfit font-black uppercase text-white text-lg group-hover:text-emerald-400 transition-colors">Order {order.id}</h4>
                                       <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold mt-1">Placed on {order.date} • {order.items.length} items</p>
                                    </div>
                                 </div>
                                 <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                                    <h4 className="font-outfit font-black text-xl text-white">₹{order.total}</h4>
                                    <span className={`px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded border ${order.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                       {order.status.replace(/_/g, ' ')}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     );
                  })()}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
