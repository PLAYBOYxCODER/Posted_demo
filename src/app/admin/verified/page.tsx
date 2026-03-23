"use client";
import React, { useState } from "react";
import { Plus, Trash2, Camera, X, CheckCircle, Image as ImageIcon } from "lucide-react";
import { useVerifiedPhotos } from "@/components/VerifiedPhotoProvider";

export default function VerifiedPhotosAdmin() {
  const { photos, addPhoto, deletePhoto } = useVerifiedPhotos();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [imageBase64, setImageBase64] = useState("");
  const [alt, setAlt] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return;
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if(!imageBase64 || !text || !name || !alt) {
      return alert("Please fill all fields and upload a user photo.");
    }

    addPhoto({
      id: "VP-" + Date.now().toString(),
      img: imageBase64,
      alt,
      text,
      name
    });

    setImageBase64("");
    setAlt("");
    setText("");
    setName("");
    setIsAddOpen(false);
  };

  return (
    <div className="animate-in fade-in h-full flex flex-col p-4 md:p-8 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
         <div>
           <h1 className="text-3xl md:text-4xl font-outfit font-black uppercase text-white tracking-widest flex items-center gap-3">
              <Camera className="w-8 h-8 text-emerald-400" /> 
              Verified Customer Walls
           </h1>
           <p className="text-gray-400 mt-2">Approve and publish customer photos sent to you. These appear straight on the public Home Page.</p>
         </div>
         <button 
           onClick={() => setIsAddOpen(true)}
           className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-0.5"
         >
            <Plus className="w-5 h-5" /> Add New Photo
         </button>
      </div>

      {/* Grid of Verified Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 custom-scroll pb-24 h-full overflow-y-auto">
         {photos.map(photo => (
            <div key={photo.id} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg group">
               <div className="aspect-square relative overflow-hidden bg-black/50">
                  <img src={photo.img} alt={photo.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                     <button 
                        onClick={() => deletePhoto(photo.id)}
                        className="bg-red-500 hover:bg-red-400 text-white p-3 rounded-full flex items-center justify-center transition-transform transform hover:scale-110 shadow-xl"
                     >
                        <Trash2 className="w-5 h-5" />
                     </button>
                     <span className="text-xs uppercase tracking-widest font-bold mt-4 text-white">Revoke Approval</span>
                  </div>

                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                     <CheckCircle className="w-3 h-3 text-emerald-400" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live on Home</span>
                  </div>
               </div>

               <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-sm uppercase tracking-widest">{photo.name}</h4>
                    <span className="text-[10px] font-mono text-gray-500 border border-gray-700 px-2 py-0.5 rounded">{photo.alt}</span>
                 </div>
                 <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-emerald-500/50 pl-3 py-1 mt-3">"{photo.text}"</p>
               </div>
            </div>
         ))}

         {photos.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl">
               <ImageIcon className="w-16 h-16 text-gray-600 mb-4" />
               <h3 className="text-xl font-bold uppercase text-white tracking-widest">No Verified Photos Yet</h3>
               <p className="text-gray-500 mt-2">Publish your first customer photo submission to the home page!</p>
            </div>
         )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
           <div className="absolute inset-0" onClick={() => setIsAddOpen(false)} />
           <div className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in duration-300">
             
             <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-black uppercase tracking-widest text-emerald-400">Upload Customer Wall</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <div className="p-6 space-y-5 overflow-y-auto custom-scroll max-h-[70vh]">
                
                {/* Photo Upload */}
                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Customer Photo</label>
                   <div className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/5 relative overflow-hidden group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {imageBase64 ? (
                         <img src={imageBase64} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      ) : (
                         <Camera className="w-10 h-10 text-gray-500 mb-2 group-hover:text-emerald-400 transition-colors" />
                      )}
                      <h4 className="font-bold text-white relative z-20 drop-shadow-md bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm shadow-xl">
                         {imageBase64 ? "Change Photo" : "Upload High-Quality Photo"}
                      </h4>
                   </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Customer Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John D." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Product Category/Name</label>
                    <input type="text" value={alt} onChange={e => setAlt(e.target.value)} placeholder="e.g. Marvel Edition A3" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Customer Quote / Caption</label>
                   <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="e.g. This is the centerpiece of my living room! Looks incredible." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
                </div>
             </div>

             <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
                <button onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold uppercase tracking-widest border border-white/20 hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 text-sm font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">Publish to Home</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
