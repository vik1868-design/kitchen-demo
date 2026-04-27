// src/pages/KitchenBoard.jsx
import { useState, useEffect, useCallback } from "react";
import { fetchOrders, updateOrderStatus } from "../lib/api";
import { Card, StatusBadge, Btn, Spinner, Empty } from "../components/ui";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "delivered"];
const fmt = (iso) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const ACCENT = { pending: "#F59E0B", confirmed: "#3B82F6", preparing: "#8B5CF6", ready: "#10B981", delivered: "#6B7280" };

export default function KitchenBoard({ onToast }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("active"); // active | all

  const load = useCallback(() => {
    fetchOrders()
      .then(data => setOrders(data ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const visible = orders
    .filter(o => filter === "active" ? o.status !== "delivered" : true)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
        {["active", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            border: "none", cursor: "pointer", borderRadius: 8, padding: "7px 16px",
            fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            background: filter === f ? "#1C1C1E" : "#F3F4F6",
            color: filter === f ? "#fff" : "#6B7280",
          }}>
            {f === "active" ? "Active Orders" : "All Orders"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#9CA3AF" }}>
          {visible.length} order{visible.length !== 1 ? "s" : ""}
        </span>
        <Btn small variant="ghost" onClick={load}>↻ Refresh</Btn>
      </div>

      {visible.length === 0
        ? <Empty icon="🍽️" message="No active orders — all clear!" />
        : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {visible.map(order => {
              const next = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
              const accent = ACCENT[order.status];
              return (
                <Card key={order.id} style={{ borderLeft: `4px solid ${accent}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: 16, color: "#1C1C1E" }}>{order.order_ref}</span>
                        <StatusBadge status={order.status} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", background: "#F3F4F6", padding: "2px 10px", borderRadius: 20 }}>
                          📍 {order.sites?.name}
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
                        Delivery: <strong style={{ color: "#374151" }}>{order.delivery_date}</strong>
                        &nbsp;·&nbsp;Placed {fmt(order.created_at)}
                      </p>
                      {order.note && (
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9A3412", background: "#FFF7ED", padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>
                          📌 {order.note}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {next && (
                        <Btn onClick={() => advance(order)} variant={next === "delivered" ? "success" : "primary"} small>
                          Mark as {next} →
                        </Btn>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {order.order_items?.map(({ qty, products: p }) => (
                      <span key={p.id} style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#F3F4F6", color: "#374151" }}>
                        {p.name} <span style={{ color: "#6B7280" }}>×{qty} {p.unit}</span>
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
      }
    </div>
  );
}
