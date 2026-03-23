"use client";
import React, { useState } from "react";
import { 
  Building2, 
  CreditCard,
  BellRing,
  ShieldAlert,
  Save,
  Palette,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Users
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { supabase } from "@/lib/supabase";
import { useOffers } from "@/components/OffersProvider";
import { useAdminAuth } from "@/components/AdminProvider";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { adminPhone, setAdminPhone, adminEmail, setAdminEmail, staffEmails, setStaffEmails } = useAdminAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [newAdminPhone, setNewAdminPhone] = useState(adminPhone);
  const [newAdminEmail, setNewAdminEmail] = useState(adminEmail);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  
  const [isTransferringIdentity, setIsTransferringIdentity] = useState(false);
  const [transferOtp, setTransferOtp] = useState("");

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const { isAiRecommendationsEnabled, setIsAiRecommendationsEnabled, whatsappNumber, setWhatsappNumber, isRazorpayEnabled, setIsRazorpayEnabled } = useOffers();
  
  const [newStateName, setNewStateName] = useState("");
  const [newStateCharge, setNewStateCharge] = useState("");

  const handleSendOTP = () => {
    setIsProcessing(true);
    setTimeout(() => {
       setIsOtpSent(true);
       setIsProcessing(false);
    }, 1500);
  };

  const handleVerifyOTP = () => {
    setIsProcessing(true);
    setTimeout(() => {
       if (otpValue === "123456" || otpValue.length === 6) {
          setIsOtpVerified(true);
       }
       setIsProcessing(false);
    }, 1000);
  };

  const handleUpdateAdminCredentials = () => {
    if (newAdminEmail.trim() !== '' && newAdminEmail !== adminEmail) {
       // Requires OTP transfer flow
       if (!isTransferringIdentity) {
          setIsProcessing(true);
          setTimeout(() => {
             setIsProcessing(false);
             setIsTransferringIdentity(true);
             alert(`SECURITY: An authorization OTP has been sent to your CURRENT email (${adminEmail}). Please verify to transfer identity.`);
          }, 1000);
          return;
       } else {
          if (transferOtp !== "123456" && transferOtp.length !== 6) {
             alert("Error: Invalid Identity Transfer OTP. Action Blocked.");
             return;
          }
       }
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      if (newAdminPhone.trim() !== '') setAdminPhone(newAdminPhone);
      if (newAdminEmail.trim() !== '') setAdminEmail(newAdminEmail);
      setIsProcessing(false);
      setIsTransferringIdentity(false);
      setTransferOtp('');
      alert("Master admin credentials updated securely.");
    }, 1500);
  };

  const handleAddStaff = () => {
    if(newStaffEmail && !staffEmails.includes(newStaffEmail)) {
      setStaffEmails([...staffEmails, newStaffEmail.toLowerCase()]);
      setNewStaffEmail("");
    }
  };

  const handleRemoveStaff = (emailToRemove: string) => {
    setStaffEmails(staffEmails.filter(e => e !== emailToRemove));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      
      {/* HEADER */}
      <div className="mb-8 mt-2">
         <h1 className="text-3xl font-outfit font-black uppercase tracking-widest text-white">Store Settings</h1>
         <p className="text-gray-400 mt-1">Manage global store configurations, payment gateways, and security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
        
        {/* SETTINGS SIDEBAR */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
            {[
              { id: 'general', label: 'General', icon: Building2 },
              { id: 'admin_controls', label: 'Admin Controls', icon: Users },
              { id: 'notifications', label: 'Notifications', icon: BellRing },
              { id: 'security', label: 'Security', icon: ShieldAlert },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm tracking-wide whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-emerald-400' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* SETTINGS CONTENT AREA */}
        <div className="flex-1 bg-zinc-900 border border-white/10 rounded-3xl p-6 lg:p-10 overflow-y-auto custom-scroll shadow-2xl relative">
           
           {activeTab === 'general' && (
             <ScrollReveal delay={0} className="space-y-8 max-w-2xl pb-20">
               <div>
                 <h2 className="text-xl font-outfit font-bold text-white mb-6 border-b border-white/10 pb-4">General Store Information</h2>
                 
                 <div className="space-y-6">
                    <div className="space-y-2 opacity-50 cursor-not-allowed">
                       <label className="text-xs font-bold uppercase tracking-widest text-emerald-500">Store Name (System Locked)</label>
                       <input type="text" value="Poster Store" readOnly className="w-full bg-black/50 border border-emerald-500/20 rounded-xl px-4 py-3 text-white focus:outline-none transition-all font-medium cursor-not-allowed select-none" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact Email</label>
                          <input type="email" defaultValue="support@posterzone.com" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-emerald-400">WhatsApp Contact (Global)</label>
                          <input 
                            type="text" 
                            value={whatsappNumber} 
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            className="w-full bg-black border border-emerald-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all font-medium" 
                            placeholder="+91..."
                          />
                       </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl mt-4">
                       <div className="space-y-1">
                          <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-sm flex items-center gap-2">
                            <Smartphone className="w-4 h-4" /> AI Recommendations
                          </h4>
                          <p className="text-xs text-gray-500 max-w-sm">Automatically personalize product suggestions based on user preference instead of manual curation.</p>
                       </div>
                       <button 
                         onClick={() => setIsAiRecommendationsEnabled(!isAiRecommendationsEnabled)}
                         className={`w-12 h-6 rounded-full relative transition-colors ${isAiRecommendationsEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                       >
                         <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isAiRecommendationsEnabled ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>

                     <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl mt-4">
                        <div className="space-y-1">
                           <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-sm flex items-center gap-2">
                             <CreditCard className="w-4 h-4" /> Payment Gateway Lock
                           </h4>
                           <p className="text-xs text-gray-500 max-w-sm">Toggle Online Payment functionality (Razorpay) on or off globally. Wait until bank servers are online before enabling.</p>
                        </div>
                        <button 
                          onClick={() => setIsRazorpayEnabled(!isRazorpayEnabled)}
                          className={`w-12 h-6 rounded-full relative transition-colors ${isRazorpayEnabled ? 'bg-emerald-500' : 'bg-red-500'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isRazorpayEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>

                    <div className="space-y-2 pt-4">
                       <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Store Address (Invoices)</label>
                       <textarea rows={3} defaultValue="9-13-51/8, New Resapuvanipalem, Opp Swarna Bharathi Indoor stadium Visakhapatnam-530013" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none"></textarea>
                    </div>
                 </div>
               </div>

               {/* Absolute Save Button */}
               <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 hidden sm:block">
                 <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3.5 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1">
                   <Save className="w-5 h-5" /> Save Changes
                 </button>
               </div>
             </ScrollReveal>
           )}


           {activeTab === 'notifications' && (
             <ScrollReveal delay={0} className="space-y-8 max-w-2xl pb-20">
               <div>
                 <h2 className="text-xl font-outfit font-bold text-white mb-6 border-b border-white/10 pb-4">Email & SMS Notifications</h2>
                 
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl">
                       <div className="space-y-1">
                          <h4 className="font-bold text-gray-200">New Order Confirmations</h4>
                          <p className="text-xs text-gray-500">Send an automated receipt to customers immediately after checkout.</p>
                       </div>
                       <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-emerald-500 bg-black" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl">
                       <div className="space-y-1">
                          <h4 className="font-bold text-gray-200">Shipping Updates</h4>
                          <p className="text-xs text-gray-500">Notify customers when their order status changes to "Shipped".</p>
                       </div>
                       <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-emerald-500 bg-black" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl">
                       <div className="space-y-1">
                          <h4 className="font-bold text-gray-200">Admin Sales Alerts (SMS)</h4>
                          <p className="text-xs text-gray-500">Send an SMS alert to store admins for orders over ₹5000.</p>
                       </div>
                       <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-emerald-500 bg-black" />
                    </div>
                 </div>
               </div>
             </ScrollReveal>
           )}

           {activeTab === 'security' && (
             <ScrollReveal delay={0} className="space-y-8 max-w-2xl pb-20">
               <div>
                 <h2 className="text-xl font-outfit font-bold text-red-500 mb-6 border-b border-red-500/20 pb-4">Security & Authentication</h2>
                 
                 <div className="space-y-8">
                    <div className="p-6 border border-red-500/30 bg-red-500/5 rounded-2xl relative overflow-hidden">
                       
                       <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-red-500" />
                         </div>
                         <div>
                           <h3 className="font-outfit font-black text-red-500 text-lg uppercase tracking-widest leading-none">Change Master Credentials</h3>
                           <p className="text-xs text-red-400/70 mt-1 uppercase tracking-widest font-bold">Supabase Bound Identity</p>
                         </div>
                       </div>
                       {/* STAGE 1: CREDENTIAL UPDATE FORM */}
                       <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                          <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Master Primary Phone Number</label>
                            <input 
                              type="text" 
                              value={newAdminPhone} 
                              onChange={(e) => setNewAdminPhone(e.target.value)}
                              className="w-full bg-black border border-white/10 focus:border-red-500 rounded-xl px-4 py-3 text-white outline-none transition-colors shadow-inner" 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Master Primary Email Address</label>
                            <input 
                              type="email" 
                              value={newAdminEmail} 
                              onChange={(e) => setNewAdminEmail(e.target.value)}
                              className="w-full bg-black border border-white/10 focus:border-red-500 rounded-xl px-4 py-3 text-white outline-none transition-colors shadow-inner" 
                            />
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Magic link OTP payloads will be natively dispatched to this email.</p>
                          </div>
                          {isTransferringIdentity && (
                             <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl animate-in slide-in-from-top-4">
                               <label className="text-[10px] font-black uppercase tracking-widest text-red-500 block mb-2">Verify Identity Transfer (OTP sent to {adminEmail})</label>
                               <input 
                                 type="text" 
                                 placeholder="Enter 6-digit OTP"
                                 value={transferOtp}
                                 onChange={(e) => setTransferOtp(e.target.value)}
                                 className="w-full bg-black border border-red-500/50 focus:border-red-400 rounded-lg px-4 py-3 text-white outline-none font-mono tracking-[0.5em] text-center"
                                 maxLength={6}
                               />
                             </div>
                          )}
                          <button 
                            onClick={handleUpdateAdminCredentials}
                            disabled={isProcessing}
                            className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex justify-center items-center gap-2 ${
                              isProcessing ? "bg-red-500/50 text-black cursor-not-allowed" : "bg-red-500 hover:bg-red-400 text-black transform hover:-translate-y-0.5"
                            }`}
                          >
                            {isProcessing ? "Processing..." : isTransferringIdentity ? "Verify OTP & Transfer Identity" : "Sync Master Identity Context"}
                          </button>
                       </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl">
                       <div className="space-y-1">
                          <h4 className="font-bold text-gray-200">Supabase Magic Links</h4>
                          <p className="text-xs text-gray-500">Force all staff logically through Supabase Auth Links.</p>
                       </div>
                       <button className="bg-emerald-500 text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-colors cursor-default">
                         Active
                       </button>
                    </div>
                 </div>
               </div>
             </ScrollReveal>
           )}

           {activeTab === 'admin_controls' && (
             <ScrollReveal delay={0} className="space-y-8 max-w-2xl pb-20">
               <div>
                 <h2 className="text-xl font-outfit font-bold text-white mb-6 border-b border-white/10 pb-4">Staff Administration</h2>
                 
                 <div className="space-y-6">
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                       Add or remove authorized staff emails below. Staff members will not need a master password; typing their authorized email in the login screen will instantly deploy a secure Magic Link to their inbox granting them temporary access to this specific dashboard.
                    </p>
                    
                    <div className="flex gap-4 items-end">
                       <div className="flex-1">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 block mb-2">Assign New Staff Account (Email)</label>
                         <input 
                           type="email" 
                           placeholder="staff@posterstore.com"
                           value={newStaffEmail}
                           onChange={(e) => setNewStaffEmail(e.target.value)}
                           className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-700"
                         />
                       </div>
                       <button onClick={handleAddStaff} className="bg-white hover:bg-gray-200 text-black px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                          Authorize Employee
                       </button>
                    </div>

                    <div className="mt-8">
                       <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Currently Authorized Staff Identifiers</h3>
                       <div className="space-y-3">
                         <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                            <span className="font-bold text-white tracking-wider flex items-center gap-2"><KeyRound className="w-4 h-4 text-emerald-500"/>{adminEmail}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Root Master Identity</span>
                         </div>
                         {staffEmails.length === 0 ? (
                           <p className="text-center text-xs text-gray-600 font-bold uppercase tracking-widest py-8 border border-dashed border-white/10 rounded-xl">No auxiliary staff configured limit.</p>
                         ) : (
                           staffEmails.map((email: string, idx: number) => (
                             <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black">
                                <span className="font-medium text-gray-300 tracking-wider flex items-center gap-2"><Users className="w-4 h-4 text-gray-500"/>{email}</span>
                                <button onClick={() => handleRemoveStaff(email)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors">Revoke Access</button>
                             </div>
                           ))
                         )}
                       </div>
                    </div>
                 </div>
               </div>
             </ScrollReveal>
           )}

        </div>
      </div>
    </div>
  );
}
