import React, { useState, useCallback } from "react";
import { RiEyeLine, RiEditLine } from "react-icons/ri";
import { getAdminOrders, updateOrderStatus } from "../api/api";
import useFetch from "../hooks/useFetch";
import {
  Card, PageHeader, Btn, Select, Input, Textarea, Table, Pagination,
  Modal, Loader, ErrorBox, Empty, fmtCurrency, statusClass, fmtStatus,
} from "../components/ui";

const STATUSES = [
  "", "pending", "confirmed", "processing", "shipped",
  "out_for_delivery", "delivered", "cancelled",
  "return_initiated", "returned",
];

export default function Orders() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState("");
  const [viewOrder, setViewOrder]   = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm, setStatusForm]   = useState({ status: "", message: "", trackingNumber: "" });
  const [updating, setUpdating]       = useState(false);
  const [updateError, setUpdateError] = useState("");

  const fetchFn = useCallback(
    () => getAdminOrders({ page, limit: 20, status }),
    [page, status]
  );
  const { data, loading, error, refetch } = useFetch(fetchFn, [page, status]);
  const orders = data?.orders || [];
  const total  = data?.total  || 0;

  const openStatus = (o) => {
    setStatusForm({ status: o.status, message: "", trackingNumber: o.trackingNumber || "" });
    setUpdateError("");
    setStatusModal(o);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true); setUpdateError("");
    try {
      await updateOrderStatus(statusModal._id, statusForm);
      setStatusModal(null);
      refetch();
    } catch (e) { setUpdateError(e.message); }
    finally { setUpdating(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Orders" sub={`${total} total orders`} />

      <div className="flex gap-3 flex-wrap">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{fmtStatus(s)}</option>
          ))}
        </select>
      </div>

      <Card>
        {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={refetch} /> : orders.length === 0 ? (
          <Empty />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Items</th>
                  <th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="font-mono text-xs text-eb-terra">#{o._id?.slice(-6).toUpperCase()}</td>
                    <td>
                      <p className="text-eb-cream">{o.shippingAddress?.name || o.user?.name || "—"}</p>
                      <p className="text-xs text-eb-muted">{o.shippingAddress?.phone}</p>
                    </td>
                    <td className="font-mono text-xs">{o.items?.length || 0} items</td>
                    <td className="font-mono">{fmtCurrency(o.total)}</td>
                    <td>
                      <span className={statusClass(o.payment?.status || "pending")}>
                        {o.payment?.method?.toUpperCase()} · {fmtStatus(o.payment?.status)}
                      </span>
                    </td>
                    <td><span className={statusClass(o.status)}>{fmtStatus(o.status)}</span></td>
                    <td className="font-mono text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td>
                      <div className="flex gap-2">
                        <Btn size="sm" variant="ghost" onClick={() => setViewOrder(o)}><RiEyeLine size={14} /></Btn>
                        <Btn size="sm" variant="gold" onClick={() => openStatus(o)}><RiEditLine size={14} /></Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="px-4 pb-4">
              <Pagination page={page} total={total} limit={20} onChange={setPage} />
            </div>
          </>
        )}
      </Card>

      {/* View Order Modal */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details" width="max-w-2xl">
        {viewOrder && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-eb-terra">#{viewOrder._id?.slice(-8).toUpperCase()}</span>
              <span className={statusClass(viewOrder.status)}>{fmtStatus(viewOrder.status)}</span>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-eb-muted mb-3">Items</h3>
              <div className="space-y-2">
                {viewOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-eb-surface rounded-lg p-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-eb-cream">{item.name}</p>
                      <p className="text-xs text-eb-muted font-mono">Size: {item.size} · Qty: {item.qty}</p>
                    </div>
                    <span className="font-mono text-sm text-eb-cream">{fmtCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-eb-surface rounded-lg p-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-eb-muted mb-2">Shipping Address</h3>
                <p className="text-sm text-eb-cream">{viewOrder.shippingAddress?.name}</p>
                <p className="text-xs text-eb-muted">{viewOrder.shippingAddress?.phone}</p>
                <p className="text-xs text-eb-muted mt-1">
                  {viewOrder.shippingAddress?.address}, {viewOrder.shippingAddress?.city},{" "}
                  {viewOrder.shippingAddress?.state} — {viewOrder.shippingAddress?.pincode}
                </p>
              </div>
              <div className="bg-eb-surface rounded-lg p-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-eb-muted mb-2">Payment</h3>
                <p className="text-sm text-eb-cream uppercase">{viewOrder.payment?.method}</p>
                <span className={`${statusClass(viewOrder.payment?.status)} mt-1`}>{fmtStatus(viewOrder.payment?.status)}</span>
                {viewOrder.payment?.razorpayOrderId && (
                  <p className="text-xs text-eb-muted font-mono mt-1 truncate">{viewOrder.payment.razorpayOrderId}</p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-eb-surface rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm text-eb-muted">
                <span>Subtotal</span><span className="font-mono">{fmtCurrency(viewOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-eb-muted">
                <span>Shipping</span><span className="font-mono">{fmtCurrency(viewOrder.shippingFee)}</span>
              </div>
              {viewOrder.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Discount {viewOrder.couponCode && `(${viewOrder.couponCode})`}</span>
                  <span className="font-mono">−{fmtCurrency(viewOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-eb-cream border-t border-eb-border pt-2 mt-2">
                <span>Total</span><span className="font-mono">{fmtCurrency(viewOrder.total)}</span>
              </div>
            </div>

            {viewOrder.trackingNumber && (
              <p className="text-xs text-eb-muted font-mono">Tracking: {viewOrder.trackingNumber}</p>
            )}

            {/* Status History */}
            {viewOrder.statusHistory?.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-eb-muted mb-2">Status History</h3>
                <div className="space-y-1.5">
                  {viewOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className={statusClass(h.status)}>{fmtStatus(h.status)}</span>
                      <span className="text-eb-muted font-mono">{h.message}</span>
                      <span className="text-eb-muted font-mono ml-auto">{h.date ? new Date(h.date).toLocaleDateString("en-IN") : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Update Order Status" width="max-w-md">
        {statusModal && (
          <div className="space-y-4">
            <Select
              label="New Status"
              value={statusForm.status}
              onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUSES.filter(Boolean).map((s) => (
                <option key={s} value={s}>{fmtStatus(s)}</option>
              ))}
            </Select>
            <Input
              label="Tracking Number"
              value={statusForm.trackingNumber}
              onChange={(e) => setStatusForm((f) => ({ ...f, trackingNumber: e.target.value }))}
              placeholder="AWB / tracking #"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">Note (optional)</label>
              <textarea
                value={statusForm.message}
                onChange={(e) => setStatusForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
                placeholder="Customer-facing note…"
                className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream placeholder-eb-muted/50 focus:outline-none focus:border-eb-terra/60 resize-none"
              />
            </div>
            {updateError && <p className="text-sm text-red-400">{updateError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Btn variant="ghost" onClick={() => setStatusModal(null)}>Cancel</Btn>
              <Btn onClick={handleUpdateStatus} disabled={updating}>
                {updating ? "Updating…" : "Update Status"}
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
