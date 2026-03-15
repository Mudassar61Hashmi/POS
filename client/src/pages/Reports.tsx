import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Calendar, Download } from "lucide-react";
import { motion } from "motion/react";

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Revenue", value: `$${reportData?.totalRevenue?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total Sales", value: reportData?.totalSales || 0, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Avg. Sale Value", value: `$${(reportData?.totalRevenue / (reportData?.totalSales || 1)).toFixed(2) || "0.00"}`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="h-full flex flex-col p-6 bg-[#f5f5f5]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales & Inventory Reports</h1>
          <p className="text-gray-500 text-sm">Analyze your business performance over time</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-black/5">
            <Calendar size={16} className="text-gray-400 ml-2" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm border-none outline-none focus:ring-0"
            />
            <span className="text-gray-300">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm border-none outline-none focus:ring-0"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-black/5"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Revenue Overview</h3>
            <BarChart3 size={20} className="text-gray-400" />
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm italic">Chart visualization would go here (e.g. using Recharts)</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Top Selling Categories</h3>
            <TrendingUp size={20} className="text-gray-400" />
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm italic">Category breakdown visualization would go here</p>
          </div>
        </div>
      </div>
    </div>
  );
};
