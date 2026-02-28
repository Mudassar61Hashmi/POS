import React, { useState, useEffect } from "react";
import { Printer, X } from "lucide-react";
import { motion } from "motion/react";
import { Sale, SaleItem } from "../types";

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sale) {
      fetch(`/api/sales/${sale.id}`)
        .then(res => res.json())
        .then(data => {
          setItems(data);
          setLoading(false);
        });
    }
  }, [sale]);

  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 receipt-overlay">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden font-mono text-sm print-receipt"
      >
        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold uppercase tracking-tighter">ProPOS Receipt</h2>
            <p className="text-xs text-zinc-500">123 Business Ave, Tech City</p>
            <p className="text-xs text-zinc-500">Tel: (555) 012-3456</p>
          </div>

          <div className="border-y border-dashed border-zinc-300 py-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span>{sale.id.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(sale.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.cashier}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400 border-b border-zinc-100 pb-1">
              <span className="w-1/2">Item</span>
              <span className="w-1/4 text-center">Qty</span>
              <span className="w-1/4 text-right">Price</span>
            </div>
            {loading ? (
              <div className="py-4 text-center text-zinc-400">Loading items...</div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="w-1/2 truncate">{item.name}</span>
                  <span className="w-1/4 text-center">x{item.quantity}</span>
                  <span className="w-1/4 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-dashed border-zinc-300 pt-4 space-y-2">
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Payment Type</span>
              <span>Cash</span>
            </div>
          </div>

          <div className="text-center pt-4 space-y-2 print:hidden">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Thank you for your business!</p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  window.focus();
                  window.print();
                }}
                className="flex-1 bg-zinc-900 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <Printer size={14} />
                Print
              </button>
              <button 
                onClick={onClose}
                className="flex-1 border border-zinc-200 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <div className="hidden print:block text-center pt-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Thank you for your business!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
