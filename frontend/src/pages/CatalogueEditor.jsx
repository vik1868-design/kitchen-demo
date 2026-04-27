// src/pages/CatalogueEditor.jsx
import { useState, useEffect } from "react";
import { fetchProducts, upsertProduct, deleteProduct } from "../lib/api";
import { Card, Btn, Spinner, Empty, C, Field } from "../components/ui";

const CATEGORIES = ["Proteins", "Sauces & Bases", "Bakery & Dough", "Veg Prep", "Dry Supplies", "Other"];

const BLANK = { name: "", category: "Proteins", unit: "unit", kitchen_stock: 0, notes: "", is_available: true };

export default function CatalogueEditor({ onToast }) {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null);  // null | product object
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const load = () => fetchProducts(true).then(setProducts).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew   = () => setEditing({ ...BLANK });
  const openEdit  = (p) => setEditing({ ...p });
  const closeForm = () => setEditing(null);

  const save = async () => {
    if (!editing.name.trim()) return onToast?.("Product name is required.", "error");
    setSaving(true);
    try {
      const saved = await upsertProduct(editing);
      setProducts(prev => {
        const idx = prev.findIndex(p => p.id === saved.id);
        return idx >= 0 ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev];
      });
      onToast?.(`"${saved.name}" saved. ✅`);
      closeForm();
    } catch (err) {
      onToast?.(`Error: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const archive = async (p) => {
    if (!confirm(`Archive "${p.name}"? It will be hidden from ordering but data is kept.`)) return;
    try {
      await deleteProduct(p.id);
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_available: false } : x));
      onToast?.(`"${p.name}" archived.`);
    } catch (err) {
      onToast?.(`Error: ${err.message}`, "error");
    }
  };

  const filtered = products
    .filter(p => catFilter === "all" || p.category === catFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
          style={{ ...C.input, width: 220 }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ ...C.input, width: "auto" }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Btn onClick={openNew} style={{ marginLeft: "auto" }}>+ Add Product</Btn>
      </div>

      {/* Edit / Create form */}
      {editing && (
        <Card style={{ border: "2px solid #1C1C1E" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: "#1C1C1E" }}>
            {editing.id ? `Edit — ${editing.name}` : "New Product"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Field label="Product Name">
              <input value={editing.name} onChange={e => setEditing(x => ({ ...x, name: e.target.value }))}
                placeholder="e.g. Pulled Pork (2kg)" style={C.input} />
            </Field>
            <Field label="Category">
              <select value={editing.category} onChange={e => setEditing(x => ({ ...x, category: e.target.value }))}
                style={C.input}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Unit">
              <input value={editing.unit} onChange={e => setEditing(x => ({ ...x, unit: e.target.value }))}
                placeholder="tray, bag, bottle…" style={C.input} />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" value={editing.kitchen_stock}
                onChange={e => setEditing(x => ({ ...x, kitchen_stock: parseInt(e.target.value) || 0 }))}
                style={C.input} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "end" }}>
            <Field label="Internal Notes (optional)">
              <input value={editing.notes ?? ""} onChange={e => setEditing(x => ({ ...x, notes: e.target.value }))}
                placeholder="e.g. allergen info, prep time…" style={C.input} />
            </Field>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
                <input type="checkbox" checked={editing.is_available}
                  onChange={e => setEditing(x => ({ ...x, is_available: e.target.checked }))} />
                Available for ordering
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={closeForm}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Product"}</Btn>
          </div>
        </Card>
      )}

      {/* Product list */}
      {filtered.length === 0
        ? <Empty icon="🔍" message="No products match." />
        : (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {["Product", "Category", "Unit", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "#9CA3AF" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA", opacity: p.is_available ? 1 : 0.5 }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontWeight: 600, color: "#1C1C1E" }}>{p.name}</span>
                      {p.notes && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9CA3AF", fontStyle: "italic" }}>{p.notes}</p>}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>{p.category}</td>
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>{p.unit}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontWeight: 700, color: p.kitchen_stock < 5 ? "#DC2626" : "#059669" }}>{p.kitchen_stock}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {p.is_available
                        ? <span style={{ fontSize: 11, fontWeight: 700, background: "#D1FAE5", color: "#065F46", padding: "2px 10px", borderRadius: 20 }}>Active</span>
                        : <span style={{ fontSize: 11, fontWeight: 700, background: "#F3F4F6", color: "#9CA3AF", padding: "2px 10px", borderRadius: 20 }}>Archived</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small variant="ghost" onClick={() => openEdit(p)}>Edit</Btn>
                        {p.is_available && <Btn small variant="danger" onClick={() => archive(p)}>Archive</Btn>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      }
    </div>
  );
}
