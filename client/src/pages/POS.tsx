import React, { useState, useMemo, useEffect } from "react";
import { User, Product, Customer } from "../types";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Package, User as UserIcon, Percent } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ReceiptModal } from "../components/ReceiptModal";

interface CartItem extends Product {
  cartQuantity: number;
}

export const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      const matchesStock = stockFilter === "All" || 
        (stockFilter === "Low" && p.quantity <= 10) || 
        (stockFilter === "In Stock" && p.quantity > 10) ||
        (stockFilter === "Out of Stock" && p.quantity <= 0);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

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

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  }, [cart]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          customerId: selectedCustomerId || null,
          cashier: user.username,
          subtotal,
          discount,
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
        setCart([]);
        setDiscount(0);
        setSelectedCustomerId("");
        fetchProducts(); // Refresh stock
        
        const saleRes = await fetch(`/api/sales/${data.saleId}`);
        const saleItems = await saleRes.json();
        setShowReceipt({
          id: data.saleId,
          subtotal,
          discount,
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
    <div className="flex h-full gap-8 p-8 bg-[#f8f9fa] overflow-hidden">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Point of Sale</h1>
            <p className="text-zinc-500 text-sm mt-1">Select products to add to the current transaction.</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or barcode..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none text-sm transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-6 py-4 bg-white border border-zinc-100 rounded-2xl shadow-sm text-sm font-bold text-zinc-600 outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            
            <select 
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-6 py-4 bg-white border border-zinc-100 rounded-2xl shadow-sm text-sm font-bold text-zinc-600 outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer"
            >
              <option value="All">All Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Low">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <motion.button
                key={product._id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                disabled={product.quantity <= 0}
                className={`flex flex-col p-6 bg-white rounded-[2rem] shadow-sm border border-zinc-100 hover:border-zinc-200 hover:shadow-xl hover:shadow-black/5 transition-all text-left group relative ${product.quantity <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="w-full aspect-square bg-zinc-50 rounded-3xl mb-5 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-100 transition-colors">
                  <Package size={48} />
                </div>
                <h3 className="font-bold text-zinc-900 mb-1 truncate">{product.name}</h3>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{product.category}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-xl text-zinc-900">${product.price.toFixed(2)}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${product.quantity > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {product.quantity} in stock
                  </span>
                </div>
                {product.quantity <= 10 && product.quantity > 0 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-lg">
                    LOW
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[400px] flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-zinc-100 overflow-hidden">
        <div className="p-8 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                <ShoppingCart size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Current Order</h2>
            </div>
            <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest">
              {cart.length} ITEMS
            </span>
          </div>

          {/* Customer Selection */}
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-2xl text-sm font-bold text-zinc-600 outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer"
            >
              <option value="">Walk-in Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-4 opacity-50">
                <ShoppingCart size={64} />
                <p className="text-sm font-bold tracking-tight">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 p-4 bg-zinc-50 rounded-3xl group"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-zinc-300 shadow-sm border border-zinc-100">
                      <Package size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 truncate">{item.name}</h4>
                      <p className="text-xs font-bold text-zinc-400">${item.price.toFixed(2)} each</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-zinc-100 shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item._id, -1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-zinc-50 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-zinc-900">{item.cartQuantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-zinc-50 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 bg-zinc-50 border-t border-zinc-100 space-y-6 rounded-t-[3rem]">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold text-zinc-400">
              <span>Subtotal</span>
              <span className="text-zinc-900">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm font-bold text-zinc-400">
              <div className="flex items-center gap-2">
                <Percent size={14} />
                <span>Discount</span>
              </div>
              <div className="relative w-28">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                <input 
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-zinc-100 rounded-xl text-right text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
            </div>

            <div className="flex justify-between text-sm font-bold text-zinc-400">
              <span>Tax (0%)</span>
              <span className="text-zinc-900">$0.00</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
              <span className="text-lg font-bold text-zinc-900">Total Amount</span>
              <span className="text-3xl font-bold text-zinc-900">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
            className="w-full py-5 bg-black text-white rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/20"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard size={20} />
                Complete Payment
              </>
            )}
          </button>
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
