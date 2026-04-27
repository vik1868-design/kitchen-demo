// src/lib/api.js
// Talks to the local Express API instead of Supabase

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

function getToken() {
  return localStorage.getItem("kitchen_token");
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

const get  = (path)        => request("GET",    path);
const post = (path, body)  => request("POST",   path, body);
const put  = (path, body)  => request("PUT",    path, body);
const patch= (path, body)  => request("PATCH",  path, body);
const del  = (path)        => request("DELETE", path);

// ── Auth ─────────────────────────────────────────────────────

export async function signIn(email, password) {
  const data = await post("/auth/login", { email, password });
  localStorage.setItem("kitchen_token", data.token);
  localStorage.setItem("kitchen_user",  JSON.stringify(data.user));
  return data;
}

export function signOut() {
  localStorage.removeItem("kitchen_token");
  localStorage.removeItem("kitchen_user");
  window.location.reload();
}

export async function getProfile() {
  return get("/auth/me");
}

export function getCachedUser() {
  try {
    const raw = localStorage.getItem("kitchen_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Products ─────────────────────────────────────────────────

export async function fetchProducts(includeUnavailable = false) {
  const data = await get("/products");
  if (!includeUnavailable) return data.filter(p => p.is_available);
  return data;
}

export async function upsertProduct(product) {
  if (product.id) return put(`/products/${product.id}`, product);
  return post("/products", product);
}

export async function deleteProduct(id) {
  return del(`/products/${id}`);
}

// ── Orders ───────────────────────────────────────────────────

export async function fetchOrders({ siteId, status } = {}) {
  const params = new URLSearchParams();
  if (siteId)  params.set("site_id", siteId);
  if (status)  params.set("status",  status);
  const qs = params.toString();
  const raw = await get(`/orders${qs ? "?" + qs : ""}`);
  // normalise shape to match what pages expect
  return raw.map(normaliseOrder);
}

export async function placeOrder({ siteId, deliveryDate, note, items }) {
  const raw = await post("/orders", {
    site_id:       siteId,
    delivery_date: deliveryDate,
    note,
    items: items.map(({ productId, qty }) => ({ product_id: productId, qty })),
  });
  return normaliseOrder(raw);
}

export async function updateOrderStatus(orderId, status) {
  const raw = await patch(`/orders/${orderId}/status`, { status });
  return normaliseOrder(raw);
}

// ── Production Summary ────────────────────────────────────────

export async function fetchProductionSummary(deliveryDate) {
  const rows = await get(`/production?date=${deliveryDate}`);
  return rows.map(r => ({
    product:  { id: r.id, name: r.name, unit: r.unit, category: r.category },
    totalQty: parseInt(r.total_qty),
    sites:    r.site_breakdown,
  }));
}

// ── Sites ─────────────────────────────────────────────────────

export async function fetchSites() {
  return get("/sites");
}

// ── Normalise order shape ─────────────────────────────────────
// API returns flat columns; pages expect nested objects

function normaliseOrder(o) {
  return {
    ...o,
    sites: { id: o.site_id, name: o.site_name, type: o.site_type },
    order_items: (o.items || []).filter(i => i.product_id).map(i => ({
      qty: i.qty,
      products: {
        id:       i.product_id,
        name:     i.product_name,
        unit:     i.product_unit,
        category: i.product_category,
      },
    })),
  };
}
