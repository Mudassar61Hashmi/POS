import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Calendar, Download } from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

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

  const COLORS = ['#000000', '#4B5563', '#9CA3AF', '#D1D5DB', '#E5E7EB'];

  const stats = [
    { label: "Total Revenue", value: `$${reportData?.totalRevenue?.toLocaleString() || "0.00"}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total Sales", value: reportData?.totalSales || 0, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Avg. Sale Value", value: `$${(reportData?.totalRevenue / (reportData?.totalSales || 1)).toFixed(2) || "0.00"}`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="h-full flex flex-col p-8 bg-[#f8f9fa] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Performance Reports</h1>
          <p className="text-zinc-500 text-sm mt-1">Detailed analysis of your sales and inventory data.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-zinc-100">
            <Calendar size={16} className="text-zinc-400 ml-2" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-bold text-zinc-600 border-none outline-none focus:ring-0 bg-transparent"
            />
            <span className="text-zinc-300 text-xs font-bold">TO</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-bold text-zinc-600 border-none outline-none focus:ring-0 bg-transparent"
            />
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100"
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-bold text-xl text-zinc-900">Revenue Breakdown</h3>
              <p className="text-zinc-400 text-xs mt-1">Daily revenue distribution for the selected period</p>
            </div>
            <BarChart3 size={24} className="text-zinc-300" />
          </div>
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData?.revenueChartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={10}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8f9fa' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#000000" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-bold text-xl text-zinc-900">Product Performance</h3>
              <p className="text-zinc-400 text-xs mt-1">Top 5 products by sales volume</p>
            </div>
            <TrendingUp size={24} className="text-zinc-300" />
          </div>
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData?.topProductsData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {(reportData?.topProductsData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
