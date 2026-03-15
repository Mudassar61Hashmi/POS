import React, { useState, useEffect } from "react";
import { Sale } from "../types";
import { Search, Calendar, User, DollarSign, Eye, FileText } from "lucide-react";
import { motion } from "motion/react";
import { ReceiptModal } from "../components/ReceiptModal";

export const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState<any>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales");
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(s => 
    s.cashier.toLowerCase().includes(search.toLowerCase()) || 
    s.id.includes(search)
  );

  const handleViewDetails = async (sale: Sale) => {
    try {
      const res = await fetch(`/api/sales/${sale.id}`);
      const items = await res.json();
      setShowReceipt({ ...sale, items });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#f5f5f5]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
          <p className="text-gray-500 text-sm">Review past transactions and receipts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-black/5 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-500" />
            <span className="text-sm font-bold">
              Total Revenue: ${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transaction ID or cashier..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black/5 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p className="animate-pulse">Loading transactions...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
              <FileText size={48} />
              <p className="text-sm font-medium">No transactions found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Cashier</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-400">#{sale.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{new Date(sale.timestamp).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-400">{new Date(sale.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                          <User size={12} />
                        </div>
                        <span className="text-sm font-medium">{sale.cashier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-emerald-600">${sale.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewDetails(sale)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gray-50 text-gray-600 hover:bg-black hover:text-white rounded-lg transition-all"
                      >
                        <Eye size={14} />
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showReceipt && (
        <ReceiptModal 
          sale={showReceipt} 
          onClose={() => setShowReceipt(null)} 
        />
      )}
    </div>
  );
};
