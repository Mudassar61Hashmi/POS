import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { User, Product } from "./types";
import { Login } from "./pages/Login";
import { POS } from "./pages/POS";
import { Inventory } from "./pages/Inventory";
import { SalesHistory } from "./pages/SalesHistory";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ReceiptModal } from "./components/ReceiptModal";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "sales">("pos");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

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
    <>
      <DashboardLayout 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setUser(null)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === "pos" && (
              <POS 
                user={user} 
                products={products} 
                onCheckout={fetchProducts} 
                onShowReceipt={setSelectedReceipt} 
              />
            )}
            {activeTab === "inventory" && (
              <Inventory 
                products={products} 
                onUpdate={fetchProducts} 
              />
            )}
            {activeTab === "sales" && (
              <SalesHistory 
                onShowReceipt={setSelectedReceipt} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </DashboardLayout>

      <AnimatePresence>
        {selectedReceipt && (
          <ReceiptModal 
            sale={selectedReceipt} 
            onClose={() => setSelectedReceipt(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
