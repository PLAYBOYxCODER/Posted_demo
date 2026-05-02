"use client";
import React from "react";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Truck,
  Package
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import ScrollReveal from "@/components/ScrollReveal";
import { useOrders } from "@/components/OrderProvider";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const { orders } = useOrders();
  const [recentProfiles, setRecentProfiles] = React.useState<any[]>([]);
  
  React.useEffect(() => {
     const fetchProfiles = async () => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20);
        if (data) setRecentProfiles(data);
     };
     fetchProfiles();
  }, []);

  // Dynamic calculations
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
  const activeOrdersCount = orders.filter(o => o.status !== "delivered").length;
  // Assume basic unique customers for demo dynamic data
  const uniqueCustomersCount = new Set(orders.map(o => o.email || o.customerName)).size;

  // Derive top 5 actionable orders
  const actionableOrders = orders
    .filter(o => o.status !== "delivered")
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // Dynamically generate chart data based on recent orders
  const chartData = React.useMemo(() => {
    // initialize an array of last 7 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const dataTemplate: {name: string, sales: number}[] = [];
    
    for (let i = 6; i >= 0; i--) {
       let m = currentMonth - i;
       if (m < 0) m += 12;
       dataTemplate.push({ name: monthNames[m], sales: 0 });
    }

    orders.forEach(order => {
       const d = new Date(order.timestamp);
       const orderMonthName = monthNames[d.getMonth()];
       const target = dataTemplate.find(t => t.name === orderMonthName);
       if (target) {
          target.sales += order.total;
       }
    });

    // Make sure there is visual height even if no sales exist in empty months for layout demo
    return dataTemplate.map(d => ({
       name: d.name,
       sales: d.sales === 0 ? Math.floor(Math.random() * 500) : d.sales // slight visual fallback so chart isn't totally flat 0 before actual data
    }));
  }, [orders]);

  // Calculate Today's Accounts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysAccounts = recentProfiles.filter(p => new Date(p.created_at) >= today);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard 
          title="Total Revenue (All Time)" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          isPositive={true} 
          icon={CreditCard} 
          color="emerald"
        />
        <StatCard 
          title="Active Orders" 
          value={activeOrdersCount.toString()} 
          trend="+5.2%" 
          isPositive={activeOrdersCount > 0} 
          icon={ShoppingBag} 
          color="blue"
        />
        <StatCard 
          title="Total Customers" 
          value={uniqueCustomersCount.toString()} 
          trend="+3.1%" 
          isPositive={true} 
          icon={Users} 
          color="purple"
        />
        <StatCard 
          title="Traffic (30d)" 
          value="24.5k" 
          trend="+18.4%" 
          isPositive={true} 
          icon={TrendingUp} 
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* MAIN CHART */}
        <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-base sm:text-lg font-outfit font-bold uppercase tracking-widest text-white">Revenue Overview</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Monthly sales performance</p>
            </div>
            <select className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:border-white/30">
              <option>Last 7 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[200px] sm:h-[300px] w-full -ml-3 sm:-ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                  formatter={(val: any) => [`₹${val}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ORDERS COMPACT */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-outfit font-bold uppercase tracking-widest text-white">Action Needed</h3>
            <button className="text-emerald-400 text-sm hover:text-emerald-300 font-medium">View All</button>
          </div>
          
          <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
            {actionableOrders.length > 0 ? (
               actionableOrders.map((order, idx) => (
                  <ScrollReveal key={order.id} delay={idx * 100}>
                     <OrderListItem 
                        id={order.id} 
                        customer={order.customerName} 
                        amount={`₹${order.total.toLocaleString()}`} 
                        status={order.status} 
                        time={new Date(order.timestamp).toLocaleDateString()} 
                     />
                  </ScrollReveal>
               ))
            ) : (
               <div className="h-full flex flex-col items-center justify-center pt-8 opacity-50 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-gray-500" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No pending actions required.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* TODAY'S ACCOUNTS ROW */}
      <h2 className="text-2xl font-outfit font-black uppercase tracking-widest text-white pt-4">Today's New Patrons <span className="text-emerald-500 ml-2">({todaysAccounts.length})</span></h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pb-20">
         {todaysAccounts.length > 0 ? (
            todaysAccounts.map((profile, idx) => (
               <ScrollReveal key={profile.id} delay={idx * 50}>
                  <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                     <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-[30px] rounded-full" />
                     <div className="w-16 h-16 rounded-full bg-black border-2 border-white/10 mb-4 overflow-hidden group-hover:border-emerald-500 transition-colors shadow-inner flex items-center justify-center">
                        {profile.avatar_url ? (
                           <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-gray-500 font-outfit font-black text-xs">NO PIC</span>
                        )}
                     </div>
                     <h4 className="font-outfit font-black uppercase text-white truncate w-full text-center text-xs sm:text-base">{profile.full_name || "Unknown"}</h4>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1 truncate w-full text-center bg-white/5 py-1 px-2 rounded-full border border-white/5">{profile.email || "No Email Bound"}</p>
                     <div className="mt-4 flex items-center gap-1 text-[9px] text-emerald-400 uppercase font-black tracking-widest bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Secure OTP Login
                     </div>
                  </div>
               </ScrollReveal>
            ))
         ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-zinc-900 border border-white/10 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center opacity-70">
               <Users className="w-10 h-10 text-gray-500 mb-3" />
               <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No new accounts created today.</p>
            </div>
         )}
      </div>

    </div>
  );
}

function StatCard({ title, value, trend, isPositive, icon: Icon, color }: any) {
  const colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        <Icon className={`w-24 h-24 ${colorMap[color as keyof typeof colorMap].split(' ')[1]}`} />
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl ${colorMap[color as keyof typeof colorMap]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h4 className="text-gray-400 font-medium text-sm">{title}</h4>
        </div>
        <div>
          <h2 className="text-xl sm:text-3xl font-outfit font-black mb-1 sm:mb-2">{value}</h2>
          <div className={`flex flex-col xl:flex-row xl:items-center gap-0.5 xl:gap-1 text-xs sm:text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span className="flex items-center">
              {isPositive ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              {trend}
            </span>
            <span className="text-gray-500 xl:ml-1 font-normal text-[9px] sm:text-xs">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderListItem({ id, customer, amount, status, time }: any) {
  const getStatusIcon = () => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-400" />;
      case 'ready_to_transport': return <Truck className="w-4 h-4 text-yellow-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-400" />;
      case 'near_city': return <Truck className="w-4 h-4 text-emerald-400" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
          {customer ? customer.charAt(0) : '?'}
        </div>
        <div>
          <h5 className="font-bold text-sm text-gray-200">{customer}</h5>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{id.split('-')[1] || id}</span> • <span>{time}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-bold text-sm">{amount}</span>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">{status.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </div>
  );
}
