import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  History, 
  BarChart3, 
  LogOut,
  User as UserIcon
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/pos", icon: ShoppingCart, label: "Point of Sale" },
    { path: "/inventory", icon: Package, label: "Inventory" },
    { path: "/customers", icon: Users, label: "Customers" },
    { path: "/sales", icon: History, label: "Sales History" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-zinc-100 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20">
              <ShoppingCart size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900">PrimePOS</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-black text-white shadow-lg shadow-black/10" 
                      : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-zinc-50 p-6 rounded-[2rem] mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 shadow-sm border border-zinc-100">
                <UserIcon size={24} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-zinc-900 truncate">{user.username || "User"}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{user.role || "Staff"}</span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-100 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
