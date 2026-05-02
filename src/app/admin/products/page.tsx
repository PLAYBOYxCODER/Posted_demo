"use client";
import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3,
  Trash2,
  Image as ImageIcon,
  X,
  UploadCloud,
  ChevronRight,
  Upload,
  FolderTree,
  AlertTriangle
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useProducts } from "@/components/ProductProvider";

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, deleteCategoryGlobal } = useProducts();
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [isNewSubCategory, setIsNewSubCategory] = useState(false);
  const [actualPrice, setActualPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [imageBase64Array, setImageBase64Array] = useState<string[]>([]);
  
  const actual = parseFloat(actualPrice);
  const selling = parseFloat(sellingPrice);
  const discountPercent = (actual > 0 && selling > 0 && actual > selling) 
    ? Math.round(((actual - selling) / actual) * 100) 
    : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Process files locally to base64 natively
    const promises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Arr => {
      setImageBase64Array(prev => [...prev, ...base64Arr]);
    });
  };

  const handleSaveProduct = async () => {
     if(!name || !category || !actualPrice || !sellingPrice || imageBase64Array.length === 0) {
       alert("Please fill in all details, including selecting at least one image file.");
       return;
     }

     setIsSaving(true);
     setProgress(0);
     
     // Fake progress animation for cool UX during wait
     const interval = setInterval(() => {
        setProgress(p => p < 90 ? p + Math.random() * 15 : p);
     }, 300);

     try {
         if(editingId) {
           await updateProduct(editingId, {
             name,
             category,
             subCategory,
             actualPrice: parseFloat(actualPrice),
             price: parseFloat(sellingPrice),
             images: imageBase64Array
           });
         } else {
           await addProduct({
             name,
             category,
             subCategory,
             actualPrice: parseFloat(actualPrice),
             price: parseFloat(sellingPrice),
             images: imageBase64Array
           });
         }
         
         setProgress(100);
         setTimeout(() => {
             // Reset
             setEditingId(null);
             setName("");
             setCategory("");
             setSubCategory("");
             setActualPrice("");
             setSellingPrice("");
             setImageBase64Array([]);
             setIsAddModalOpen(false);
             setIsSaving(false);
         }, 400);
     } catch (e) {
         console.error(e);
         alert("Failed to save product.");
         setIsSaving(false);
     } finally {
         clearInterval(interval);
     }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-outfit font-black uppercase tracking-widest text-white">Inventory</h1>
          <p className="text-gray-400 mt-1">Manage poster listings, stock levels, and store categories</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsManageCategoriesOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black border border-white/20 hover:border-emerald-500 hover:text-emerald-400 text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-xl"
            >
              <FolderTree className="w-4 h-4" /> Categories
            </button>
            <button 
              onClick={() => {
                setEditingId(null);
                setName("");
                setCategory("");
                setSubCategory("");
                setActualPrice("");
                setSellingPrice("");
                setImageBase64Array([]);
                setIsAddModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="pb-24">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {products.map((product, index) => {
             // Active filter disabled since stock is not tracked.
             
             return (
               <ScrollReveal key={product.id} delay={(index % 4) * 50}>
                 <div className="group bg-zinc-900 border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-500 shadow-xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:-translate-y-2 flex flex-col h-full cursor-pointer relative">
                    
                    {/* Discount Badge */}
                    {product.actualPrice > product.price && (
                       <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-black font-black text-[10px] px-2 py-0.5 rounded shadow-lg uppercase tracking-wider backdrop-blur-md">
                         {Math.round(((product.actualPrice - product.price) / product.actualPrice) * 100)}% OFF
                       </div>
                    )}

                    {/* Image Placeholder / Thumbnail */}
                    <div className="h-48 bg-black/50 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                      <img src={product.images[0] || ""} alt={product.name} className="w-full h-full object-cover" />
                      
                      {/* Removed Status Badge */}

                      {/* Hover Actions overlay */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             setEditingId(product.id);
                             setName(product.name);
                             setCategory(product.category);
                             setSubCategory(product.subCategory || "");
                             setActualPrice(product.actualPrice.toString());
                             setSellingPrice(product.price.toString());
                             setImageBase64Array([...product.images]);
                             setIsAddModalOpen(true);
                          }} 
                          className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-black text-white flex items-center justify-center transition-all transform hover:scale-110" title="Edit Product"
                        >
                           <Edit3 className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 hover:text-white text-white flex items-center justify-center transition-all transform hover:scale-110" title="Delete Product">
                           <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                           {product.category}{product.subCategory ? ` / ${product.subCategory}` : ''}
                        </span>
                        <span className="text-xs font-mono text-gray-600 truncate max-w-[80px]">{product.id}</span>
                      </div>
                      
                      <h3 className="font-outfit font-bold text-lg text-white mb-4 line-clamp-1 group-hover:text-emerald-400 transition-colors">{product.name}</h3>
                      
                      <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-4">
                        <div>
                          <span className="text-xs text-gray-400 block mb-0.5">Images</span>
                          <span className="text-white font-bold text-sm tracking-wider">{product.images?.length || 0} loaded</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block mb-0.5">Price</span>
                          <span className="text-gray-500 line-through text-xs mr-2 relative top-[-2px]">₹{product.actualPrice}</span>
                          <span className="font-outfit font-black text-emerald-400 text-xl">₹{product.price}</span>
                        </div>
                      </div>
                    </div>
                 </div>
               </ScrollReveal>
             );
           })}
         </div>
      </div>

      {/* ADD PRODUCT CENTERED LIQUID GLASS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 backdrop-blur-md bg-black/40">
          
          {/* Backdrop Clicker */}
          <div 
            className="absolute inset-0" 
            onClick={() => setIsAddModalOpen(false)}
          />

          {/* Liquid Glass Theme Panel */}
          <div className="relative w-full h-[100dvh] md:h-auto md:max-h-[85vh] md:max-w-xl bg-white/10 backdrop-blur-3xl border-y md:border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] md:rounded-3xl flex flex-col animate-in zoom-in duration-300 overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/5 sticky top-0 z-20">
               <div>
                 <h2 className="text-2xl font-outfit font-black uppercase tracking-widest text-emerald-400 drop-shadow-md">
                   {editingId ? "Edit Product Engine" : "New Product Engine"}
                 </h2>
                 <p className="text-gray-200 text-sm mt-1 drop-shadow-sm font-medium">Liquid glass secure configuration</p>
               </div>
               <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-transparent hover:border-white/30 drop-shadow-sm">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll relative z-10">
               {/* Form Fields - using glassmorphism inputs */}
               <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Product Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cyberpunk Skyline Poster" className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" />
                  </div>

                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Store Category</label>
                          {isNewCategory ? (
                             <div className="flex gap-2 relative">
                               <input 
                                 type="text" 
                                 value={category} 
                                 onChange={e => setCategory(e.target.value)} 
                                 placeholder="New Category Name" 
                                 className="w-full bg-black/40 border border-emerald-500/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                               />
                               <button onClick={() => { setIsNewCategory(false); setCategory(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                                 <X className="w-4 h-4" />
                               </button>
                             </div>
                          ) : (
                             <select 
                               value={category}
                               onChange={e => {
                                  if (e.target.value === '__NEW__') {
                                     setIsNewCategory(true);
                                     setCategory("");
                                  } else {
                                     setCategory(e.target.value);
                                  }
                               }}
                               className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium backdrop-blur-sm shadow-inner cursor-pointer"
                             >
                               <option value="" disabled>-- Select a Category --</option>
                               {Array.from(new Set<string>(products.map(p => p.category))).map(cat => (
                                 <option key={cat} value={cat}>{cat}</option>
                               ))}
                               <option value="__NEW__" className="text-emerald-400 font-bold bg-zinc-900 border-t border-white/10">+ Create New Category...</option>
                             </select>
                          )}
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Sub-Category (Optional)</label>
                          {isNewSubCategory ? (
                             <div className="flex gap-2 relative">
                               <input 
                                 type="text" 
                                 value={subCategory} 
                                 onChange={e => setSubCategory(e.target.value)} 
                                 placeholder="New Sub-Category" 
                                 className="w-full bg-black/40 border border-emerald-500/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                               />
                               <button onClick={() => { setIsNewSubCategory(false); setSubCategory(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                                 <X className="w-4 h-4" />
                               </button>
                             </div>
                          ) : (
                             <select 
                               value={subCategory}
                               onChange={e => {
                                  if (e.target.value === '__NEW__') {
                                     setIsNewSubCategory(true);
                                     setSubCategory("");
                                  } else {
                                     setSubCategory(e.target.value);
                                  }
                               }}
                               className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-emerald-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium backdrop-blur-sm shadow-inner cursor-pointer disabled:opacity-50"
                               disabled={!category}
                             >
                               <option value="">-- None --</option>
                               {Array.from(new Set(products.filter(p => p.category === category && p.subCategory).map(p => p.subCategory))).map(sub => (
                                 <option key={sub as string} value={sub as string}>{sub as string}</option>
                               ))}
                               <option value="__NEW__" className="text-emerald-400 font-bold bg-zinc-900 border-t border-white/10">+ Create New Sub-Category...</option>
                             </select>
                          )}
                       </div>
                    </div>
                    {/* Removed duplicated pills since we now have interactive dropdowns */}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Actual (₹)</label>
                      <input 
                        type="number" 
                        value={actualPrice}
                        onChange={(e) => setActualPrice(e.target.value)}
                        placeholder="1499" 
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono font-medium backdrop-blur-sm shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md flex justify-between">
                         Sell (₹)
                      </label>
                      <input 
                        type="number" 
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        placeholder="999" 
                        className="w-full bg-black/40 border border-emerald-500/50 rounded-xl px-4 py-2.5 text-emerald-400 placeholder-emerald-900/50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-black shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="relative border border-white/20 hover:border-emerald-500/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors group bg-black/30 backdrop-blur-sm">
                       <input 
                         type="file" 
                         multiple 
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                       />
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:text-emerald-400 border border-white/20 transition-colors">
                           <Upload className="w-5 h-5 drop-shadow-md" />
                         </div>
                         <div>
                            <h4 className="font-bold text-white text-sm">Upload Photos</h4>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Support JPG / PNG (Select 3-5)</p>
                         </div>
                       </div>
                       <ChevronRight className="w-5 h-5 pl-1 text-gray-500 group-hover:text-emerald-400" />
                    </div>

                     {/* Image Preview Grid */}
                     {imageBase64Array.length > 0 && (
                       <div className="grid grid-cols-4 gap-2 mt-4 p-2 bg-black/30 rounded-xl border border-white/10 backdrop-blur-md hidden-scrollbar overflow-x-auto">
                         {imageBase64Array.map((b64, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/20 shadow-md group">
                               <img src={b64} alt="preview" className="w-full h-full object-cover" />
                               <button 
                                 onClick={(e) => { 
                                   e.preventDefault(); 
                                   setImageBase64Array(prev => prev.filter((_, i) => i !== idx)); 
                                 }}
                                 className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                            </div>
                         ))}
                       </div>
                     )}
                  </div>

               </div>
            </div>

            <div className="p-6 border-t border-white/20 bg-white/5 sticky bottom-0 z-20 flex flex-col gap-4 backdrop-blur-md">
               {isSaving && (
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mb-2 relative shadow-inner">
                     <div 
                       className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-300 ease-out relative"
                       style={{ width: `${Math.min(progress, 100)}%` }}
                     >
                       <div className="absolute inset-0 bg-white/20 animate-pulse" />
                     </div>
                     <p className="absolute -top-6 right-0 text-[10px] font-black uppercase text-emerald-400 tracking-widest">{Math.round(progress)}%</p>
                  </div>
               )}
               <div className="flex gap-4">
                 <button disabled={isSaving} onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3.5 rounded-2xl border border-white/30 bg-black/20 hover:bg-white/10 text-white font-bold tracking-wider uppercase text-sm transition-colors backdrop-blur-md shadow-lg disabled:opacity-50">
                   Cancel
                 </button>
                 <button disabled={isSaving} onClick={handleSaveProduct} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black tracking-widest uppercase text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-0.5 border border-emerald-300 disabled:opacity-50 disabled:transform-none disabled:cursor-wait">
                   {isSaving ? "Syncing Database..." : (editingId ? "Save Edit Protocol" : "Add Product Let's GO!")}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
      {/* MANAGE CATEGORIES MODAL */}
      {isManageCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsManageCategoriesOpen(false)} />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                   <FolderTree className="w-5 h-5 text-emerald-400" />
                   <h2 className="text-xl font-outfit font-black uppercase tracking-widest text-white">Manage Categories</h2>
                </div>
                <button onClick={() => setIsManageCategoriesOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
               <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-bold uppercase tracking-widest leading-relaxed">
                     Deleting a category will automatically recategorize all products currently inside it to "Uncategorized".
                  </p>
               </div>
               
               {Array.from(new Set<string>(products.map(p => p.category))).map(cat => {
                 const count = products.filter(p => p.category === cat).length;
                 if (cat === 'Uncategorized') return null;
                 
                 return (
                   <div key={cat} className="flex flex-col gap-2 p-4 bg-black/40 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                     <div className="flex items-center justify-between">
                       <span className="font-outfit font-bold uppercase tracking-widest text-gray-200">{cat}</span>
                       <button 
                         onClick={() => {
                            if(window.confirm(`Are you sure you want to delete the "${cat}" category? ${count} product(s) will be marked as "Uncategorized".`)) {
                               deleteCategoryGlobal(cat);
                            }
                         }}
                         className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/50"
                         title="Delete Category"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{count} PRODUCT(S)</p>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch(status) {
    case 'Active': 
      return (
        <span className="px-2.5 py-1 rounded bg-emerald-500/80 text-black text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
          Active
        </span>
      );
    case 'Low Stock': 
      return (
        <span className="px-2.5 py-1 rounded bg-orange-500/80 text-black text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
          Low Stock
        </span>
      );
    case 'Out of Stock': 
      return (
        <span className="px-2.5 py-1 rounded bg-red-500/80 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
          Out of Stock
        </span>
      );
    default: 
      return null;
  }
}
