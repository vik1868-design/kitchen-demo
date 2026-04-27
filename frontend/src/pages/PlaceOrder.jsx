// src/pages/PlaceOrder.jsx
import { useState, useEffect } from "react";
import { fetchProducts, placeOrder } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { Card, Btn, Field, C, Spinner } from "../components/ui";

const TODAY = new Date().toISOString().split("T")[0];
const CATEGORIES = ["Proteins", "Sauces & Bases", "Bakery & Dough", "Veg Prep", "Dry Supplies", "Other"];

export default function PlaceOrder({ onToast }) {
  const { siteId, siteName } = useAuth();
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(TODAY);
  const [note, setNote]               = useState("");
  const [basket, setBasket]           = useState({});
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    fetchProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const setQty = (pid, val) => {
    const n = Math.max(0, parseInt(val) || 0);
    setBasket(b => n === 0 ? (({ [pid]: _, ...rest }) => rest)(b) : { ...b, [pid]: n });
  };

  const basketItems = Object.entries(basket).filter(([, q]) => q > 0);
  const canSubmit   = siteId && deliveryDate && basketItems.length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await placeOrder({
        siteId,
        deliveryDate,
        note,
        items: basketItems.map(([productId, qty]) => ({ productId, qty })),
      });
      setDone(true);
      setBasket({});
      setNote("");
      onToast?.("Order placed! The kitchen has been notified. ✅");
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      onToast?.(`Error: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const byCat = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat);
    return acc;
  }, {});

  if (loading) return <Spinner />;

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16 }}>
      <div style={{ fontSize: 52 }}>✅</div>
      <p style={{ fontSize: 22, fontWeight: 800, color: "#1C1C1E", margin: 0 }}>Order placed!</p>
      <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>The kitchen has been notified.</p>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
      {/* Left */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#9CA3AF" }}>Order Details</h3>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>📍 {siteName}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Delivery Date">
              <input type="date" value={deliveryDate} min={TODAY}
                onChange={e => setDeliveryDate(e.target.value)} style={C.input} />
            </Field>
            <Field label="Note to Kitchen (optional)">
              <input value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. allergen notes, timing…" style={C.input} />
            </Field>
          </div>
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          {/* Category tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB", overflowX: "auto" }}>
            {CATEGORIES.filter(c => byCat[c]?.length > 0).map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                border: "none", background: "none", cursor: "pointer",
                padding: "12px 18px", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                whiteSpace: "nowrap", color: activeCategory === cat ? "#1C1C1E" : "#9CA3AF",
                borderBottom: activeCategory === cat ? "2px solid #1C1C1E" : "2px solid transparent",
                transition: "color .15s",
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {(byCat[activeCategory] ?? []).map(p => {
              const qty = basket[p.id] || 0;
              return (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10,
                  background: qty > 0 ? "#F0FDF4" : "#F9FAFB",
                  border: `1px solid ${qty > 0 ? "#A7F3D0" : "#E5E7EB"}`,
                  transition: "all .15s",
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1C1C1E" }}>{p.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                      per {p.unit}
                      {p.kitchen_stock > 0
                        ? <span style={{ color: "#10B981", marginLeft: 6 }}>● {p.kitchen_stock} in stock</span>
                        : <span style={{ color: "#EF4444", marginLeft: 6 }}>● Low stock</span>}
                    </p>
                    {p.notes && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9CA3AF", fontStyle: "italic" }}>{p.notes}</p>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Btn small variant="ghost" onClick={() => setQty(p.id, qty - 1)}>−</Btn>
                    <span style={{ width: 28, textAlign: "center", fontWeight: 700, fontSize: 15 }}>{qty}</span>
                    <Btn small variant="ghost" onClick={() => setQty(p.id, qty + 1)}>+</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Basket */}
      <div style={{ position: "sticky", top: 24 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#9CA3AF" }}>Your Basket</h3>
          {basketItems.length === 0
            ? <p style={{ color: "#D1D5DB", fontSize: 14, textAlign: "center", padding: "20px 0", margin: 0 }}>No items added yet</p>
            : <>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {basketItems.map(([pid, qty]) => {
                    const p = products.find(x => x.id === pid);
                    return (
                      <div key={pid} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#374151", fontWeight: 500 }}>{p?.name}</span>
                        <span style={{ fontWeight: 700, color: "#1C1C1E" }}>×{qty}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 10, marginBottom: 16, fontSize: 12, color: "#9CA3AF" }}>
                  {basketItems.length} product type{basketItems.length !== 1 ? "s" : ""}
                </div>
              </>
          }
          <Btn onClick={submit} disabled={!canSubmit} style={{ width: "100%", justifyContent: "center" }}>
            {submitting ? "Placing…" : "Place Order →"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}
