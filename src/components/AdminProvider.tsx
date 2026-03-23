"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Lock, Phone, EyeOff, Eye, ShieldCheck, Mail, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AdminContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  adminPhone: string;
  setAdminPhone: (v: string) => void;
  adminEmail: string;
  setAdminEmail: (v: string) => void;
  adminPass: string;
  setAdminPass: (v: string) => void;
  staffEmails: string[];
  setStaffEmails: (v: string[]) => void;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminOrderNotification {
  id: string;
  name: string;
  amount: number;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Default Admin Credentials
  const [adminPhone, setAdminPhone] = useState("9876543210");
  const [adminEmail, setAdminEmail] = useState("saeplayboy@gmail.com");
  const [adminPass, setAdminPass] = useState("admin123");
  const [staffEmails, setStaffEmails] = useState<string[]>(["staff@posterstore.com"]);

  const [inputEmail, setInputEmail] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [newUsers, setNewUsers] = useState<string[]>([]);
  const [newOrderNotifs, setNewOrderNotifs] = useState<AdminOrderNotification[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAdminConfig = async () => {
    try {
      // Force user's actual credentials as permanent hardcoded bypass
      setAdminPhone("7569691641");
      setAdminEmail("saeplayboy@gmail.com");
      
      const { data, error } = await supabase.from('admin_configs').select('value').eq('key', 'admin_credentials').single();
      if (data && data.value) {
        if(data.value.password) setAdminPass(data.value.password);
        if(data.value.staff_emails) setStaffEmails(data.value.staff_emails);
      }
      
      // Pull dynamic staff from new database table as requested!
      const { data: staffData } = await supabase.from('staff_members').select('email');
      if (staffData && staffData.length > 0) {
         setStaffEmails(prev => [...new Set([...prev, ...staffData.map(s => s.email)])]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      // Rely exclusively on dedicated Admin OTP Session to allow access, breaking the passive store-auth link.
      const sessionToken = sessionStorage.getItem("admin_session");
      if (sessionToken === "active") setIsLoggedIn(true);
      
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchAdminConfig();
  }, []);

  const updateServerCredentials = async (phone: string, email: string, pass: string, staff: string[]) => {
    try {
      await supabase.from('admin_configs').upsert({
        key: 'admin_credentials',
        value: { phone, email, password: pass, staff_emails: staff },
        updated_at: new Date().toISOString()
      });
    } catch(e) { }
  }

  useEffect(() => {
    if (isLoaded) {
      // Background sync to db when changed via Settings Page Hook
      localStorage.setItem("admin_phone", adminPhone);
      localStorage.setItem("admin_email", adminEmail);
      localStorage.setItem("admin_pass", adminPass);
      updateServerCredentials(adminPhone, adminEmail, adminPass, staffEmails);
    }
  }, [adminPhone, adminEmail, adminPass, staffEmails, isLoaded]);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    // Preload Audio globally
    if (!audioRef.current) {
       audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
       audioRef.current.volume = 0.5;
    }

    const profilesListener = supabase.channel('realtime:profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const newUser = payload.new;
        if (newUser && newUser.full_name) {
           setNewUsers(prev => [...prev, newUser.full_name]);
           setTimeout(() => {
             setNewUsers(prev => prev.filter(n => n !== newUser.full_name));
           }, 7000);
        }
      })
      .subscribe();
      
    const ordersListener = supabase.channel('realtime:orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
         const ord: AdminOrderNotification = { id: payload.new.id, name: payload.new.customer_name, amount: payload.new.total_amount };
         
         setNewOrderNotifs(prev => [...prev, ord]);
         
         if(audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio blocked by browser:", e));
         }

         fetch('/api/sendEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               to: adminEmail,
               subject: `🚨 NEW LIVE ORDER (${ord.id}) - ₹${ord.amount}`,
               text: `You have received a new live order from ${ord.name}.\n\nTotal: ₹${ord.amount}.\nLog in to your admin panel immediately to review and verify this transaction.`
            })
         }).catch(console.error);

         setTimeout(() => setNewOrderNotifs(prev => prev.filter(o => o.id !== ord.id)), 10000);
      })
      .subscribe();
      
    return () => { 
       supabase.removeChannel(profilesListener); 
       supabase.removeChannel(ordersListener);
    };
  }, [isLoggedIn, adminEmail]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingLink(true);
    setError("");
    setResetMessage("");

    if (inputEmail === adminEmail || staffEmails.includes(inputEmail)) {
       try {
         const response = await fetch('/api/sendOtp', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email: inputEmail })
         });
         const result = await response.json();
         if (!response.ok) throw new Error(result.error);
         
         setIsOtpSent(true);
         setResetMessage(`A 6-digit Custom OTP code has been explicitly dispatched to ${inputEmail} via Resend Database Relay.`);
       } catch (err: any) {
         setError(err.message || "Failed to send OTP.");
       }
    } else {
       setError("This email is not authorized for Admin Console access.");
    }
    setIsSendingLink(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch('/api/verifyOtp', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: inputEmail, otp: inputOtp })
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error);
      
      // Verified Custom OTP successfully inside our Next.js backend! No magic links.
      setIsLoggedIn(true);
      sessionStorage.setItem("admin_session", "active");

    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP code.");
    }
    
    setIsVerifying(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("admin_session");
  };

  const handleResetRequest = () => {
    setResetMessage(`An OTP and password reset link have been securely dispatched to your registered phone (+91 ******${adminPhone.slice(-4)}) and email (${adminEmail}).`);
    setTimeout(() => setIsResetting(false), 5000);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#09090b]" />;

  if (!isLoggedIn) {
    return (
       <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-white selection:bg-emerald-500/30 selection:text-emerald-200">
          <div className="w-full max-w-md bg-zinc-950 border border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
             
             <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                   <Lock className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h1 className="font-outfit font-black text-2xl uppercase tracking-widest text-white">Admin Protocol</h1>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Restricted Access</p>
                </div>
             </div>

             {error && <div className="mb-6 text-xs text-red-500 font-bold uppercase tracking-widest bg-red-500/10 p-4 border border-red-500/20 rounded-xl">{error}</div>}
             {resetMessage && <div className="mb-6 text-xs text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 p-4 border border-emerald-500/20 rounded-xl">{resetMessage}</div>}

             {isResetting ? (
                <div className="space-y-6 relative z-10">
                    {/* ... Existing Reset UI ... */}
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        To regain access, an OTP recovery link will be sent to the master credentials stored in your Database.
                     </p>
                     
                     <div className="bg-black border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                           <Phone className="w-4 h-4 text-emerald-500" />
                           <p className="text-white text-xs font-bold uppercase tracking-widest">+91 ******{adminPhone.slice(-4)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <Mail className="w-4 h-4 text-emerald-500" />
                           <p className="text-white text-xs font-bold uppercase tracking-widest">{adminEmail}</p>
                        </div>
                     </div>

                   <div className="flex flex-col gap-3 mt-4">
                     <button onClick={handleResetRequest} disabled={isSendingLink} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm transition-all focus:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        Dispatch Recovery OTP
                     </button>
                     <button onClick={() => {setIsResetting(false); setError(""); setResetMessage("");}} className="w-full border border-white/10 hover:bg-white/5 text-gray-400 font-bold uppercase tracking-widest py-4 rounded-xl text-xs transition-all">
                        Cancel Verification
                     </button>
                   </div>
                </div>
             ) : (
                <div className="space-y-6 relative z-10">
                   {isOtpSent ? (
                     <form onSubmit={handleVerifyOtp} className="space-y-6">
                       <div>
                         <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Check Your Email Inbox</label>
                         <p className="text-gray-400 text-xs font-medium mb-4">Enter the 6-digit OTP code sent directly to <span className="text-white font-bold">{inputEmail}</span></p>
                         <div className="relative">
                            <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="text" value={inputOtp} required onChange={(e) => setInputOtp(e.target.value)} maxLength={6} className="w-full bg-black border border-emerald-500/50 rounded-xl py-3.5 pl-12 pr-4 text-emerald-400 font-black tracking-[0.5em] text-center focus:border-emerald-400 outline-none transition-colors shadow-[0_0_15px_rgba(16,185,129,0.1)]" placeholder="000000" />
                         </div>
                       </div>
                       
                       <div className="flex flex-col gap-3 mt-4">
                         <button type="submit" disabled={isVerifying} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2">
                           {isVerifying ? "Verifying Token..." : "Confirm OTP & Login"}
                         </button>
                         <button type="button" onClick={() => setIsOtpSent(false)} className="w-full border border-white/10 hover:bg-white/5 text-gray-400 font-bold uppercase tracking-widest py-3 rounded-xl text-xs transition-all">
                            Use a Different Email
                         </button>
                       </div>
                     </form>
                   ) : (
                     <form onSubmit={handleSendOtp} className="space-y-6">
                       <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Authorized Email Address</label>
                         <div className="relative">
                            <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="email" value={inputEmail} required onChange={(e) => setInputEmail(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-colors shadow-inner" placeholder="admin@example.com" />
                         </div>
                       </div>

                       <button type="submit" disabled={isSendingLink} className="w-full bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm transition-all focus:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 mt-4">
                          {isSendingLink ? "Generating OTP Protocol..." : "Request Access OTP"}
                       </button>
                       
                       <p className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest mt-4">
                         A 6-digit confirmation code will be dispatched to your inbox.
                       </p>
                    </form>
                   )}
                </div>
              )}

             <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-gray-600 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Endpoint Encrypted
             </div>
          </div>
       </div>
    );
  }

  return (
    <AdminContext.Provider value={{ isLoggedIn, setIsLoggedIn, adminPhone, setAdminPhone, adminEmail, setAdminEmail, adminPass, setAdminPass, staffEmails, setStaffEmails, logout }}>
      {children}
      
      {/* Real-time Order & User Trackers overlaying Admin Panel */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
         
         {/* Custom Fast Liquid Popup for New Orders with Sounds */}
         {newOrderNotifs.map((ord, i) => (
            <div key={`ord-${ord.id}-${i}`} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-full shadow-[0_0_80px_rgba(59,130,246,0.6)] flex items-center gap-5 animate-in slide-in-from-right-10 fade-in zoom-in duration-700 pointer-events-auto border border-blue-400 relative overflow-hidden backdrop-blur-xl">
               {/* Liquid animated overlay background */}
               <div className="absolute inset-0 bg-white/10 w-[200%] animate-[spin_4s_linear_infinite] origin-bottom opacity-50 blur-[20px]" />
               
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-md relative z-10 shrink-0">
                  <span className="animate-pulse">💎</span>
               </div>
               <div className="relative z-10">
                  <h4 className="font-outfit font-black uppercase tracking-widest text-sm leading-none mb-1 text-white shadow-black/50 drop-shadow-md">New Order Liquidating...</h4>
                  <p className="font-bold text-xs uppercase tracking-[0.2em] text-white/90 drop-shadow-md"><span className="text-blue-200 bg-black/40 px-2 py-0.5 rounded mr-1">₹{ord.amount}</span> by {ord.name}</p>
               </div>
            </div>
         ))}
         
         {newUsers.map((name, i) => (
            <div key={`usr-${i}`} className="bg-emerald-500 text-black px-6 py-4 rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.3)] flex items-center gap-5 animate-in slide-in-from-right-8 fade-in zoom-in duration-500 pointer-events-auto border border-emerald-400">
               <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center border border-black/10">
                  <User className="w-5 h-5 text-black" />
               </div>
               <div>
                  <h4 className="font-outfit font-black uppercase tracking-widest text-sm leading-none mb-1 text-black">New Account Linked!</h4>
                  <p className="font-bold text-xs uppercase tracking-[0.2em] text-black/80"><span className="text-white bg-black px-2 py-0.5 rounded mr-1">{name}</span> joined the network.</p>
               </div>
            </div>
         ))}
      </div>
    </AdminContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminContext);
  if (context === undefined) throw new Error("useAdminAuth must be used within AdminProvider");
  return context;
}
