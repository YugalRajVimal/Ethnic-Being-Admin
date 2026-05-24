import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiSearchLine, RiErrorWarningLine, RiInboxLine } from "react-icons/ri";

// ── Status / badge helpers ─────────────────────────────────────────────
export const statusClass = (s = "") => {
  const v = s.toLowerCase();
  if (["delivered", "confirmed", "active", "paid"].includes(v)) return "badge-green";
  if (["shipped", "out_for_delivery"].includes(v))               return "badge-gold";
  if (["processing"].includes(v))                                 return "badge-terra";
  if (["pending"].includes(v))                                    return "badge-muted";
  if (["cancelled", "failed"].includes(v))                        return "badge-red";
  if (["return_initiated", "returned", "refunded"].includes(v))   return "badge-purple";
  return "badge-muted";
};

export const fmtStatus = (s = "") =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const fmtCurrency = (n = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// ── Card ──────────────────────────────────────────────────────────────
export const Card = ({ children, className = "" }) => (
  <div className={`bg-eb-card border border-eb-border rounded-xl shadow-card ${className}`}>
    {children}
  </div>
);

// ── StatCard ──────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, accent = "terra", sub }) => {
  const accentMap = {
    terra:  { ring: "ring-eb-terra/20", icon: "text-eb-terra", glow: "shadow-glow" },
    gold:   { ring: "ring-eb-gold/20",  icon: "text-eb-gold",  glow: "shadow-gold-glow" },
    green:  { ring: "ring-eb-green/20", icon: "text-emerald-400", glow: "" },
    purple: { ring: "ring-eb-purple/20",icon: "text-purple-400", glow: "" },
  };
  const ac = accentMap[accent] || accentMap.terra;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-eb-card border border-eb-border rounded-xl p-5 flex items-start gap-4 ring-1 ${ac.ring} ${ac.glow}`}
    >
      <div className={`mt-0.5 text-2xl ${ac.icon}`}>{Icon && <Icon />}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono uppercase tracking-widest text-eb-muted mb-1">{label}</p>
        <p className="font-display text-2xl font-semibold text-eb-cream truncate">{value}</p>
        {sub && <p className="text-xs text-eb-muted mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
};

// ── Btn ───────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, type = "button", className = "" }) => {
  const base = "inline-flex items-center gap-2 font-body font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  const sz   = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" }[size];
  const vs   = {
    primary:  "bg-eb-terra text-white hover:bg-eb-terra/80 active:scale-95",
    secondary:"bg-eb-border text-eb-cream hover:bg-eb-border/60 active:scale-95",
    ghost:    "text-eb-muted hover:text-eb-cream hover:bg-eb-border/40 active:scale-95",
    danger:   "bg-eb-red/20 text-red-400 border border-eb-red/30 hover:bg-eb-red/30 active:scale-95",
    gold:     "bg-eb-gold/20 text-amber-400 border border-eb-gold/30 hover:bg-eb-gold/30 active:scale-95",
    success:  "bg-eb-green/20 text-emerald-400 border border-eb-green/30 hover:bg-eb-green/30 active:scale-95",
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sz} ${vs} ${className}`}>
      {children}
    </button>
  );
};

// ── Input ─────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = "", ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">{label}</label>}
    <input
      {...props}
      className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream placeholder-eb-muted/50 focus:outline-none focus:border-eb-terra/60 transition-colors"
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ── Select ────────────────────────────────────────────────────────────
export const Select = ({ label, children, className = "", ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">{label}</label>}
    <select
      {...props}
      className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream focus:outline-none focus:border-eb-terra/60 transition-colors"
    >
      {children}
    </select>
  </div>
);

// ── Textarea ──────────────────────────────────────────────────────────
export const Textarea = ({ label, className = "", ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">{label}</label>}
    <textarea
      {...props}
      rows={props.rows || 3}
      className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream placeholder-eb-muted/50 focus:outline-none focus:border-eb-terra/60 transition-colors resize-none"
    />
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = "muted" }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

// ── Table ─────────────────────────────────────────────────────────────
export const Table = ({ children, className = "" }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="eb-table w-full">{children}</table>
  </div>
);

// ── Pagination ────────────────────────────────────────────────────────
export const Pagination = ({ page, total, limit = 20, onChange }) => {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  const items = [];
  for (let i = 1; i <= pages; i++) {
    items.push(
      <button
        key={i}
        onClick={() => onChange(i)}
        className={`w-8 h-8 text-xs font-mono rounded-lg transition-colors ${
          i === page
            ? "bg-eb-terra text-white"
            : "text-eb-muted hover:text-eb-cream hover:bg-eb-border"
        }`}
      >
        {i}
      </button>
    );
  }
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-eb-border">
      <p className="text-xs text-eb-muted font-mono">
        Page {page} of {pages} · {total} total
      </p>
      <div className="flex gap-1">{items}</div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, width = "max-w-2xl" }) => (
  <AnimatePresence>
    {open && (
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-eb-card border border-eb-border rounded-2xl w-full ${width} mx-4 max-h-[90vh] flex flex-col shadow-2xl`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-eb-border">
            <h2 className="font-display text-lg font-semibold text-eb-cream">{title}</h2>
            <button onClick={onClose} className="text-eb-muted hover:text-eb-cream transition-colors">
              <RiCloseLine size={20} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ── Loader ────────────────────────────────────────────────────────────
export const Loader = ({ rows = 5 }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-10 w-full" />
    ))}
  </div>
);

// ── ErrorBox ──────────────────────────────────────────────────────────
export const ErrorBox = ({ message, onRetry }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    <RiErrorWarningLine size={32} className="text-eb-red" />
    <p className="text-sm text-eb-muted">{message}</p>
    {onRetry && (
      <Btn variant="secondary" size="sm" onClick={onRetry}>
        Retry
      </Btn>
    )}
  </div>
);

// ── Empty ─────────────────────────────────────────────────────────────
export const Empty = ({ message = "No data found" }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    <RiInboxLine size={32} className="text-eb-muted/40" />
    <p className="text-sm text-eb-muted">{message}</p>
  </div>
);

// ── SearchInput ───────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = "Search…" }) => (
  <div className="relative">
    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-eb-muted" size={15} />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-eb-surface border border-eb-border rounded-lg pl-9 pr-3 py-2 text-sm text-eb-cream placeholder-eb-muted/50 focus:outline-none focus:border-eb-terra/60 transition-colors w-full"
    />
  </div>
);

// ── PageHeader ────────────────────────────────────────────────────────
export const PageHeader = ({ title, sub, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="font-display text-2xl font-semibold text-eb-cream">{title}</h1>
      {sub && <p className="text-sm text-eb-muted mt-0.5">{sub}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── ConfirmModal ──────────────────────────────────────────────────────
export const ConfirmModal = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
    <p className="text-sm text-eb-muted mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      <Btn variant="danger" onClick={onConfirm} disabled={loading}>
        {loading ? "..." : "Confirm"}
      </Btn>
    </div>
  </Modal>
);
