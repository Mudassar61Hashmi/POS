import React, { useState, useMemo } from "react";
import { User, Product } from "../types";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface POSProps {
  user: User;
  products: Product[];
  onCheckout: () => void;
  onShowReceipt: (sale: any) => void;
}

interface CartItem extends Product {
  cartQuantity: number;
}

export const POS: React.FC<POSProps> = ({ user, products, onCheckout, onShowReceipt }) => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.barcode.includes(search)
    );
  }, [products, search]);

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.cartQuantity >= product.quantity) return prev;
        return prev.map(item => 
          item._id === product._id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === productId) {
        const newQty = item.cartQuantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.quantity) return item;
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          cashier: user.username,
          total,
          items: cart.map(item => ({
            id: item._id,
            name: item.name,
            quantity: item.cartQuantity,
            price: item.price
          }))
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onCheckout();
        setCart([]);
        // Fetch full sale details for receipt
        const saleRes = await fetch(`/api/sales/${data.saleId}`);
        const saleItems = await saleRes.json();
        onShowReceipt({
          id: data.saleId,
          total,
          timestamp: new Date().toISOString(),
          cashier: user.username,
          items: saleItems
        });
      } else {
        alert(data.message || "Checkout failed");
      }
    } catch (err) {
      alert("Checkout error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full gap-6 p-6 bg-[#f5f5f5]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or barcode..."
            className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none text-sm transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <motion.button
                key={product._id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                disabled={product.quantity <= 0}
                className={`flex flex-col p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-black/5 transition-all text-left group ${product.quantity <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="w-full aspect-square bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-300 group-hover:text-black transition-colors">
                  <Package size={40} />
                </div>
                <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{product.category}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${product.quantity > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {product.quantity} in stock
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 flex flex-col bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="font-bold">Current Order</h2>
          </div>
          <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {cart.length} ITEMS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 opacity-50">
                <ShoppingCart size={48} />
                <p className="text-sm font-medium">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">{item.name}</h4>
                      <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-black/5">
                      <button 
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-1 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.cartQuantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-1 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-gray-50 border-t border-black/5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (0%)</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-black/5">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
          >
            <CreditCard size={18} />
            {loading ? "Processing..." : "Complete Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};
