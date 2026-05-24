import React, { useState, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { RiMoneyDollarCircleLine, RiShoppingBagLine } from "react-icons/ri";
import { getRevenueAnalytics, getProductAnalytics } from "../api/api";
import useFetch from "../hooks/useFetch";
import { Card, PageHeader, Loader, ErrorBox, fmtCurrency, StatCard } from "../components/ui";

const today = () => new Date().toISOString().split("T")[0];
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const PRODUCT_COLORS = ["#C4622D", "#B8922A", "#2C6E49", "#7C4D8C", "#8C7B6B"];

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-eb-card border border-eb-border rounded-lg px-3 py-2 text-xs font-mono">
      <p className="text-eb-muted mb-1">{label}</p>
      <p className="text-eb-terra">Revenue: {fmtCurrency(payload[0]?.value || 0)}</p>
      {payload[1] && <p className="text-eb-gold">Orders: {payload[1]?.value}</p>}
    </div>
  );
};

const ProductTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-eb-card border border-eb-border rounded-lg px-3 py-2 text-xs font-mono">
      <p className="text-eb-cream mb-1">{label}</p>
      <p className="text-eb-terra">Units: {payload[0]?.value}</p>
      {payload[1] && <p className="text-eb-gold">Revenue: {fmtCurrency(payload[1]?.value)}</p>}
    </div>
  );
};

export default function Analytics() {
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo]     = useState(today());

  const revFetchFn  = useCallback(() => getRevenueAnalytics({ from, to }), [from, to]);
  const prodFetchFn = useCallback(() => getProductAnalytics(), []);

  const rev  = useFetch(revFetchFn, [from, to]);
  const prod = useFetch(prodFetchFn);

  const daily       = rev.data?.daily || [];
  const totalRevenue = rev.data?.totalRevenue || 0;
  const totalOrders  = daily.reduce((s, d) => s + (d.orders || 0), 0);
  const topProducts  = prod.data?.topProducts || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Analytics" sub="Revenue trends and product performance" />

      {/* Date range */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-eb-muted uppercase tracking-wider">From</label>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream focus:outline-none focus:border-eb-terra/60"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-eb-muted uppercase tracking-wider">To</label>
          <input
            type="date"
            value={to}
            min={from}
            max={today()}
            onChange={(e) => setTo(e.target.value)}
            className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream focus:outline-none focus:border-eb-terra/60"
          />
        </div>
        {/* Quick range buttons */}
        {[
          { label: "7D",  fn: () => { setFrom(daysAgo(7));  setTo(today()); } },
          { label: "30D", fn: () => { setFrom(daysAgo(30)); setTo(today()); } },
          { label: "90D", fn: () => { setFrom(daysAgo(90)); setTo(today()); } },
        ].map(({ label, fn }) => (
          <button
            key={label}
            onClick={fn}
            className="px-3 py-2 text-xs font-mono text-eb-muted bg-eb-surface border border-eb-border rounded-lg hover:text-eb-cream hover:border-eb-terra/40 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Period Revenue" value={fmtCurrency(totalRevenue)} icon={RiMoneyDollarCircleLine} accent="terra" />
        <StatCard label="Period Orders"  value={totalOrders}               icon={RiShoppingBagLine}       accent="gold" />
      </div>

      {/* Revenue area chart */}
      <Card className="p-5">
        <h2 className="font-display text-base font-semibold text-eb-cream mb-4">Daily Revenue</h2>
        {rev.loading ? (
          <div className="h-52 skeleton" />
        ) : rev.error ? (
          <p className="text-sm text-eb-muted text-center py-8">{rev.error}</p>
        ) : daily.length === 0 ? (
          <p className="text-sm text-eb-muted text-center py-8">No data for selected range</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={daily} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C4622D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C4622D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#B8922A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B8922A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2822" />
              <XAxis
                dataKey="_id"
                tick={{ fill: "#8C7B6B", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false} axisLine={false}
              />
              <YAxis
                tick={{ fill: "#8C7B6B", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false} axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#C4622D" fill="url(#revGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="orders"  stroke="#B8922A" fill="url(#ordGrad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Top products bar chart */}
      <Card className="p-5">
        <h2 className="font-display text-base font-semibold text-eb-cream mb-4">Top Products</h2>
        {prod.loading ? (
          <div className="h-52 skeleton" />
        ) : prod.error ? (
          <p className="text-sm text-eb-muted text-center py-8">{prod.error}</p>
        ) : topProducts.length === 0 ? (
          <p className="text-sm text-eb-muted text-center py-8">No product data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 4, right: 40, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2822" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#8C7B6B", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false} axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fill: "#FAF8F4", fontSize: 11, fontFamily: "DM Sans" }}
                tickLine={false} axisLine={false}
              />
              <Tooltip content={<ProductTooltip />} />
              <Bar dataKey="totalQty" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {topProducts.map((_, i) => (
                  <Cell key={i} fill={PRODUCT_COLORS[i % PRODUCT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
