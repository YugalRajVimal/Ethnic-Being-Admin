import React from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  RiMoneyDollarCircleLine, RiShoppingBagLine, RiShirtLine, RiTeamLine,
} from "react-icons/ri";
import { getDashboard } from "../api/api";
import useFetch from "../hooks/useFetch";
import {
  StatCard, Card, Table, Loader, ErrorBox, Empty, PageHeader,
  fmtCurrency, statusClass, fmtStatus,
} from "../components/ui";

const STATUS_COLORS = {
  pending:          "#8C7B6B",
  confirmed:        "#2C6E49",
  processing:       "#C4622D",
  shipped:          "#B8922A",
  out_for_delivery: "#B8922A",
  delivered:        "#2C6E49",
  cancelled:        "#C4362D",
  return_initiated: "#7C4D8C",
  returned:         "#7C4D8C",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-eb-card border border-eb-border rounded-lg px-3 py-2 text-xs font-mono">
      <p className="text-eb-cream">{fmtStatus(payload[0].name)}</p>
      <p className="text-eb-terra">{payload[0].value} orders</p>
    </div>
  );
};

const Dashboard = () => {
  const { data, loading, error, refetch } = useFetch(getDashboard);

  if (loading) return <Loader rows={6} />;
  if (error)   return <ErrorBox message={error} onRetry={refetch} />;

  const { stats = {}, recentOrders = [], ordersByStatus = [] } = data || {};

  const pieData = ordersByStatus.map((o) => ({
    name:  o._id || o.status,
    value: o.count,
  }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Dashboard" sub="Welcome back — here's what's happening at EthnicBeing." />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",  value: fmtCurrency(stats.totalRevenue || 0), icon: RiMoneyDollarCircleLine, accent: "terra" },
          { label: "Total Orders",   value: stats.totalOrders  || 0,               icon: RiShoppingBagLine,       accent: "gold"  },
          { label: "Total Products", value: stats.totalProducts|| 0,               icon: RiShirtLine,             accent: "green" },
          { label: "Total Users",    value: stats.totalUsers   || 0,               icon: RiTeamLine,              accent: "purple"},
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts + recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pie chart */}
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-eb-cream mb-4">Orders by Status</h2>
          {pieData.length === 0 ? (
            <Empty message="No orders yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || "#8C7B6B"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => (
                    <span className="text-xs text-eb-muted font-mono">{fmtStatus(v)}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent orders */}
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-eb-border">
            <h2 className="font-display text-base font-semibold text-eb-cream">Recent Orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <Empty message="No recent orders" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="font-mono text-xs text-eb-terra">#{o._id?.slice(-6).toUpperCase()}</td>
                    <td>{o.user?.name || o.shippingAddress?.name || "—"}</td>
                    <td className="font-mono">{fmtCurrency(o.total)}</td>
                    <td>
                      <span className={statusClass(o.status)}>{fmtStatus(o.status)}</span>
                    </td>
                    <td className="font-mono text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
