import React, { useState, useEffect } from "react";
import { User, Printer } from "lucide-react";
import { Sale } from "../types";

interface SalesHistoryProps {
  onShowReceipt: (sale: Sale) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ onShowReceipt }) => {
  const [sales, setSales] = useState<Sale[]>([]);

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
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Sales History</h2>
        <p className="text-sm text-zinc-500">Track all transactions and revenue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Total Revenue</p>
          <h3 className="text-3xl font-bold text-zinc-900">${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}</h3>
        </div>
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Total Transactions</p>
          <h3 className="text-3xl font-bold text-zinc-900">{sales.length}</h3>
        </div>
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Avg. Sale Value</p>
          <h3 className="text-3xl font-bold text-zinc-900">
            ${sales.length > 0 ? (sales.reduce((sum, s) => sum + s.total, 0) / sales.length).toFixed(2) : "0.00"}
          </h3>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Date & Time</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Cashier</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Amount</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sales.map(s => (
              <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-medium text-zinc-900">{new Date(s.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-zinc-400" />
                    <span className="text-sm">{s.cashier}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-zinc-900">${s.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onShowReceipt(s)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 ml-auto"
                  >
                    <Printer size={14} />
                    Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
