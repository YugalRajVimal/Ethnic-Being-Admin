import React, { useState, useCallback } from "react";
import { RiAlertLine } from "react-icons/ri";
import { getInventory } from "../api/api";
import useFetch from "../hooks/useFetch";
import { Card, PageHeader, Loader, ErrorBox, Empty, Table } from "../components/ui";

export default function Inventory() {
  const [threshold, setThreshold] = useState(5);
  const [input, setInput]         = useState("5");

  const fetchFn = useCallback(
    () => getInventory({ threshold }),
    [threshold]
  );
  const { data, loading, error, refetch } = useFetch(fetchFn, [threshold]);
  const lowStock = data?.lowStock || [];

  const apply = () => {
    const n = parseInt(input, 10);
    if (!isNaN(n) && n >= 0) setThreshold(n);
  };

  const stockColor = (n) => {
    if (n === 0) return "text-red-400 font-semibold";
    if (n <= 2)  return "text-red-400";
    return "text-amber-400";
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Inventory"
        sub="Products with low stock levels across sizes"
      />

      {/* Threshold control */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">
          Low Stock Threshold
        </label>
        <input
          type="number"
          min={0}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream w-20 focus:outline-none focus:border-eb-terra/60"
        />
        <button
          onClick={apply}
          className="px-4 py-2 text-xs font-mono bg-eb-terra/20 text-eb-terra border border-eb-terra/30 rounded-lg hover:bg-eb-terra/30 transition-colors"
        >
          Apply
        </button>
        <span className="text-xs text-eb-muted">
          Showing sizes with ≤ {threshold} units
        </span>
      </div>

      {/* Summary banner */}
      {!loading && !error && lowStock.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <RiAlertLine size={18} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-400">
            <span className="font-semibold">{lowStock.length} product{lowStock.length !== 1 ? "s" : ""}</span>
            {" "}have low stock below threshold of {threshold} units.
          </p>
        </div>
      )}

      <Card>
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorBox message={error} onRetry={refetch} />
        ) : lowStock.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-eb-green/10 border border-eb-green/20 flex items-center justify-center">
              <span className="text-emerald-400 text-xl">✓</span>
            </div>
            <p className="text-sm text-eb-muted">All products are sufficiently stocked!</p>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Low Stock Sizes</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p, i) => (
                <tr key={p._id || i}>
                  <td className="text-eb-cream font-medium">{p.name}</td>
                  <td>
                    <span className="badge badge-muted">{p.category}</span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {(p.lowSizes || []).map((s, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-1 bg-eb-surface border border-eb-border rounded-lg px-2 py-1"
                        >
                          <span className="text-xs font-mono text-eb-cream">{s.size}</span>
                          <span className="text-eb-border">·</span>
                          <span className={`text-xs font-mono font-bold ${stockColor(s.stock)}`}>
                            {s.stock === 0 ? "OUT" : s.stock}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
