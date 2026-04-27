// src/pages/ProductionSummary.jsx
import { useState, useEffect } from "react";
import { fetchProductionSummary } from "../lib/api";
import { Card, Spinner, Empty } from "../components/ui";

const TODAY = new Date().toISOString().split("T")[0];

const CATEGORY_ICONS = {
  "Proteins":       "🥩",
  "Sauces & Bases": "🫙",
  "Bakery & Dough": "🍞",
  "Veg Prep":       "🥦",
  "Dry Supplies":   "🧂",
  "Other":          "📦",
};

const STATUS_DOT = {
  pending:   "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#8B5CF6",
  ready:     "#10B981",
};

export default function ProductionSummary() {
  const [date, setDate]       = useState(TODAY);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductionSummary(date)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [date]);

  // Group by category
  const byCategory = summary.reduce((acc, item) => {
    const cat = item.product.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalLines = summary.length;
  const totalUnits = summary.reduce((s, i) => s + i.totalQty, 0);

  const printSummary = () => window.print();

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "#9CA3AF", marginBottom: 6 }}>
            Delivery Date
          </label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontFamily: "inherit", fontSize: 13, color: "#1C1C1E" }} />
        </div>
        <button onClick={printSummary} style={{
          alignSelf: "flex-end", border: "1.5px solid #D1D5DB", background: "#fff",
          borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", color: "#374151",
        }}>
          🖨️ Print / Export PDF
        </button>
        {!loading && (
          <div style={{ alignSelf: "flex-end", fontSize: 13, color: "#6B7280" }}>
            <strong style={{ color: "#1C1C1E" }}>{totalLines}</strong> product types ·{" "}
            <strong style={{ color: "#1C1C1E" }}>{totalUnits}</strong> total units
          </div>
        )}
      </div>

      {/* Print header (only visible when printing) */}
      <div style={{ display: "none" }} className="print-header">
        <h1 style={{ fontFamily: "serif", fontSize: 24 }}>🍴 Central Kitchen — Production Summary</h1>
        <p style={{ fontSize: 14, color: "#6B7280" }}>Delivery date: {date} · Generated {new Date().toLocaleString("en-GB")}</p>
        <hr />
      </div>
      <style>{`@media print { .print-header { display: block !important; } }`}</style>

      {loading
        ? <Spinner />
        : Object.keys(byCategory).length === 0
          ? <Empty icon="🗓️" message={`No active orders for ${date}`} />
          : Object.entries(byCategory).map(([category, items]) => (
              <div key={category} style={{ marginBottom: 28 }}>
                {/* Category header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[category] ?? "📦"}</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".07em", color: "#374151" }}>
                    {category}
                  </h3>
                  <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map(({ product, totalQty, sites }) => (
                    <Card key={product.id} style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        {/* Product name + total */}
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1C1C1E" }}>{product.name}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>per {product.unit}</p>
                          </div>
                          <div style={{ textAlign: "center", background: "#1C1C1E", color: "#fff", borderRadius: 10, padding: "6px 16px", minWidth: 64 }}>
                            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{totalQty}</p>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", opacity: .7 }}>{product.unit}s</p>
                          </div>
                        </div>

                        {/* Per-site breakdown */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {sites.map((s, i) => (
                            <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#374151", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[s.status] ?? "#9CA3AF", flexShrink: 0 }} />
                              {s.name}: ×{s.qty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
      }
    </div>
  );
}
