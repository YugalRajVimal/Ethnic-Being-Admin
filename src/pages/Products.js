import React, { useState, useCallback } from "react";
import {
  RiAddLine, RiEditLine, RiDeleteBin6Line, RiStarLine,
} from "react-icons/ri";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/api";
import useFetch from "../hooks/useFetch";
import {
  Card, PageHeader, Btn, Input, Select, Textarea, Table, Pagination,
  Modal, ConfirmModal, Loader, ErrorBox, Empty, SearchInput, Badge,
  statusClass, fmtCurrency,
} from "../components/ui";

const CATEGORIES = ["T-Shirts", "Shirts", "Hoodies", "Bottoms", "Accessories"];
const TAGS       = ["", "SALE", "NEW", "SOLD OUT"];
const SIZES_DEF  = ["XS", "S", "M", "L", "XL", "XXL"];

const emptyForm = () => ({
  name: "", price: "", originalPrice: "", category: "T-Shirts",
  description: "", color: "", tag: "", isFeatured: false,
  sizes: SIZES_DEF.map((s) => ({ size: s, stock: 0 })),
  images: [],
});

const tagClass = (t) => {
  if (t === "SALE") return "badge-red";
  if (t === "NEW")  return "badge-green";
  if (t === "SOLD OUT") return "badge-muted";
  return "badge-muted";
};

export default function Products() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]               = useState(emptyForm());
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [formError, setFormError]     = useState("");

  const fetchFn = useCallback(
    () => getProducts({ page, limit: 15, search, category }),
    [page, search, category]
  );
  const { data, loading, error, refetch } = useFetch(fetchFn, [page, search, category]);

  const products = data?.products || [];
  const total    = data?.total || 0;

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm());
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name || "", price: p.price || "", originalPrice: p.originalPrice || "",
      category: p.category || "T-Shirts", description: p.description || "",
      color: p.color || "", tag: p.tag || "", isFeatured: !!p.isFeatured,
      sizes: p.sizes?.length ? p.sizes : SIZES_DEF.map((s) => ({ size: s, stock: 0 })),
      images: [],
    });
    setFormError("");
    setModalOpen(true);
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setSize = (i, k, v) => {
    const sizes = [...form.sizes];
    sizes[i] = { ...sizes[i], [k]: k === "stock" ? Number(v) : v };
    setField("sizes", sizes);
  };
  const addSize   = () => setField("sizes", [...form.sizes, { size: "", stock: 0 }]);
  const removeSize = (i) => setField("sizes", form.sizes.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      setFormError("Name, price and category are required."); return;
    }
    setSaving(true); setFormError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("originalPrice", form.originalPrice);
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("color", form.color);
      fd.append("tag", form.tag);
      fd.append("isFeatured", form.isFeatured);
      fd.append("sizes", JSON.stringify(form.sizes));
      form.images.forEach((f) => fd.append("images", f));
      if (editProduct) await updateProduct(editProduct._id, fd);
      else             await createProduct(fd);
      setModalOpen(false);
      refetch();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(deleteModal._id);
      setDeleteModal(null);
      refetch();
    } catch (e) { /* ignore */ }
    finally { setDeleting(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Products"
        sub={`${total} total products`}
        action={<Btn onClick={openCreate}><RiAddLine /> New Product</Btn>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search products…"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-eb-surface border border-eb-border rounded-lg px-3 py-2 text-sm text-eb-cream focus:outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <Card>
        {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={refetch} /> : products.length === 0 ? (
          <Empty />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>Category</th>
                  <th>Price</th><th>Tag</th><th>Rating</th><th>Stock</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const inStock = p.inStock !== false;
                  return (
                    <tr key={p._id}>
                      <td>
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-eb-border" />
                        ) : (
                          <div className="w-10 h-10 bg-eb-border rounded-lg" />
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-eb-cream">{p.name}</span>
                          {p.isFeatured && <RiStarLine size={12} className="text-eb-gold" />}
                        </div>
                        <p className="text-xs text-eb-muted font-mono mt-0.5">{p.color}</p>
                      </td>
                      <td><span className="badge badge-muted">{p.category}</span></td>
                      <td>
                        <span className="font-mono text-eb-cream">{fmtCurrency(p.price)}</span>
                        {p.originalPrice > p.price && (
                          <span className="font-mono text-xs text-eb-muted line-through ml-1">{fmtCurrency(p.originalPrice)}</span>
                        )}
                      </td>
                      <td>{p.tag ? <span className={`badge ${tagClass(p.tag)}`}>{p.tag}</span> : "—"}</td>
                      <td className="font-mono text-xs">{p.rating?.toFixed(1) || "—"} <span className="text-eb-muted">({p.reviewCount || 0})</span></td>
                      <td>
                        <span className={inStock ? "badge-green badge" : "badge-red badge"}>
                          {inStock ? "In Stock" : "Out"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Btn size="sm" variant="ghost" onClick={() => openEdit(p)}><RiEditLine size={14} /></Btn>
                          <Btn size="sm" variant="danger" onClick={() => setDeleteModal(p)}><RiDeleteBin6Line size={14} /></Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <div className="px-4 pb-4">
              <Pagination page={page} total={total} limit={15} onChange={setPage} />
            </div>
          </>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? "Edit Product" : "New Product"}
        width="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Product name" className="col-span-2" />
            <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setField("price", e.target.value)} placeholder="999" />
            <Input label="Original Price (₹)" type="number" value={form.originalPrice} onChange={(e) => setField("originalPrice", e.target.value)} placeholder="1299" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setField("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Tag" value={form.tag} onChange={(e) => setField("tag", e.target.value)}>
              {TAGS.map((t) => <option key={t} value={t}>{t || "None"}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Color" value={form.color} onChange={(e) => setField("color", e.target.value)} placeholder="Rust Orange" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">Featured</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)}
                  className="w-4 h-4 accent-eb-terra" />
                <span className="text-sm text-eb-cream">Mark as featured</span>
              </label>
            </div>
          </div>

          <Textarea label="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} placeholder="Product description…" />

          {/* Sizes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">Sizes & Stock</label>
              <Btn size="sm" variant="ghost" onClick={addSize}><RiAddLine size={13} /> Add Size</Btn>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {form.sizes.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    className="flex-1"
                    value={s.size}
                    onChange={(e) => setSize(i, "size", e.target.value)}
                    placeholder="Size"
                  />
                  <Input
                    className="w-28"
                    type="number"
                    value={s.stock}
                    onChange={(e) => setSize(i, "stock", e.target.value)}
                    placeholder="Stock"
                  />
                  <Btn size="sm" variant="danger" onClick={() => removeSize(i)}><RiDeleteBin6Line size={13} /></Btn>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">Images</label>
            <input
              type="file" multiple accept="image/*"
              onChange={(e) => setField("images", Array.from(e.target.files))}
              className="text-sm text-eb-muted file:mr-3 file:bg-eb-border file:text-eb-cream file:border-0 file:rounded file:px-3 file:py-1.5 file:text-xs file:cursor-pointer"
            />
            {form.images.length > 0 && (
              <p className="text-xs text-eb-muted">{form.images.length} file(s) selected</p>
            )}
          </div>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-eb-border">
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editProduct ? "Update Product" : "Create Product"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
