"use client";
import React from "react";
import { Sparkles, History, Camera, Quote } from "lucide-react";

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <h1 className="text-4xl md:text-6xl font-outfit font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white mb-6">
             Our Story
           </h1>
           <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">More than just paper. A movement.</p>
        </div>

        {/* Origin Story Section */}
        <div className="mb-32">
           <div className="flex items-center gap-4 mb-10">
              <span className="w-12 h-[1px] bg-emerald-500/50"></span>
              <h2 className="font-outfit font-black text-rose-500 text-lg md:text-xl uppercase tracking-[0.3em]">
                Why did you start this store?
              </h2>
           </div>

           <div className="bg-zinc-900 border border-white/10 p-8 md:p-12 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
              
              <Quote className="w-12 h-12 text-white/5 mb-6" />
              <div className="space-y-6 text-gray-300 font-medium text-lg md:text-xl leading-relaxed">
                 <p className="text-white font-bold">It didn’t start as a business.<br/>It started as a feeling.</p>
                 <p>Late nights. Scrolling. Wanting your room to look like something out of a movie… but everything online felt basic, overpriced, or dead.</p>
                 <p className="italic text-emerald-400">So instead of waiting… I built it.</p>
                 <p>POSTED was created to bring:</p>
                 <ul className="space-y-4 pt-4 uppercase tracking-widest text-sm font-bold text-white">
                    <li className="flex items-center gap-3"><Sparkles className="w-4 h-4 text-emerald-500" /> Cinematic Visuals</li>
                    <li className="flex items-center gap-3"><Sparkles className="w-4 h-4 text-emerald-500" /> Relatable Energy</li>
                    <li className="flex items-center gap-3"><Sparkles className="w-4 h-4 text-emerald-500" /> Real Personality</li>
                 </ul>
                 <p className="pt-6 border-t border-white/10 mt-8 text-sm uppercase tracking-widest text-gray-500 font-bold">
                    This is not a brand made in a boardroom.<br/>This was built from the floor — literally.
                 </p>
              </div>
           </div>
        </div>

        {/* What Makes Us Different Section */}
        <div>
           <div className="flex items-center gap-4 mb-10">
              <span className="w-12 h-[1px] bg-rose-500/50"></span>
              <h2 className="font-outfit font-black text-rose-500 text-lg md:text-xl uppercase tracking-[0.3em]">
                What Makes Us Different?
              </h2>
           </div>

           <div className="space-y-12">
              <div className="text-xl text-gray-400 font-medium leading-relaxed mb-12">
                 Let’s be honest. There are a lot of poster stores. Most of them copy designs, print random stuff, and sell it like it means something. <span className="text-white font-bold border-b border-emerald-500">We don’t do that.</span> POSTED is different because:
              </div>

              {/* Point 1 */}
              <div className="flex gap-6 md:gap-8 items-start relative before:absolute before:left-6 before:top-14 before:bottom-0 before:w-px before:bg-white/10 pb-8 last:before:hidden last:pb-0">
                 <div className="w-12 h-12 shrink-0 bg-black border border-white/20 rounded-xl flex items-center justify-center font-outfit font-black text-xl text-emerald-400 z-10">1</div>
                 <div>
                    <h3 className="font-outfit font-black text-2xl uppercase tracking-widest mb-3 text-white">We think like creators, not sellers</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">Every design is chosen like a shot in a film. If it doesn’t hit emotionally, it doesn’t go up.</p>
                 </div>
              </div>

              {/* Point 2 */}
              <div className="flex gap-6 md:gap-8 items-start relative before:absolute before:left-6 before:top-14 before:bottom-0 before:w-px before:bg-white/10 pb-8 last:before:hidden last:pb-0">
                 <div className="w-12 h-12 shrink-0 bg-black border border-white/20 rounded-xl flex items-center justify-center font-outfit font-black text-xl text-emerald-400 z-10">2</div>
                 <div>
                    <h3 className="font-outfit font-black text-2xl uppercase tracking-widest mb-3 text-white">We sell curated drops, not clutter</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">No 1000 random products. Only what actually belongs on your wall.</p>
                 </div>
              </div>

              {/* Point 3 */}
              <div className="flex gap-6 md:gap-8 items-start relative before:absolute before:left-6 before:top-14 before:bottom-0 before:w-px before:bg-white/10 pb-8 last:before:hidden last:pb-0">
                 <div className="w-12 h-12 shrink-0 bg-black border border-white/20 rounded-xl flex items-center justify-center font-outfit font-black text-xl text-emerald-400 z-10">3</div>
                 <div>
                    <h3 className="font-outfit font-black text-2xl uppercase tracking-widest mb-3 text-white">Built for this generation</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">Late nights. Hustle. Aesthetic rooms. This brand understands the current mindset.</p>
                 </div>
              </div>

              {/* Point 4 */}
              <div className="flex gap-6 md:gap-8 items-start relative before:absolute before:left-6 before:top-14 before:bottom-0 before:w-px before:bg-white/10 pb-8 last:before:hidden last:pb-0">
                 <div className="w-12 h-12 shrink-0 bg-black border border-white/20 rounded-xl flex items-center justify-center font-outfit font-black text-xl text-emerald-400 z-10">4</div>
                 <div>
                    <h3 className="font-outfit font-black text-2xl uppercase tracking-widest mb-3 text-white">We care about space</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">Not just product images. We think: <span className="italic text-emerald-400 font-medium">“Will this look insane on someone’s wall?”</span></p>
                 </div>
              </div>

              {/* Point 5 */}
              <div className="flex gap-6 md:gap-8 items-start relative before:absolute before:left-6 before:top-14 before:bottom-0 before:w-px before:bg-white/10 pb-8 last:before:hidden last:pb-0">
                 <div className="w-12 h-12 shrink-0 bg-black border border-white/20 rounded-xl flex items-center justify-center font-outfit font-black text-xl text-emerald-400 z-10">5</div>
                 <div>
                    <h3 className="font-outfit font-black text-2xl uppercase tracking-widest mb-3 text-white">Personal Touch</h3>
                    <p className="text-gray-400 leading-relaxed text-lg mb-4">This isn’t a faceless store. It’s built by someone who:</p>
                    <ul className="space-y-2 uppercase tracking-wide text-xs font-bold text-gray-500">
                      <li>• Knows the struggle</li>
                      <li>• Is in the grind</li>
                      <li>• Is building alongside you</li>
                    </ul>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
