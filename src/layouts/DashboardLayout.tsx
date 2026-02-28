import React from "react";
import { LayoutDashboard, ShoppingCart, Package, History, LogOut, User as UserIcon } from "lucide-react";
import { User } from "../types";

interface DashboardLayoutProps {
  user: User;
  activeTab: "pos" | "inventory" | "sales";
  setActiveTab: (tab: "pos" | "inventory" | "sales") => void;
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
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-zinc-900 print:bg-white print:block">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col print:hidden">
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
              <UserIcon size={16} />
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
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto print:hidden">
        {children}
      </main>
    </div>
  );
};
