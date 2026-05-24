import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Coupons from "./pages/Coupons";
import Analytics from "./pages/Analytics";
import Inventory from "./pages/Inventory";

const PAGE_MAP = {
  dashboard: Dashboard,
  products:  Products,
  orders:    Orders,
  users:     Users,
  coupons:   Coupons,
  analytics: Analytics,
  inventory: Inventory,
};

const PAGE_TITLES = {
  dashboard: "Dashboard",
  products:  "Products",
  orders:    "Orders",
  users:     "Users",
  coupons:   "Coupons",
  analytics: "Analytics",
  inventory: "Inventory",
};

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage]           = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  // Full-screen loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-eb-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-eb-border border-t-eb-terra rounded-full animate-spin" />
          <p className="text-xs font-mono text-eb-muted uppercase tracking-widest">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const PageComponent = PAGE_MAP[page] || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-eb-bg">
      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <div className="h-16 border-b border-eb-border bg-eb-surface/60 backdrop-blur-sm flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
          <div>
            <h2 className="font-display text-sm font-semibold text-eb-cream">
              {PAGE_TITLES[page] || "Dashboard"}
            </h2>
            <p className="text-xs text-eb-muted font-mono">EthnicBeing Admin</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-eb-green animate-pulse" />
            <span className="text-xs text-eb-muted font-mono hidden sm:block">Live</span>
            <div className="w-8 h-8 rounded-full bg-eb-terra/20 border border-eb-terra/30 flex items-center justify-center">
              <span className="text-xs font-display text-eb-terra font-bold">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
          </div>
        </div>

        {/* Page content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
