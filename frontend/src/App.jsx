// src/App.jsx
import { useState } from "react";
import { AuthProvider, useAuth, signOut } from "./hooks/useAuth";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import MyOrders from "./pages/MyOrders";
import KitchenBoard from "./pages/KitchenBoard";
import ProductionSummary from "./pages/ProductionSummary";
import CatalogueEditor from "./pages/CatalogueEditor";
import AdminOverview from "./pages/AdminOverview";
import { Spinner, Toast } from "./components/ui";

const NAV = [
  { id: "place-order",   label: "Place Order",        icon: "🛒", roles: ["site_manager"] },
  { id: "my-orders",     label: "My Orders",          icon: "📋", roles: ["site_manager"] },
  { id: "kitchen-board", label: "Kitchen Board",      icon: "👨‍🍳", roles: ["kitchen_staff", "admin"] },
  { id: "production",    label: "Production Summary", icon: "📊", roles: ["kitchen_staff", "admin"] },
  { id: "catalogue",     label: "Catalogue",          icon: "🗂️",  roles: ["kitchen_staff", "admin"] },
  { id: "admin",         label: "All Orders",         icon: "🔍", roles: ["admin"] },
];

function Shell() {
  const { profile, loading } = useAuth();
  const [page, setPage]   = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F4F6" }}>
      <Spinner />
    </div>
  );

  if (!profile) return <Login onLogin={() => window.location.reload()} />;

  const role    = profile.role;
  const allowed = NAV.filter(n => n.roles.includes(role));
  const current = page ?? allowed[0]?.id;
  const pageProps = { onToast: showToast };

  const renderPage = () => {
    switch (current) {
      case "place-order":   return <PlaceOrder {...pageProps} />;
      case "my-orders":     return <MyOrders {...pageProps} />;
      case "kitchen-board": return <KitchenBoard {...pageProps} />;
      case "production":    return <ProductionSummary {...pageProps} />;
      case "catalogue":     return <CatalogueEditor {...pageProps} />;
      case "admin":         return <AdminOverview {...pageProps} />;
      default:              return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Top bar */}
      <div style={{ background: "#1C1C1E", padding: "0 32px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", height: 58, gap: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 32, flexShrink: 0 }}>
            <span style={{ fontSize: 20 }}>🍴</span>
            <span style={{ fontFamily: "'Fraunces', serif", color: "#fff", fontWeight: 900, fontSize: 17, letterSpacing: "-.02em" }}>
              Central Kitchen
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, background: "#F59E0B", color: "#1C1C1E", padding: "2px 7px", borderRadius: 20, letterSpacing: ".04em", textTransform: "uppercase" }}>
              DEMO
            </span>
          </div>

          <nav style={{ display: "flex", gap: 2, flex: 1 }}>
            {allowed.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                border: "none",
                background: current === n.id ? "rgba(255,255,255,.1)" : "transparent",
                color: current === n.id ? "#fff" : "#9CA3AF",
                borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
              }}>
                {n.icon} {n.label}
              </button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>{profile.full_name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em" }}>
                {role.replace("_", " ")}
                {profile.site_name ? ` · ${profile.site_name}` : ""}
              </p>
            </div>
            <button onClick={signOut} style={{
              background: "rgba(255,255,255,.08)", border: "none", color: "#9CA3AF",
              borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>Sign out</button>
          </div>
        </div>
      </div>

      {/* Page heading */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "16px 32px" }}>
          <h1 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: "#1C1C1E", letterSpacing: "-.02em" }}>
            {NAV.find(n => n.id === current)?.icon} {NAV.find(n => n.id === current)?.label}
          </h1>
        </div>
      </div>

      {/* Demo info banner */}
      <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FDE68A", padding: "8px 32px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", fontSize: 12, color: "#92400E", fontWeight: 600 }}>
          🎮 Demo mode · Emails are caught by MailHog at{" "}
          <a href="http://localhost:8025" target="_blank" rel="noreferrer"
            style={{ color: "#92400E", textDecoration: "underline" }}>localhost:8025</a>
          {" "}· All data resets when containers restart
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 32px 60px" }}>
        {renderPage()}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
