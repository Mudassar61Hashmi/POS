import React from "react";
import { User, LogOut, ShoppingCart, Package, History, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";

interface DashboardLayoutProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  children 
}) => {
  const menuItems = [
    { id: "pos", label: "POS Terminal", icon: ShoppingCart },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "sales", label: "Sales History", icon: History },
  ];

  return (
    <div className="flex h-screen bg-[#f5f5f5] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-black/5 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">ProPOS</span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  activeTab === item.id 
                    ? "bg-black text-white shadow-lg shadow-black/10" 
                    : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-black/5">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-4">
            <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center text-gray-400">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.username}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};
