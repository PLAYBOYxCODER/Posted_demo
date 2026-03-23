"use client";
import React, { useState } from "react";
import { Mail, MapPin, Phone, Instagram, Send, CheckCircle2 } from "lucide-react";
import { useOffers } from "@/components/OffersProvider";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const { whatsappNumber } = useOffers();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      }]);
      
      if (error) throw error;
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to send transmission. Check network.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <h1 className="text-4xl md:text-6xl font-outfit font-black uppercase tracking-tight text-white mb-4">
             Contact<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700"> Us</span>
           </h1>
           <p className="text-gray-400 max-w-xl mx-auto uppercase tracking-widest text-sm font-bold leading-relaxed">
             Have a question, feedback, or need a custom bulk order? Drop us a line. We reply crazy fast.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
           
           {/* Detailed Information Side */}
           <div className="space-y-12">
              <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                <h3 className="font-outfit font-black text-2xl uppercase tracking-widest mb-8 text-white">Direct Contacts</h3>
                
                <div className="space-y-6 relative z-10">
                   {/* Address */}
                   <div className="flex bg-black p-4 rounded-xl border border-white/5 items-start gap-4 hover:border-emerald-500/30 transition-colors">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                         <MapPin className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm uppercase tracking-widest text-white mb-1">Headquarters</h4>
                         <p className="text-gray-400 text-sm leading-relaxed">
                            9-13-51/8, New Resapuvanipalem,<br/>Opp Swarna Bharathi Indoor Stadium,<br/>Visakhapatnam - 530013, AP, India
                         </p>
                      </div>
                   </div>

                   {/* Phone */}
                   <div className="flex bg-black p-4 rounded-xl border border-white/5 items-center gap-4 hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank')}>
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                         <Phone className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm uppercase tracking-widest text-white mb-1">WhatsApp Fast-line</h4>
                         <p className="text-gray-400 text-sm">{whatsappNumber}</p>
                      </div>
                   </div>

                   {/* Email */}
                   <div className="flex bg-black p-4 rounded-xl border border-white/5 items-center gap-4 hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => window.location.href='mailto:support@posterstore.in'}>
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                         <Mail className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm uppercase tracking-widest text-white mb-1">Email Support</h4>
                         <p className="text-gray-400 text-sm">support@posterstore.in</p>
                      </div>
                   </div>

                   {/* Insta */}
                   <div className="flex bg-black p-4 rounded-xl border border-white/5 items-center gap-4 hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => window.open('https://instagram.com/posterstore', '_blank')}>
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                         <Instagram className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm uppercase tracking-widest text-white mb-1">Instagram</h4>
                         <p className="text-gray-400 text-sm">@posterstore</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Operations Note */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                 <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-2">Visakhapatnam Warehouse Hours</h4>
                 <p className="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                   Mon - Sat: 9:00 AM - 8:00 PM<br/>Sun: Closed<br/><br/>
                   *1-Day delivery is exclusively processed during operational hours for Visakhapatnam region.
                 </p>
              </div>
           </div>

           {/* Modern Contact / Feedback Form */}
           <div>
              <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 lg:p-12 h-full shadow-2xl relative">
                 {isSuccess ? (
                    <div className="absolute inset-0 z-20 bg-zinc-900 rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
                       <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
                       <h3 className="font-outfit font-black text-3xl uppercase tracking-tight text-white mb-4">Message Solidified.</h3>
                       <p className="text-gray-400 text-sm uppercase tracking-widest font-bold leading-relaxed max-w-sm">
                          Your thought has been captured in our unified database. We'll read it shortly.
                       </p>
                    </div>
                 ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
                       <h3 className="font-outfit font-black text-2xl uppercase tracking-widest text-white mb-2">Send a Message</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</label>
                             <input 
                               type="text" required 
                               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                               className="w-full bg-black border border-white/20 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors" 
                               placeholder="Sam Altman"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                             <input 
                               type="email" required 
                               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                               className="w-full bg-black border border-white/20 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors" 
                               placeholder="sam@example.com"
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                          <select 
                             required
                             value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                             className="w-full bg-black border border-white/20 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors appearance-none cursor-pointer"
                          >
                             <option value="" disabled>Select a topic...</option>
                             <option value="Order Tracking">Order Tracking</option>
                             <option value="General Feedback">Store Feedback</option>
                             <option value="Custom Order Request">Custom Poster Request</option>
                             <option value="Business Inquiry">Bulk Order / Business</option>
                          </select>
                       </div>

                       <div className="space-y-2 flex-1 flex flex-col">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message details</label>
                          <textarea 
                             required 
                             value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                             className="w-full flex-1 min-h-[150px] bg-black border border-white/20 focus:border-emerald-500 rounded-xl p-4 text-white text-sm outline-none resize-none transition-colors" 
                             placeholder="How can we help you create a better space?"
                          />
                       </div>

                       <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-white hover:bg-emerald-400 text-black py-4 mt-auto rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                       >
                          {isSubmitting ? "Transmitting..." : <><Send className="w-4 h-4" /> Send Transmission</>}
                       </button>
                    </form>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
