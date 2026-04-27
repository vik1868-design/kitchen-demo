// src/components/ui.jsx
export const C = {
  // ── Layout ──────────────────────────────────────────────────
  card: (extra = {}) => ({
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    padding: 24,
    ...extra,
  }),

  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1.5px solid #E5E7EB",
    fontFamily: "inherit",
    fontSize: 13,
    color: "#1C1C1E",
    background: "#FAFAFA",
    boxSizing: "border-box",
    outline: "none",
  },

  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    color: "#9CA3AF",
    marginBottom: 6,
  },
};

export function Card({ children, style = {} }) {
  return <div style={{ ...C.card(), ...style }}>{children}</div>;
}

export function Btn({ children, onClick, variant = "primary", small, style = {}, disabled, type = "button" }) {
  const base = {
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 8,
    fontFamily: "inherit",
    fontWeight: 700,
    letterSpacing: ".02em",
    padding: small ? "6px 14px" : "10px 20px",
    fontSize: small ? 12 : 14,
    transition: "opacity .15s",
    opacity: disabled ? 0.45 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
  const variants = {
    primary: { background: "#1C1C1E", color: "#fff" },
    danger:  { background: "#FEE2E2", color: "#991B1B" },
    ghost:   { background: "#F3F4F6", color: "#374151" },
    success: { background: "#D1FAE5", color: "#065F46" },
    warning: { background: "#FEF3C7", color: "#92400E" },
    outline: { background: "transparent", color: "#1C1C1E", border: "1.5px solid #D1D5DB" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending:   { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B", label: "Pending" },
    confirmed: { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6", label: "Confirmed" },
    preparing: { bg: "#EDE9FE", text: "#5B21B6", dot: "#8B5CF6", label: "Preparing" },
    ready:     { bg: "#D1FAE5", text: "#065F46", dot: "#10B981", label: "Ready" },
    delivered: { bg: "#F3F4F6", text: "#374151", dot: "#6B7280", label: "Delivered" },
  };
  const c = map[status] ?? map.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", background: c.bg, color: c.text }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E5E7EB", borderTopColor: "#1C1C1E", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Empty({ icon = "📭", message = "Nothing here yet." }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#D1D5DB" }}>
      <div style={{ fontSize: 40 }}>{icon}</div>
      <p style={{ marginTop: 12, fontWeight: 600, color: "#9CA3AF" }}>{message}</p>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <label style={C.label}>{label}</label>
      {children}
    </div>
  );
}

export function Toast({ message, type = "success", onClose }) {
  const colors = { success: "#065F46", error: "#991B1B", info: "#1E40AF" };
  const bgs    = { success: "#D1FAE5", error: "#FEE2E2", info: "#DBEAFE" };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: bgs[type], color: colors[type],
      padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14,
      boxShadow: "0 4px 20px rgba(0,0,0,.12)", display: "flex", alignItems: "center", gap: 10,
      animation: "slideUp .25s ease",
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
      {message}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
}
