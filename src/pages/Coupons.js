import React, { useState } from "react";
import { RiAddLine, RiEditLine, RiDeleteBin6Line } from "react-icons/ri";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../api/api";
import useFetch from "../hooks/useFetch";
import {
  Card, PageHeader, Btn, Input, Select, Table, Modal, ConfirmModal,
  Loader, ErrorBox, Empty, fmtCurrency,
} from "../components/ui";

const emptyForm = () => ({
  code: "", discountType: "percentage", discountValue: "",
  minOrderValue: "", maxUses: "", expiresAt: "", isActive: true,
});

export default function Coupons() {
  const { data, loading, error, refetch } = useFetch(getCoupons);
  const coupons = data?.coupons || (Array.isArray(data) ? data : []);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editCoupon, setEditCoupon]     = useState(null);
  const [deleteModal, setDeleteModal]   = useState(null);
  const [form, setForm]                 = useState(emptyForm());
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [formError, setFormError]       = useState("");

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditCoupon(null);
    setForm(emptyForm());
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditCoupon(c);
    setForm({
      code: c.code || "", discountType: c.discountType || "percentage",
      discountValue: c.discountValue || "", minOrderValue: c.minOrderValue || "",
      maxUses: c.maxUses || "", isActive: c.isActive !== false,
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) {
      setFormError("Code and discount value are required."); return;
    }
    setSaving(true); setFormError("");
    try {
      const body = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      };
      if (editCoupon) await updateCoupon(editCoupon._id, body);
      else            await createCoupon(body);
      setModalOpen(false);
      refetch();
    } catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCoupon(deleteModal._id);
      setDeleteModal(null);
      refetch();
    } catch { /* ignore */ }
    finally { setDeleting(false); }
  };

  const isExpired = (d) => d && new Date(d) < new Date();

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Coupons"
        sub={`${coupons.length} coupons`}
        action={<Btn onClick={openCreate}><RiAddLine /> New Coupon</Btn>}
      />

      <Card>
        {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={refetch} /> : coupons.length === 0 ? (
          <Empty message="No coupons created yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Code</th><th>Type</th><th>Value</th>
                <th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="font-mono font-semibold text-eb-terra text-sm">{c.code}</td>
                  <td>
                    <span className="badge badge-muted">{c.discountType}</span>
                  </td>
                  <td className="font-mono font-semibold text-eb-cream">
                    {c.discountType === "percentage"
                      ? `${c.discountValue}%`
                      : fmtCurrency(c.discountValue)}
                  </td>
                  <td className="font-mono text-xs">{c.minOrderValue ? fmtCurrency(c.minOrderValue) : "—"}</td>
                  <td className="font-mono text-xs">
                    {c.usedCount || 0}{c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className={`font-mono text-xs ${isExpired(c.expiresAt) ? "text-red-400" : "text-eb-muted"}`}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "No expiry"}
                  </td>
                  <td>
                    {!c.isActive || isExpired(c.expiresAt) ? (
                      <span className="badge badge-red">Inactive</span>
                    ) : (
                      <span className="badge badge-green">Active</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Btn size="sm" variant="ghost" onClick={() => openEdit(c)}><RiEditLine size={14} /></Btn>
                      <Btn size="sm" variant="danger" onClick={() => setDeleteModal(c)}><RiDeleteBin6Line size={14} /></Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCoupon ? "Edit Coupon" : "New Coupon"}
        width="max-w-md"
      >
        <div className="space-y-4">
          <Input
            label="Coupon Code"
            value={form.code}
            onChange={(e) => setField("code", e.target.value.toUpperCase())}
            placeholder="SUMMER20"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount Type"
              value={form.discountType}
              onChange={(e) => setField("discountType", e.target.value)}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₹)</option>
            </Select>
            <Input
              label={form.discountType === "percentage" ? "Discount %" : "Discount ₹"}
              type="number"
              value={form.discountValue}
              onChange={(e) => setField("discountValue", e.target.value)}
              placeholder={form.discountType === "percentage" ? "20" : "200"}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Order Value (₹)"
              type="number"
              value={form.minOrderValue}
              onChange={(e) => setField("minOrderValue", e.target.value)}
              placeholder="500"
            />
            <Input
              label="Max Uses"
              type="number"
              value={form.maxUses}
              onChange={(e) => setField("maxUses", e.target.value)}
              placeholder="Unlimited"
            />
          </div>
          <Input
            label="Expires At"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setField("expiresAt", e.target.value)}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
              className="w-4 h-4 accent-eb-terra"
            />
            <span className="text-sm text-eb-cream">Active</span>
          </label>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2 border-t border-eb-border">
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editCoupon ? "Update" : "Create Coupon"}
            </Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Coupon"
        message={`Delete coupon "${deleteModal?.code}"? This cannot be undone.`}
      />
    </div>
  );
}
