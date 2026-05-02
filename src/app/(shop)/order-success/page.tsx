"use client";
import React, { useEffect, useState, Suspense } from "react";
import { CheckCircle2, Download, PackageOpen, ArrowRight, Star, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useOrders } from "@/components/OrderProvider";
import DigitalTicket from "@/components/DigitalTicket";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const { orders } = useOrders();
  const [date, setDate] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Find actual order details
  const actualOrder = orders.find(o => o.id === orderId);

  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    
    // Popup feedback modal after 3 seconds
    const timer = setTimeout(() => {
      setShowFeedback(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API save
    setIsSubmitted(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  const handleDownloadReceipt = () => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Poster Store Receipt - ${orderId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
          body { font-family: 'Outfit', sans-serif; background: #000; display: flex; justify-content: center; padding: 40px; margin: 0; }
          .receipt { background: #fff; width: 100%; max-width: 500px; padding: 40px; border-radius: 20px; box-shadow: 0 20px 50px rgba(16, 185, 129, 0.1); border: 1px solid #e5e7eb; }
          .header { text-align: center; border-bottom: 2px dashed #e4e4e7; padding-bottom: 25px; margin-bottom: 25px; }
          .logo { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0; color: #18181b; line-height: 1; }
          .sub { color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; margin-top: 8px; font-weight: 700; }
          .details { margin-bottom: 30px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .label { color: #71717a; text-transform: uppercase; letter-spacing: 1.5px; font-size: 11px; font-weight: 700; }
          .value { font-weight: 700; color: #18181b; }
          .items { border-top: 2px dashed #e4e4e7; border-bottom: 2px dashed #e4e4e7; padding: 25px 0; margin-bottom: 25px; }
          .item-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
          .item-name { font-weight: 900; font-size: 16px; margin: 0 0 4px 0; text-transform: uppercase; }
          .item-meta { color: #a1a1aa; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
          .totals { margin-bottom: 30px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
          .grand-total { font-size: 26px; font-weight: 900; color: #10b981; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e4e4e7; display: flex; align-items: center; }
          .footer { text-align: center; margin-top: 40px; color: #71717a; }
          .quote { font-style: italic; font-size: 14px; margin-bottom: 25px; line-height: 1.6; color: #52525b; border-left: 3px solid #10b981; padding-left: 15px; text-align: left; }
          .qr { margin-top: 10px; width: 120px; height: 120px; mix-blend-mode: multiply; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1 class="logo">Poster Store</h1>
            <div class="sub">Official Order Receipt</div>
          </div>
          
          <div class="details">
            <div class="row">
              <span class="label">Order ID</span>
              <span class="value">${orderId}</span>
            </div>
            <div class="row">
              <span class="label">Date</span>
              <span class="value">${date}</span>
            </div>
            <div class="row" style="margin-top: 20px;">
              <span class="label">Shipping To</span>
              <span class="value" style="text-align: right;">${actualOrder?.customerName || "Customer Name"}<br/>${actualOrder?.address || "Address"}</span>
            </div>
            <div class="row" style="margin-top: 20px;">
              <span class="label">Payment Type</span>
              <span class="value" style="color: #f59e0b; background: #fef3c7; padding: 4px 10px; border-radius: 6px; font-size: 12px;">${actualOrder?.paymentMethod === 'COD' ? 'Cash on Delivery (Advance Paid)' : 'Razorpay Online'}</span>
            </div>
          </div>

          <div class="items">
            ${actualOrder?.items?.map(item => `
              <div class="item-row">
                <div>
                  <p class="item-name">${item.name} <span style="font-size: 11px; margin-left: 8px;">x${item.quantity}</span></p>
                  <p class="item-meta">Style: Premium Quality Print</p>
                </div>
                <span class="value">₹${item.price * item.quantity}</span>
              </div>
            `).join('') || `
              <div class="item-row"><div><p class="item-name">Pending Items...</p></div><span class="value">₹0</span></div>
            `}
          </div>

          <div class="totals">
            <div class="total-row">
              <span class="label">Subtotal</span>
              <span class="value">₹${actualOrder?.total || 0}</span>
            </div>
            <div class="total-row">
              <span class="label">Shipping</span>
              <span class="value" style="color: #10b981;">FREE</span>
            </div>
            <div class="total-row grand-total">
              <span style="text-transform: uppercase; font-size: 14px; color: #71717a; letter-spacing: 1px;">Amount Due</span>
              <span>₹${actualOrder?.total || 0}</span>
            </div>
          </div>

          <div class="footer">
            <div class="quote">
              "Every empty wall is a blank canvas waiting for your masterpiece. Make it yours."
            </div>
            <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=POSTERSTORE_RECEIPT_${orderId}" alt="QR" />
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-top: 20px; font-weight: 900; color: #18181b;">Thank you for your trust</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Trigger Physical HTML Download instead of Print Window
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PosterStore_Receipt_${orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 max-w-5xl mx-auto">
      {/* Thank You Message */}
      <div className="flex-1 space-y-6 flex flex-col justify-center">
         <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
         </div>
         <h1 className="text-4xl md:text-6xl font-outfit font-black uppercase text-white leading-tight">Order<br/>Confirmed!</h1>
         <p className="text-gray-400 uppercase tracking-widest leading-relaxed">
           Thank you for your purchase. We've received your order and are currently preparing it for dispatch. A confirmation email has been sent to you.
         </p>
         
         <div className="pt-8 flex flex-col sm:flex-row gap-4">
           <Link href="/shop" className="bg-white text-black py-4 px-8 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors inline-flex justify-center items-center gap-2">
             Continue Shopping <ArrowRight className="w-4 h-4" />
           </Link>
         <Link href="/profile" className="border border-white/20 text-white py-4 px-8 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/5 transition-colors inline-flex justify-center items-center gap-2">
             Track Order <PackageOpen className="w-4 h-4" />
           </Link>
         </div>
      </div>

      {/* 3D Digital Receipt Ticket */}
      <div className="w-full md:w-[450px] shrink-0 pt-20 relative z-20">
         <DigitalTicket orderId={orderId} date={date} actualOrder={actualOrder} />
         
         <button onClick={handleDownloadReceipt} className="w-full mt-8 py-4 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black rounded-full font-black uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Digital Receipt
         </button>
      </div>

      {/* Shopping Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
              
              {isSubmitted ? (
                 <div className="p-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
                    <h3 className="text-2xl font-outfit font-black uppercase tracking-widest text-white mb-2">Thank You!</h3>
                    <p className="text-gray-400 uppercase tracking-wide text-xs font-bold leading-relaxed mb-4">
                       Your feedback directly helps us curate better drops.
                    </p>
                 </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="p-8 relative z-10">
                   <div className="flex justify-between items-start mb-6">
                      <h3 className="font-outfit font-black uppercase text-xl text-emerald-400">How was your experience?</h3>
                      <button type="button" onClick={() => setShowFeedback(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
                   </div>
                   
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Rate your shopping journey</p>
                   
                   <div className="flex gap-2 justify-center mb-6">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} type="button" 
                          onClick={() => setFeedbackRating(star)}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${feedbackRating >= star ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 scale-110' : 'bg-black border-white/10 text-gray-600 hover:border-white/30'}`}
                        >
                          <Star className={`w-6 h-6 ${feedbackRating >= star ? 'fill-emerald-500' : ''}`} />
                        </button>
                      ))}
                   </div>
                   
                   <div className="mb-6">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Tell us more (Optional)</label>
                      <textarea 
                        value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                        placeholder="What did you love? What can we improve?"
                        className="w-full h-24 bg-black border border-white/20 focus:border-emerald-500 rounded-xl p-4 text-white text-sm outline-none resize-none transition-colors"
                      />
                   </div>

                   <button type="submit" disabled={feedbackRating === 0} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1">
                      Submit Feedback
                   </button>
                </form>
              )}
           </div>
        </div>
      )}

    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-black px-6 py-12 md:py-20 flex items-center">
       <Suspense fallback={<div className="text-white text-center font-outfit uppercase tracking-widest">Loading Order Details...</div>}>
         <ReceiptContent />
       </Suspense>
    </div>
  );
}
