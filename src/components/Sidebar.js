import React from "react";
import { motion } from "framer-motion";
import {
  RiDashboardLine, RiShirtLine, RiShoppingBagLine, RiTeamLine,
  RiCoupon3Line, RiLineChartLine, RiStore2Line, RiMenuFoldLine,
  RiMenuUnfoldLine, RiLogoutBoxLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { id: "dashboard",  label: "Dashboard",  icon: RiDashboardLine },
  { id: "products",   label: "Products",   icon: RiShirtLine },
  { id: "orders",     label: "Orders",     icon: RiShoppingBagLine },
  { id: "users",      label: "Users",      icon: RiTeamLine },
  { id: "coupons",    label: "Coupons",    icon: RiCoupon3Line },
  { id: "analytics",  label: "Analytics",  icon: RiLineChartLine },
  { id: "inventory",  label: "Inventory",  icon: RiStore2Line },
];

const Sidebar = ({ page, setPage, collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex-shrink-0 bg-eb-surface border-r border-eb-border flex flex-col overflow-hidden h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-eb-border gap-3">
        <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-eb-terra/20 border border-eb-terra/30 flex items-center justify-center">
          <span className="text-eb-terra text-sm font-display font-bold">E</span>
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-display font-semibold text-eb-cream text-sm whitespace-nowrap"
          >
            EthnicBeing
          </motion.span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-eb-muted hover:text-eb-cream transition-colors flex-shrink-0"
        >
          {collapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-eb-terra/15 text-eb-terra border border-eb-terra/20"
                  : "text-eb-muted hover:text-eb-cream hover:bg-eb-border/50"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-eb-border p-3">
        {!collapsed && user && (
          <div className="px-2 mb-2">
            <p className="text-xs text-eb-cream font-medium truncate">{user.name}</p>
            <p className="text-xs text-eb-muted truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-eb-muted hover:text-red-400 hover:bg-eb-red/10 transition-all"
        >
          <RiLogoutBoxLine size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
