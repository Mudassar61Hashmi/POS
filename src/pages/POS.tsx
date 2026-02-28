import React, { useState } from "react";
import { ShoppingCart, Search, Trash2, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { User, Product, CartItem } from "../types";

interface POSProps {
  user: User;
  products: Product[];
  onCheckout: () => void;
  onShowReceipt: (sale: any) => void;
}

export const POS: React.FC<POSProps> = ({ user, products, onCheckout, onShowReceipt }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search)
  );

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.quantity) return prev;
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.quantity) return item;
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: cart.map(item => ({ id: item.id, quantity: item.cartQuantity, price: item.price, name: item.name })),
          total
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCart([]);
        onCheckout();
        onShowReceipt({
          id: data.saleId,
          total,
          timestamp: new Date().toISOString(),
          cashier: user.username
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search products by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {filteredProducts.map(p => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(p)}
              disabled={p.quantity <= 0}
              className={`p-4 bg-white border border-zinc-200 rounded-xl text-left flex flex-col gap-2 transition-all shadow-sm ${p.quantity <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-emerald-500'}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{p.category}</span>
                <span className="text-xs text-zinc-400 font-mono">#{p.barcode}</span>
              </div>
              <h3 className="font-semibold text-zinc-900 truncate">{p.name}</h3>
              <div className="flex justify-between items-end mt-auto">
                <span className="text-lg font-bold text-zinc-900">${p.price.toFixed(2)}</span>
                <span className={`text-xs ${p.quantity < 10 ? 'text-orange-500 font-bold' : 'text-zinc-400'}`}>Stock: {p.quantity}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="font-semibold flex items-center gap-2">
            <ShoppingCart size={18} className="text-emerald-600" />
            Current Cart
          </h2>
          <span className="text-xs font-mono bg-zinc-200 px-2 py-1 rounded text-zinc-600">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2 opacity-50">
              <ShoppingCart size={48} strokeWidth={1} />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-zinc-500">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white border border-zinc-200 rounded hover:bg-zinc-100">-</button>
                  <span className="text-sm font-mono w-4 text-center">{item.cartQuantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-zinc-200 rounded hover:bg-zinc-100">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
          <div className="flex justify-between items-center text-zinc-500 text-sm">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-900 font-bold text-xl">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isCheckingOut}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isCheckingOut ? "Processing..." : "Complete Checkout"}
            {!isCheckingOut && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
