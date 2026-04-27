// src/pages/AdminOverview.jsx
import { useState, useEffect, useMemo } from "react";
import { fetchOrders, updateOrderStatus } from "../lib/api";
import { Card, StatusBadge, Btn, Spinner, Empty } from "../components/ui";

const fmt = (iso) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "delivered"];

export default function AdminOverview({ onToast }) {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterSite, setFilterSite]     = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchOrders().then(data => setOrders(data ?? [])).finally(() => setLoading(false));
  }, []);

  const advance = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    try {
      await updateOrderStatus(order.id, next);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
      onToast?.(`${order.order_ref} → ${next}`);
    } catch (err) {
      onToast?.(`Error: ${err.message}`, "error");
    }
  };

  const sites = useMemo(() => {
    const map = {};
    orders.forEach(o => { if (o.sites) map[o.site_id] = o.sites.name; });
    return map;
  }, [orders]);

  const filtered = useMemo(() =>
    orders
      .filter(o => filterSite === "all" || o.site_id === filterSite)
      .filter(o => filterStatus === "all" || o.status === filterStatus)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [orders, filterSite, filterStatus]
  );

  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    active:    orders.filter(o => !["pending", "delivered"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
  }), [orders]);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Orders",     value: stats.total,     color: "#1C1C1E" },
          { label: "Awaiting Confirm", value: stats.pending,   color: "#D97706" },
          { label: "In Progress",      value: stats.active,    color: "#7C3AED" },
          { label: "Delivered",        value: stats.delivered, color: "#059669" },
        ].map(s => (
          <Card key={s.label} style={{ padding: 18, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 34, fontWeight: 900, color: s.color }}>{s.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "#9CA3AF" }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontFamily: "inherit", fontSize: 13, color: "#374151" }}>
          <option value="all">All Sites</option>
          {Object.entries(sites).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontFamily: "inherit", fontSize: 13, color: "#374151" }}>
          <option value="all">All Statuses</option>
          {STATUS_FLOW.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span style={{ fontSize: 13, color: "#9CA3AF", marginLeft: 4 }}>{filtered.length} order{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {filtered.length === 0
        ? <Empty icon="📊" message="No orders match these filters." />
        : (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {["Order", "Site", "Placed", "Delivery", "Items", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "#9CA3AF" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.flatMap(order => {
                  const isExp = expanded === order.id;
                  const next  = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                  return [
                    <tr key={order.id} onClick={() => setExpanded(isExp ? null : order.id)}
                      style={{ borderBottom: "1px solid #F3F4F6", cursor: "pointer", background: isExp ? "#FAFAFA" : "#fff" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1C1C1E" }}>{order.order_ref}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontWeight: 600 }}>{order.sites?.name}</span><br />
                        <span style={{ color: "#9CA3AF", fontSize: 11 }}>{order.sites?.type}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6B7280" }}>{fmt(order.created_at)}</td>
                      <td style={{ padding: "12px 16px", color: "#374151", fontWeight: 600 }}>{order.delivery_date}</td>
                      <td style={{ padding: "12px 16px", color: "#6B7280" }}>{order.order_items?.length ?? 0} lines</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={order.status} /></td>
                      <td style={{ padding: "12px 16px" }}>
                        {next
                          ? <Btn small variant="ghost" onClick={e => { e.stopPropagation(); advance(order); }}>→ {next}</Btn>
                          : <span style={{ fontSize: 12, color: "#D1D5DB" }}>Complete</span>}
                      </td>
                    </tr>,
                    isExp && (
                      <tr key={order.id + "-exp"} style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        <td colSpan={7} style={{ padding: "12px 24px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {order.order_items?.map(({ qty, products: p }) => (
                              <span key={p.id} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "#E5E7EB", color: "#374151", fontWeight: 600 }}>
                                {p.name} ×{qty} {p.unit}
                              </span>
                            ))}
                          </div>
                          {order.note && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9A3412" }}>📌 {order.note}</p>}
                        </td>
                      </tr>
                    ),
                  ].filter(Boolean);
                })}
              </tbody>
            </table>
          </Card>
        )
      }
    </div>
  );
}
