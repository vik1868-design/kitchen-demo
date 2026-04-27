// src/pages/MyOrders.jsx
import { useState, useEffect } from "react";
import { fetchOrders } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { Card, StatusBadge, Spinner, Empty } from "../components/ui";

const fmt = (iso) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function MyOrders() {
  const { siteId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!siteId) return;
    fetchOrders({ siteId }).then(setOrders).finally(() => setLoading(false));
  }, [siteId]);

  if (loading) return <Spinner />;
  if (!orders.length) return <Empty icon="📋" message="No orders placed yet. Head to 'Place Order' to get started." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {orders.map((order, i) => {
        const isExp = expanded === order.id;
        return (
          <Card key={order.id}
            style={{ cursor: "pointer", borderLeft: `4px solid ${isExp ? "#1C1C1E" : "#E5E7EB"}`, transition: "all .15s" }}
            onClick={() => setExpanded(isExp ? null : order.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: "#1C1C1E" }}>{order.order_ref}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
                  Placed {fmt(order.created_at)} · Delivery: <strong style={{ color: "#374151" }}>{order.delivery_date}</strong>
                </p>
                {order.note && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9A3412", background: "#FFF7ED", padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>
                    📌 {order.note}
                  </p>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{isExp ? "▲ hide" : "▼ details"}</span>
            </div>

            {isExp && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {order.order_items?.map(({ qty, products: p }) => (
                    <span key={p.id} style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#F3F4F6", color: "#374151" }}>
                      {p.name} <span style={{ color: "#6B7280" }}>×{qty} {p.unit}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
