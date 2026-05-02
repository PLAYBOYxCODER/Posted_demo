"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Archive,
  Navigation,
  Camera,
  Sparkles,
  Wand2,
  MessageSquare
} from "lucide-react";
import PixelSnow from "@/components/PixelSnow";
import { useOrders } from "@/components/OrderProvider";
import { AdminProvider } from "@/components/AdminProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { pendingCount, orders } = useOrders();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Live Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Custom Orders", href: "/admin/custom-orders", icon: Wand2 },
    { name: "Tracking", href: "/admin/tracking", icon: Navigation },
    { name: "Order History", href: "/admin/order-history", icon: Archive },
    { name: "Delivery Rules", href: "/admin/delivery-rules", icon: Package },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Home Customization", href: "/admin/home", icon: Sparkles },
    { name: "Verified Posts", href: "/admin/verified", icon: Camera },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <AdminProvider>
      <div className="flex h-screen bg-[#09090b] text-white overflow-hidden font-inter selection:bg-white selection:text-black">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#09090b] border-r border-white/10 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-32 flex items-center justify-center px-6 border-b border-white/10 shrink-0 relative">
          <Link href="/admin" className="flex items-center justify-center group w-full">
            <img 
              src="/logo_pic.png" 
              alt="Logo" 
              className="w-28 h-28 object-contain transition-transform duration-700 hover:scale-110"
            />
          </Link>
          <button className="md:hidden text-gray-400 hover:text-white absolute right-4" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex justify-between items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-black" : "text-gray-400 group-hover:text-white"}`} />
                  {item.name}
                </div>
                {item.name === "Live Orders" && pendingCount > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-widest ${isActive ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{pendingCount} New</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium">
            <LogOut className="w-5 h-5 shrink-0" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        
        {/* Pixel Snow Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <PixelSnow 
            color="#ffffff"
            flakeSize={0.015}
            minFlakeSize={1.5}
            pixelResolution={200}
            speed={1}
            density={0.25}
            direction={125}
            brightness={1}
            depthFade={6}
            farPlane={15}
            gamma={0.4545}
            variant="round" 
          />
        </div>

        {/* TOP HEADER */}
        <header className="h-20 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
          <div className="flex items-center gap-4">
             {/* Mobile Menu Toggle (hidden on md) */}
             <button 
               className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
               onClick={() => setIsMobileMenuOpen(true)}
             >
               <Menu className="w-6 h-6" />
             </button>
             {/* Page Title using Pathname */}
             <h2 className="font-outfit font-bold text-xl capitalize text-gray-200 flex items-center gap-3">
               <img src="/logo_pic.png" alt="Logo" className="w-12 h-12 object-contain md:hidden transition-transform duration-700" />
               <span className="hidden md:block">{pathname === "/admin" ? "Dashboard" : pathname.split('/').pop()}</span>
             </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search orders, posters..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors w-64"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 group cursor-pointer"
              >
                <Bell className={`w-5 h-5 ${pendingCount > 0 ? "text-white group-hover:animate-swing" : "text-gray-300"}`} />
                {pendingCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">{pendingCount}</span>
                )}
              </button>
              
              {isNotifOpen && (
                 <div className="absolute top-12 right-0 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-3 border-b border-white/10 pb-2">Recent Alerts</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                       {orders.filter(o => o.status === 'pending').slice(0, 3).map((o, idx) => (
                         <div key={o.id} className="bg-black/50 border border-white/5 p-3 rounded-xl flex gap-3 items-start">
                            <ShoppingBag className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                               <p className="text-xs font-bold text-white uppercase truncate">{o.customerName} placed an order</p>
                               <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{o.id} • ₹{o.total}</p>
                            </div>
                         </div>
                       ))}
                       {orders.filter(o => o.status === 'pending').length === 0 && (
                         <div className="bg-black/50 border border-white/5 p-3 rounded-xl flex gap-3 items-start">
                            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                               <p className="text-xs font-bold text-white uppercase truncate">New 5-Star Feedback Received</p>
                               <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Rahul added feedback with photos</p>
                            </div>
                         </div>
                       )}
                    </div>
                    <Link href="/admin/orders" onClick={() => setIsNotifOpen(false)} className="block w-full text-center mt-3 pt-3 border-t border-white/10 text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-white transition-colors">
                      View All Activity
                    </Link>
                 </div>
              )}
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-black border border-white/20 cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              A
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950/20 relative z-10">
          {children}
        </div>
      </main>

    </div>
    </AdminProvider>
  );
}
