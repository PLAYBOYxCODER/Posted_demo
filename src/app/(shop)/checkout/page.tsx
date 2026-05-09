"use client";
import React, { useState } from "react";
import { ShoppingBag, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useOrders } from "@/components/OrderProvider";
import { useOffers } from "@/components/OffersProvider";
import { useAuth } from "@/components/AuthProvider";
import DeliveryTruckLoader from "@/components/DeliveryTruckLoader";
import SpeedingLoader from "@/components/SpeedingLoader";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { deliveryRates } = useOffers();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<"speeding" | "truck">("speeding");
  const [shippingState, setShippingState] = useState("");
  const { profile } = useAuth();

  const deliveryCharge = deliveryRates[shippingState] || 0;
  const grandTotal = total + deliveryCharge;

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (profile?.is_blocked) {
      alert("SECURITY LOCKOUT: Your account has been permanently restricted from participating in checkout operations. Please contact administration.");
      setIsProcessing(false);
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const fname = formData.get("fname") as string;
    const lname = formData.get("lname") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const pincode = formData.get("pincode") as string;
    const payment = "Custom Order";

    const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;
    
    setTimeout(() => {
      const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now(),
        total: grandTotal,
        status: "pending" as const,
        customerName: `${fname} ${lname}`,
        email: email,
        phone: phone,
        address: fullAddress,
        city: city, // Save city explicitly for receipt
        paymentMethod: payment,
        items: [...items]
      };
      
      addOrder(newOrder);
      clearCart();
      
      // Step 2: Gateway Success -> Truck Delivery Loader
      setProcessingStage("truck");
      
      setTimeout(() => {
         router.push(`/order-success?id=${orderId}`);
      }, 3000);
      
    }, 2500); // Intro Speeding Loader Duration
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 py-8 md:py-20">
      <div className="max-w-6xl mx-auto relative">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-black uppercase mb-6 md:mb-10 flex items-center gap-3 md:gap-4">
          <Lock className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-emerald-500" /> Secure Checkout
        </h1>

        {isProcessing && (
           <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              {processingStage === "speeding" ? (
                 <>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-12 animate-pulse">Securing Order Details...</h2>
                    <SpeedingLoader />
                 </>
              ) : (
                 <>
                    <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-widest mb-12">Order Secured! Preparing Delivery...</h2>
                    <DeliveryTruckLoader />
                 </>
              )}
           </div>
        )}

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Checkout Details Form */}
          <div className="flex-1 space-y-6 md:space-y-8">
            {/* Contact Details */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 md:p-8">
               <h2 className="font-outfit font-bold text-base md:text-lg uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="bg-white text-black w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                  Contact Information
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 <div>
                   <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">First Name</label>
                   <input name="fname" required type="text" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Rahul" />
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">Last Name</label>
                   <input name="lname" required type="text" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Singh" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">Email Address</label>
                   <input name="email" required type="email" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="you@example.com" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">Phone Number</label>
                   <input name="phone" required type="tel" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="+91 99999 99999" />
                 </div>
               </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 md:p-8">
               <h2 className="font-outfit text-base md:text-lg font-bold uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="bg-white text-black w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                  Shipping Address
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 <div className="md:col-span-2">
                   <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">Street Address</label>
                   <input name="address" required type="text" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Building/Flat/Street no." />
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">City</label>
                   <input name="city" required type="text" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="New Delhi" />
                 </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">State</label>
                    <select 
                      name="state" 
                      required 
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="w-full bg-black border border-white/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
                    >
                      <option value="" disabled>Select a State</option>
                      {Object.keys(deliveryRates).sort().map(s => (
                         <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                 <div>
                   <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">Pincode</label>
                   <input name="pincode" required type="text" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="110001" />
                 </div>
               </div>
            </div>

            {/* Payment section removed per client request */}
          </div>

          {/* Checkout Right Summary Panel */}
          <div className="w-full lg:w-[400px] shrink-0">
             <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 md:p-8 sticky top-36">
                <h3 className="font-outfit font-bold uppercase tracking-widest text-lg md:text-xl mb-6 border-b border-white/10 pb-4">Your Order</h3>
                
                {/* Dynamically Rendered Mini Cart Display */}
                <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar mb-6 space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                       <div className="w-16 h-20 bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-white/10">
                         <img src={item.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0 pr-2">
                         <h4 className="font-bold text-xs uppercase tracking-wider truncate">{item.name}</h4>
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Size: {item.size}</p>
                         <p className="text-xs font-bold mt-1 text-emerald-400">₹{item.price} <span className="text-gray-500 font-normal">x {item.quantity}</span></p>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6 text-sm text-gray-400 uppercase tracking-widest border-t border-white/10 pt-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={`font-bold ${deliveryCharge > 0 ? 'text-white' : 'text-emerald-400'}`}>
                       {deliveryCharge > 0 ? `+ ₹${deliveryCharge}` : (total > 0 ? "FREE" : "₹0")}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-emerald-500/30 pt-6 mb-8 bg-emerald-500/5 px-4 pb-4 -mx-4 rounded-b-xl">
                  <span className="font-outfit font-black uppercase tracking-widest text-base md:text-xl">Total</span>
                  <span className="font-outfit font-black text-2xl md:text-3xl text-emerald-400">₹{grandTotal}</span>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing || items.length === 0}
                  className={`w-full py-4 md:py-5 rounded-xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${(isProcessing || items.length === 0) ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1'}`}
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Processing... Do Not Close</span>
                  ) : (
                    <>
                      Place Order
                      <Lock className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="mt-6 flex items-start gap-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-widest">
                    Your details are fully encrypted and secure. By placing your order, you agree to our Terms of Service.
                  </p>
                </div>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
