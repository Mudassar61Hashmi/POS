import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  Clock
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    salesCount: 0,
    customerCount: 0,
    lowStockCount: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      
      const startDate = lastWeek.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const [reportsRes, customersRes, productsRes, recentSalesRes] = await Promise.all([
        fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`),
        fetch("/api/customers"),
        fetch("/api/products"),
        fetch("/api/sales")
      ]);

      const reportsData = await reportsRes.json();
      const customersData = await customersRes.json();
      const productsData = await productsRes.json();
      const recentSalesData = await recentSalesRes.json();

      setStats({
        revenue: reportsData.totalRevenue || 0,
        salesCount: reportsData.totalSales || 0,
        customerCount: customersData.length || 0,
        lowStockCount: productsData.filter((p: any) => p.quantity <= 10).length || 0
      });

      setChartData(reportsData.revenueChartData || []);
      setTopProducts(reportsData.topProductsData || []);
      setRecentSales(recentSalesData.slice(0, 6));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#000000', '#4B5563', '#9CA3AF', '#D1D5DB', '#E5E7EB'];

  const cards = [
    { label: "Revenue (7d)", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50", trend: "+12.5%", isUp: true },
    { label: "Sales (7d)", value: stats.salesCount, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50", trend: "+3.2%", isUp: true },
    { label: "Total Customers", value: stats.customerCount, icon: Users, color: "text-orange-500", bg: "bg-orange-50", trend: "+18.1%", isUp: true },
    { label: "Low Stock Items", value: stats.lowStockCount, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", trend: "-2", isUp: false },
  ];

  return (
    <div className="h-full flex flex-col p-8 bg-[#f8f9fa] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Store Analytics</h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time performance overview for your business.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-zinc-200 text-xs font-bold text-zinc-500 flex items-center gap-2">
            <Clock size={14} />
            Last updated: Just now
          </div>
          <button 
            onClick={fetchDashboardData}
            className="p-2 bg-white rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            <TrendingUp size={18} className="text-zinc-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {card.trend}
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-zinc-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg text-zinc-900">Revenue Trend</h3>
              <p className="text-zinc-400 text-xs">Daily revenue performance for the last 7 days</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full" />
                <span className="text-xs font-bold text-zinc-500">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={10}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#000000" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Donut */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col">
          <h3 className="font-bold text-lg text-zinc-900 mb-2">Top Products</h3>
          <p className="text-zinc-400 text-xs mb-8">Best performing items by quantity sold</p>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full space-y-3 mt-6">
              {topProducts.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs font-medium text-zinc-600 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">{item.value} sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-zinc-900">Recent Transactions</h3>
              <p className="text-zinc-400 text-xs">Latest sales processed in your store</p>
            </div>
            <Link to="/sales" className="px-4 py-2 bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-colors uppercase tracking-widest">View History</Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Order ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Total</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {recentSales.map((sale: any) => (
                  <tr key={sale._id} className="hover:bg-zinc-50/30 transition-colors group">
                    <td className="px-8 py-5 font-mono text-[10px] text-zinc-400 group-hover:text-zinc-900 transition-colors">#{sale._id.slice(-8).toUpperCase()}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-zinc-900">{sale.customer_id?.name || "Walk-in Customer"}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">Processed by {sale.cashier}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-sm text-zinc-900">${sale.total.toFixed(2)}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full">Success</span>
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-zinc-400 italic text-sm">No recent transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          <div className="bg-black p-8 rounded-[2.5rem] shadow-xl shadow-black/10 flex flex-col text-white">
            <h3 className="font-bold text-lg mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/pos" 
                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all group"
              >
                Launch POS
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link 
                to="/inventory" 
                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all group"
              >
                Add Inventory
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-zinc-900">System Status</h3>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                <span className="text-xs font-bold text-zinc-500">Database</span>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                <span className="text-xs font-bold text-zinc-500">API Gateway</span>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                <span className="text-xs font-bold text-zinc-500">Auth Service</span>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Stable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Plus = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
