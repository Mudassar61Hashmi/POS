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
    <div className="h-full flex flex-col p-8 bg-[#f8f9fa] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Sales History</h1>
          <p className="text-zinc-500 text-sm mt-1">Review and manage all past transactions and receipts.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Revenue</p>
              <p className="text-xl font-bold text-zinc-900">${sales.reduce((sum, s) => sum + s.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transaction ID or cashier..."
              className="w-full pl-11 pr-4 py-4 bg-white border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-black/5 outline-none text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center text-zinc-400">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading transactions...</p>
              </div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-4 opacity-50">
              <FileText size={64} />
              <p className="text-sm font-bold">No transactions found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Transaction ID</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Date & Time</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Cashier</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Total Amount</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono font-bold text-zinc-400">#{sale.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{new Date(sale.timestamp).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(sale.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-white transition-colors border border-transparent group-hover:border-zinc-100">
                          <User size={16} />
                        </div>
                        <span className="font-bold text-zinc-900">{sale.cashier}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-lg text-emerald-600">${sale.total.toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleViewDetails(sale)}
                        className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold bg-zinc-100 text-zinc-600 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm"
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
