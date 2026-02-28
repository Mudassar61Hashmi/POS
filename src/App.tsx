import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  LogOut, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  AlertCircle,
  User,
  ChevronRight,
  X,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---

interface User {
  id: number;
  username: string;
  role: "admin" | "cashier";
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  barcode: string;
}

interface CartItem extends Product {
  cartQuantity: number;
}

interface Sale {
  id: number;
  user_id: number;
  total: number;
  timestamp: string;
  cashier: string;
}

// --- Components ---

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <LayoutDashboard className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">ProPOS Inventory</h1>
          <p className="text-sm text-zinc-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              placeholder="admin or cashier"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              placeholder="admin123 or cashier123"
              required
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <button 
            type="submit"
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const POS = ({ user, products, onCheckout }: { user: User, products: Product[], onCheckout: () => void }) => {
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
        alert("Transaction successful!");
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

const Inventory = ({ products, onUpdate }: { products: Product[], onUpdate: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    barcode: ""
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        category: product.category,
        barcode: product.barcode
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", price: "", quantity: "", category: "", barcode: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity)
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        onUpdate();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        onUpdate();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Inventory Management</h2>
          <p className="text-sm text-zinc-500">Manage your product stock and pricing</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Product</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Category</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Price</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Barcode</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="px-6 py-4 font-medium text-zinc-900">{p.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium">{p.category}</span>
                </td>
                <td className="px-6 py-4 font-mono text-sm">${p.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${p.quantity < 10 ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                    <span className="text-sm">{p.quantity}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-zinc-400">{p.barcode}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(p)} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-lg font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      required
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Category</label>
                    <input 
                      type="text" 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Barcode</label>
                    <input 
                      type="text" 
                      required
                      value={formData.barcode}
                      onChange={e => setFormData({...formData, barcode: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    {editingProduct ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SalesHistory = () => {
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
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 ml-auto">
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

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "sales">("pos");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-zinc-900 leading-none">ProPOS</h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Inventory v1.0</p>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-500">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.username}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab("pos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "pos" ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <ShoppingCart size={20} />
            POS System
          </button>
          
          {user.role === "admin" && (
            <>
              <button 
                onClick={() => setActiveTab("inventory")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "inventory" ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <Package size={20} />
                Inventory
              </button>
              <button 
                onClick={() => setActiveTab("sales")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "sales" ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                <History size={20} />
                Sales History
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button 
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === "pos" && <POS user={user} products={products} onCheckout={fetchProducts} />}
            {activeTab === "inventory" && <Inventory products={products} onUpdate={fetchProducts} />}
            {activeTab === "sales" && <SalesHistory />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
