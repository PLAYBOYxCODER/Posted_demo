"use client";
import React, { use, useState } from "react";
import Link from "next/link";
import { Star, Truck, ShieldCheck, Tag, ShoppingCart, Heart, MessageSquare, Send, Lock, Camera, Image as ImageIcon, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useProducts } from "@/components/ProductProvider";
import { useOrders } from "@/components/OrderProvider";
import { useWishlist } from "@/components/WishlistProvider";

const initialMockReviews = [
  { id: 1, user: "Karan M.", rating: 5, date: "2 days ago", comment: "Absolutely insane print quality. The colors pop so heavily on my dark wall!", photo: "" },
  { id: 2, user: "Priya T.", rating: 4, date: "1 week ago", comment: "Really beautiful poster. Gave it 4 stars because shipping took exactly 5 days instead of 3, but totally worth the wait.", photo: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=400" },
  { id: 3, user: "Vikas R.", rating: 5, date: "2 weeks ago", comment: "Premium 300 GSM matte completely changes the game. No glare at all.", photo: "" }
];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { orders } = useOrders();
  
  const product = products.find(p => p.id === unwrappedParams.id) || products[0];
  const productImageList = product?.images?.length ? product.images : ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=1000"];
  
  const [activeImage, setActiveImage] = useState(0);
  const { wishlistIds, toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = product ? isInWishlist(product.id) : false;
  
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState("");
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [selectedSize, setSelectedSize] = useState("A3 (Medium)");
  const [reviews, setReviews] = useState(initialMockReviews);

  const hasPurchasedAndReceived = orders.some((order) => 
    order.status === "delivered" && order.items.some(item => product && item.id === product.id)
  );
  
  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-400 font-outfit font-black uppercase tracking-widest animate-pulse">Loading Premium Details...</div>;
  
  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return;
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReviewPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImageList[0],
      quantity: 1,
      size: selectedSize
    });
  };

  const handleToggleWishlist = () => {
    if (product) toggleWishlist(product.id);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if(userRating === 0) return alert("Please select a star rating first!");
    
    // Push review to local state
    setReviews(prev => [{
      id: Date.now(),
      user: "You",
      rating: userRating,
      date: "Just now",
      comment: reviewText,
      photo: reviewPhoto
    }, ...prev]);

    setIsReviewSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 relative">
      

      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8 text-xs md:text-sm text-gray-400 uppercase tracking-widest font-semibold font-outfit truncate">
          <Link href="/" className="hover:text-white transition-colors">Home</Link> &gt; 
          <Link href="/shop" className="hover:text-white transition-colors ml-2">Shop</Link> &gt; 
          <span className="text-white ml-2">{product?.name || "Premium Masterpiece"}</span>
        </div>

        {/* TOP SECTION: Gallery & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          
          {/* Interactive Image Gallery */}
          <div className="space-y-4">
             <div className="w-full aspect-[3/4] relative bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="absolute top-4 left-4 z-20 bg-emerald-500 text-black px-3 py-1 text-xs font-black uppercase tracking-widest rounded-md shadow-lg">20% OFF</div>
                <img 
                  src={productImageList[activeImage]} 
                  alt="Main Product" 
                  className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                />
             </div>
             
             {/* Thumbnail Track */}
             <div className="grid grid-cols-4 gap-3 md:gap-4">
                {productImageList.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`w-full aspect-square bg-zinc-900 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${activeImage === idx ? 'border-emerald-500 opacity-100 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </div>

          {/* Product Details & Ordering */}
          <div className="flex flex-col">
             <div className="border-b border-white/10 pb-8 mb-8">
               <h1 className="text-3xl md:text-5xl font-outfit font-black uppercase mb-4 leading-tight">{product?.name || `Premium Volume ${unwrappedParams.id}`}</h1>
               <div className="flex items-center gap-4 mb-6">
                 <div className="flex items-center gap-1 text-yellow-500">
                   {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 md:w-5 md:h-5 fill-current" />)}
                 </div>
                 <a href="#reviews" className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest hover:text-white transition-colors cursor-pointer border-b border-dashed border-gray-600 pb-0.5">
                   {reviews.length} Verified Reviews
                 </a>
               </div>
               <div className="flex items-center gap-4">
                 <span className="text-4xl md:text-5xl font-outfit font-black text-emerald-400">₹{product?.price || 499}</span>
                 {product?.actualPrice > product?.price && (
                    <span className="text-xl md:text-2xl text-gray-500 line-through font-bold">₹{product.actualPrice}</span>
                 )}
                 <span className="bg-white/10 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ml-auto self-end mb-1">Tax Included</span>
               </div>
             </div>

             <div className="mb-8 space-y-8">
                <div>
                   <label className="text-sm text-gray-400 font-bold uppercase tracking-widest block mb-4">Select Scale / Size</label>
                   <div className="grid grid-cols-3 gap-3">
                     {['A4 (Small)', 'A3 (Medium)', 'A2 (Large)'].map((sz, i) => (
                       <button onClick={() => setSelectedSize(sz)} key={sz} className={`border py-4 rounded-xl font-outfit font-bold uppercase text-xs md:text-sm transition-colors ${selectedSize === sz ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/20 hover:border-white hover:bg-white/5'}`}>
                         {sz}
                       </button>
                     ))}
                   </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
                {product?.meesho_link ? (
                  <a href={product.meesho_link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-3 h-14 md:h-16 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <ShoppingCart className="w-5 h-5" /> Buy on Meesho
                  </a>
                ) : (
                  <button onClick={handleAddToCart} className="flex-1 bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 h-14 md:h-16 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <ShoppingCart className="w-5 h-5" /> Add to Cart — ₹{product?.price || 499}
                  </button>
                )}
                <button 
                  onClick={handleToggleWishlist} 
                  className={`py-4 px-6 md:px-8 rounded-xl font-bold uppercase tracking-widest text-sm border-2 transition-all flex items-center justify-center gap-2 h-14 md:h-16 shrink-0 ${isWishlisted ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/20 text-white hover:border-white/50'}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} /> {isWishlisted ? 'Saved' : 'Wishlist'}
                </button>
             </div>

             <div className="space-y-5 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <Truck className="w-6 h-6 text-emerald-500" />
                  <div>
                    <h4 className="font-outfit font-bold uppercase tracking-widest text-sm text-gray-200">Free Express Shipping</h4>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Dispatches within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  <div>
                    <h4 className="font-outfit font-bold uppercase tracking-widest text-sm text-gray-200">7-Day Free Returns</h4>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">No questions asked refund policy.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Tag className="w-6 h-6 text-emerald-500" />
                  <div>
                    <h4 className="font-outfit font-bold uppercase tracking-widest text-sm text-gray-200">Premium Gallery Quality</h4>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">300 GSM Matte Fine-Art Board.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Ratings & Feedback Option */}
        <div id="reviews" className="border-t border-white/10 pt-16 mt-16 scroll-mt-24">
           <div className="max-w-4xl mx-auto space-y-6">
                 <h3 className="font-outfit font-black uppercase text-2xl mb-8 flex items-center justify-between gap-3">
                   <div className="flex items-center gap-3">
                     <MessageSquare className="w-6 h-6 text-gray-400" /> Customer Ratings
                   </div>
                 </h3>
                 <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-8 border border-emerald-500/20 bg-emerald-500/10 p-4 rounded-xl shadow-inner">
                    Reviews can now only be submitted securely from your Orders Dashboard once a delivery is verified.
                 </p>
                 
                 
                 {reviews.map(review => (
                   <div key={review.id} className="bg-black border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/30 transition-colors">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <div className="flex items-center gap-3 mb-2">
                           <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-white uppercase text-sm border border-white/10">
                             {review.user.charAt(0)}
                           </div>
                           <div>
                             <h4 className="font-bold text-white uppercase tracking-widest text-sm">{review.user}</h4>
                             <p className="text-xs text-gray-500 uppercase tracking-widest flex items-center gap-1 mt-0.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified Buyer</p>
                           </div>
                         </div>
                       </div>
                       <span className="text-xs text-gray-500 tracking-widest uppercase">{review.date}</span>
                     </div>
                     <div className="flex gap-1 text-yellow-500 mb-3">
                       {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'text-gray-700'}`} />)}
                     </div>
                     <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">"{review.comment}"</p>
                     
                     {review.photo && (
                       <div className="w-full max-w-[200px] aspect-square rounded-xl overflow-hidden border border-white/10 mt-2">
                         <img src={review.photo} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                       </div>
                     )}
                   </div>
                 ))}
           </div>
        </div>

      </div>

        {/* Recommended Products (Machine Learning Driven) */}
      <div className="max-w-7xl mx-auto border-t border-white/10 pt-20 mt-12 pb-20">
         <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-2">
                 <Sparkles className="w-4 h-4" /> Neural Match™ Active
              </h2>
              <h3 className="text-3xl md:text-5xl font-outfit font-black uppercase text-white tracking-widest leading-tight">Recommended For You</h3>
            </div>
            <p className="text-gray-400 text-sm max-w-sm uppercase tracking-widest leading-relaxed">
               Based on your interactions with {product?.name}, our AI engine generated these specific curation matches.
            </p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.filter(p => p.id !== product?.id).slice(0, 4).map((rec) => (
              <div key={rec.id} className="group cursor-pointer">
                 <div className="w-full aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden relative mb-4">
                   <img src={rec.images?.[0] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                     <Link href={`/product/${rec.id}`} className="bg-white text-black w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest text-center shadow-2xl hover:bg-emerald-400 transition-colors">
                        View Product
                     </Link>
                   </div>
                 </div>
                 <h4 className="font-outfit font-black text-white uppercase text-lg mb-1 truncate">{rec.name}</h4>
                 <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold font-mono">₹{rec.price}</span>
                    <span className="text-gray-600 font-bold uppercase tracking-widest text-[10px] bg-white/5 px-2 py-1 rounded">{rec.category}</span>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
