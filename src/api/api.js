const BASE = import.meta.env.REACT_APP_API_BASE_URL || "https://ethnicbeingserver.devyugal.in/api/v1";

const token = () => localStorage.getItem("eb_admin_token");

const headers = (isFormData = false) => {
  const h = { Authorization: `Bearer ${token()}` };
  if (!isFormData) h["Content-Type"] = "application/json";
  return h;
};

const req = async (method, path, body = null, isFormData = false) => {
  const opts = { method, headers: headers(isFormData) };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ── AUTH ──────────────────────────────────────────────────────────────
export const authLogin = (email, password) =>
  req("POST", "/auth/login", { email, password });

export const authMe = () => req("GET", "/auth/me");

// ── DASHBOARD ─────────────────────────────────────────────────────────
export const getDashboard = () => req("GET", "/admin/dashboard");

// ── USERS ─────────────────────────────────────────────────────────────
export const getUsers = (params = {}) =>
  req("GET", `/admin/users?${new URLSearchParams(params)}`);

export const getUserById = (id) => req("GET", `/admin/users/${id}`);

export const toggleBlockUser = (id) => req("PUT", `/admin/users/${id}/block`);

// ── PRODUCTS ──────────────────────────────────────────────────────────
export const getProducts = (params = {}) =>
  req("GET", `/products?${new URLSearchParams(params)}`);

export const getProductById = (id) => req("GET", `/products/${id}`);

export const createProduct = (formData) =>
  req("POST", "/products", formData, true);

export const updateProduct = (id, formData) =>
  req("PUT", `/products/${id}`, formData, true);

export const deleteProduct = (id) => req("DELETE", `/products/${id}`);

// ── ORDERS ────────────────────────────────────────────────────────────
export const getAdminOrders = (params = {}) =>
  req("GET", `/orders/admin/all?${new URLSearchParams(params)}`);

export const updateOrderStatus = (id, body) =>
  req("PUT", `/orders/admin/${id}/status`, body);

// ── COUPONS ───────────────────────────────────────────────────────────
export const getCoupons = () => req("GET", "/coupons");

export const createCoupon = (body) => req("POST", "/coupons", body);

export const updateCoupon = (id, body) => req("PUT", `/coupons/${id}`, body);

export const deleteCoupon = (id) => req("DELETE", `/coupons/${id}`);

// ── ANALYTICS ─────────────────────────────────────────────────────────
export const getRevenueAnalytics = (params = {}) =>
  req("GET", `/admin/analytics/revenue?${new URLSearchParams(params)}`);

export const getProductAnalytics = () =>
  req("GET", "/admin/analytics/products");

// ── INVENTORY ─────────────────────────────────────────────────────────
export const getInventory = (params = {}) =>
  req("GET", `/admin/inventory?${new URLSearchParams(params)}`);
