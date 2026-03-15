import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    salesCount: 0,
    customerCount: 0,
    lowStockCount: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [salesRes, customersRes, productsRes] = await Promise.all([
        fetch("/api/reports?startDate=" + new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]),
        fetch("/api/customers"),
        fetch("/api/products")
      ]);

      const salesData = await salesRes.json();
      const customersData = await customersRes.json();
      const productsData = await productsRes.json();

      setStats({
        revenue: salesData.totalRevenue || 0,
        salesCount: salesData.totalSales || 0,
        customerCount: customersData.length || 0,
        lowStockCount: productsData.filter((p: any) => p.stock <= p.lowStockThreshold).length || 0
      });

      // Fetch recent sales
      const recentSalesRes = await fetch("/api/sales");
      const recentSalesData = await recentSalesRes.json();
      setRecentSales(recentSalesData.slice(0, 5));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: "Today's Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50", trend: "+12.5%", isUp: true },
    { label: "Today's Sales", value: stats.salesCount, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50", trend: "+3.2%", isUp: true },
    { label: "Total Customers", value: stats.customerCount, icon: Users, color: "text-orange-500", bg: "bg-orange-50", trend: "+18.1%", isUp: true },
    { label: "Low Stock Items", value: stats.lowStockCount, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", trend: "-2", isUp: false },
  ];

  return (
    <div className="h-full flex flex-col p-6 bg-[#f5f5f5] overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-gray-500 text-sm">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-black/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${card.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {card.trend}
                {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent Transactions</h3>
            <Link to="/sales" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">View All</Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentSales.map((sale: any) => (
                  <tr key={sale._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{sale._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 font-semibold text-sm">{sale.customer_id?.name || "Walk-in"}</td>
                    <td className="px-6 py-4 font-bold text-sm">${sale.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-md">Completed</span>
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic text-sm">No recent transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Quick Actions</h3>
            <Package size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <Link 
              to="/pos" 
              className="flex items-center justify-between p-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
            >
              New Sale
              <ArrowUpRight size={18} />
            </Link>
            <Link 
              to="/inventory" 
              className="flex items-center justify-between p-4 bg-gray-50 text-black border border-black/5 rounded-2xl font-bold hover:bg-gray-100 transition-all"
            >
              Manage Stock
              <ArrowUpRight size={18} />
            </Link>
            <Link 
              to="/customers" 
              className="flex items-center justify-between p-4 bg-gray-50 text-black border border-black/5 rounded-2xl font-bold hover:bg-gray-100 transition-all"
            >
              Add Customer
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-black/5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">System Status</h4>
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
