"use client";
import React, { useState } from "react";
import { Mail, Lock, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signInWithGoogle, user } = useAuth();
  const router = useRouter();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    router.push('/profile');
    return null;
  }

  const handleRequestAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isSignUp) {
       // Returning user standard password login
       try {
         const cleanEmail = email.trim();
         const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: newPassword });
         if (error) throw error;
         router.push('/profile');
       } catch (err: any) {
         setError(err.message || "Invalid email or password.");
       }
       setIsLoading(false);
       return;
    }

    // New user signup flow: Dispatch OTP first
    try {
      const response = await fetch('/api/sendOtp', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setIsOtpSent(true);
    } catch (e: any) {
      setError(e.message || "Could not dispatch confirmation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");
    
    try {
       const response = await fetch('/api/verifyOtp', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, otp: otpToken })
       });
       const result = await response.json();
       if (!response.ok) throw new Error(result.error);
       
       setIsOtpVerified(true);
       setIsOtpSent(false); // Move to stage 3
    } catch (e: any) {
       setError(e.message || "Invalid or expired OTP code.");
    } finally {
       setIsVerifying(false);
    }
  };

  const handleFinalizeSignUp = async (e: React.FormEvent) => {
     e.preventDefault();
     if (newPassword !== confirmPassword) {
        setError("Passwords do not match!");
        return;
     }
     
     setIsLoading(true);
     setError("");
     try {
       const { data, error } = await supabase.auth.signUp({
         email: email.trim(),
         password: newPassword,
         options: { data: { full_name: fullName.trim() } }
       });
       if (error && !error.message.includes('already registered')) throw error;
       
       if (data?.user) {
          await supabase.from('profiles').upsert({ 
             id: data.user.id, 
             full_name: fullName.trim(),
             email: email.trim(),
             auth_provider: 'Secure Email OTP'
          });
       }
       
       setShowSuccessPopup(true);
       setTimeout(() => {
          router.push('/profile');
       }, 2500);
     } catch (err: any) {
       setError(err.message || "Failed to create account.");
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center py-10 md:py-20 px-4 mt-20 md:mt-24">
        <div className="w-full max-w-sm md:max-w-md bg-zinc-950 border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-emerald-500/10 blur-[60px] md:blur-[80px] rounded-full pointer-events-none" />
          
          <div className="mb-6 md:mb-8 relative z-10 text-center">
            <h1 className="font-outfit font-black text-2xl md:text-3xl uppercase tracking-widest text-white mb-2">
              {isSignUp ? "Crafting Integrity" : "Welcome Home"}
            </h1>
            <p className="text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-widest">
              {isSignUp ? "Honesty in every print" : "Your personal gallery awaits"}
            </p>
          </div>

        {error && (
          <div className="mb-6 text-xs text-red-500 font-bold uppercase tracking-widest bg-red-500/10 p-4 border border-red-500/20 rounded-xl">
            {error}
          </div>
        )}

        {isOtpVerified ? (
          <form onSubmit={handleFinalizeSignUp} className="space-y-4 relative z-10">
            <div>
               <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Create Master Password</label>
               <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPassword ? "text" : "password"} value={newPassword} required minLength={6} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black border border-emerald-500/50 rounded-xl py-3.5 pl-12 pr-12 text-white outline-none focus:border-emerald-400 transition-colors shadow-inner" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                     {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                     ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                     )}
                  </button>
               </div>
            </div>
            <div>
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Confirm Password</label>
               <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPassword ? "text" : "password"} value={confirmPassword} required minLength={6} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-red-500 transition-colors shadow-inner" placeholder="••••••••" />
               </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] mt-6">
              {isLoading ? "Finalizing..." : "Complete Account"}
            </button>
          </form>
        ) : isOtpSent ? (
          <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-10">
             <div>
               <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Check Your Email Inbox</label>
               <p className="text-gray-400 text-xs font-medium mb-4">Enter the 6-digit confirmation code just sent to <span className="text-white font-bold">{email}</span></p>
               <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" value={otpToken} required onChange={(e) => setOtpToken(e.target.value)} maxLength={6} className="w-full bg-black border border-emerald-500/50 rounded-xl py-3.5 pl-12 pr-4 text-emerald-400 font-black tracking-[0.5em] text-center focus:border-emerald-400 outline-none transition-colors shadow-[0_0_15px_rgba(16,185,129,0.1)]" placeholder="000000" />
               </div>
             </div>
             
             <div className="mt-4 flex flex-col items-center gap-3">
               <button type="submit" disabled={isVerifying} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2">
                 {isVerifying ? "Verifying..." : "Confirm Code"}
               </button>
               <button type="button" onClick={() => setIsOtpSent(false)} className="w-full border border-white/10 hover:bg-white/5 text-gray-400 font-bold uppercase tracking-widest py-3 rounded-xl text-xs transition-all">
                  Change Account Email
               </button>
               <div className="h-px w-full bg-white/10 my-1" />
               <p className="text-xs text-gray-500">Didn't get the code?</p>
               <button type="button" onClick={signInWithGoogle} className="text-emerald-500 hover:text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors">
                 Try Google Sign Up Instead
               </button>
             </div>
          </form>
        ) : (
          <form onSubmit={handleRequestAuth} className="space-y-4 relative z-10">
            {isSignUp && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-colors" placeholder="John Doe" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-colors shadow-inner" placeholder="hello@example.com" />
              </div>
            </div>

            {!isSignUp && (
              <div>
                 <div className="flex justify-between items-end mb-1 md:mb-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Master Password</label>
                <button type="button" className="text-emerald-500 hover:text-emerald-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-colors mb-0.5">
                  Forgot Password?
                </button>
              </div>
                 <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white focus:border-emerald-500 outline-none transition-colors shadow-inner" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                       {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                       ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                       )}
                    </button>
                 </div>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] mt-6 flex justify-center items-center h-[52px]">
              {isLoading ? "Processing..." : (isSignUp ? "Connect Email" : "Authenticate Login")}
            </button>
            
            <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 px-4">
               {isSignUp ? "We will dispatch a 6-digit confirmation pin to your email." : "Use your password to access your collection securely."}
            </p>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
            <div className="h-px bg-white/10 flex-1" />
            OR DIRECT BYPASS
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <button onClick={signInWithGoogle} className="w-full bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>

          <p className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest mt-4">
            {isSignUp ? "ALREADY HAVE AN ACCOUNT?" : "DON'T HAVE AN ACCOUNT?"}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-emerald-500 hover:text-emerald-400 ml-2 transition-colors">
              {isSignUp ? "LOG IN" : "SIGN UP"}
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" /> Endpoint Encrypted via Supabase Auth
          </div>
        </div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 max-w-xs w-full text-center shadow-[0_20px_60px_rgba(16,185,129,0.4)] animate-in zoom-in-95 duration-500 border border-emerald-300 transform">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-bounce shadow-inner">
              <ShieldCheck className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-sm">Account Secured!</h2>
            <p className="text-emerald-100 font-medium text-sm mb-0">Redirecting to your personal gallery...</p>
          </div>
        </div>
      )}
    </>
  );
}
