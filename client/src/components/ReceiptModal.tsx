import React from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface ReceiptModalProps {
  sale: any;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-200">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-emerald-900">Transaction Successful</h2>
          <p className="text-emerald-600 text-xs font-medium">Receipt #{sale.id.slice(-8).toUpperCase()}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Item</span>
            <div className="flex gap-8">
              <span>Qty</span>
              <span>Total</span>
            </div>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {sale.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex gap-8 items-center">
                  <span className="text-sm font-medium text-gray-500 w-4 text-center">{item.quantity}</span>
                  <span className="text-sm font-bold w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-dashed border-gray-200 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (0%)</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 text-black">
              <span>Total Paid</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 text-center space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cashier: {sale.cashier}</p>
            <p className="text-[10px] text-gray-400">{new Date(sale.timestamp).toLocaleString()}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-3.5 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
            >
              <Printer size={18} />
              Print Receipt
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
