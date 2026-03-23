"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Calendar, Mail, User, Trash2, MailOpen, Tag } from "lucide-react";

export default function AdminFeedbackPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message permanently?")) return;
    
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete message.");
    }
  };

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-6 mb-8 mt-2">
         <div>
           <h1 className="text-3xl font-outfit font-black uppercase tracking-widest text-white">Guest Feedback</h1>
           <p className="text-gray-400 mt-1">Direct communications, support requests, and custom bulk inquiries.</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 overflow-x-hidden custom-scroll">
         {loading ? (
             <div className="flex items-center justify-center py-20">
               <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
             </div>
         ) : messages.length === 0 ? (
            <div className="border border-white/5 border-dashed rounded-3xl p-16 text-center bg-black/50">
               <MailOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
               <h3 className="text-xl font-outfit font-black uppercase text-gray-400">Inbox is Clear</h3>
               <p className="text-xs uppercase font-bold tracking-widest text-gray-600 mt-2">No new messages or support tickets have triggered.</p>
            </div>
         ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                 <div key={msg.id} className="bg-zinc-900 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 md:p-8 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-4">
                       <div className="flex flex-col gap-2">
                          <h3 className="font-outfit font-bold text-xl text-white flex items-center gap-3">
                             {msg.subject || "General Inquiry"}
                             <span className="text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                                New Request
                             </span>
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                             <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-500" /> {msg.name}</span>
                             <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-500" /> {msg.email}</span>
                             <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-500" /> {new Date(msg.created_at).toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => deleteMessage(msg.id)}
                         className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:bg-red-500/20 rounded-lg shrink-0"
                         title="Archive/Delete Message"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                    
                    <div className="bg-black/50 border border-white/5 rounded-xl p-5 mt-4">
                       <p className="text-sm font-medium leading-relaxed text-gray-300 whitespace-pre-wrap">
                          {msg.message}
                       </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-end">
                       <a href={`mailto:${msg.email}?subject=RE: Poster Store Inquiry - ${msg.subject}`} className="text-xs uppercase font-black tracking-widest text-black bg-white hover:bg-emerald-400 px-6 py-2.5 rounded-lg transition-colors shadow-lg">
                          Respond via Email
                       </a>
                    </div>
                 </div>
              ))}
            </div>
         )}
      </div>
    </div>
  );
}
