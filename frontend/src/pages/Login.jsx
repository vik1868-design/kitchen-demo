// src/pages/Login.jsx
import { useState } from "react";
import { signIn } from "../lib/api";
import { Btn, C } from "../components/ui";

const DEMO_ACCOUNTS = [
  { label: "Admin",              email: "admin@kitchen.local",      hint: "All access" },
  { label: "Kitchen Staff",      email: "kitchen@kitchen.local",    hint: "Board, catalogue, production" },
  { label: "The Smokehouse",     email: "smokehouse@kitchen.local", hint: "Site manager" },
  { label: "Spice Route",        email: "spiceroute@kitchen.local", hint: "Site manager" },
  { label: "Burger Bar",         email: "burgerbar@kitchen.local",  hint: "Site manager" },
];

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signIn(email, password);
      onLogin?.(data.user);
    } catch (err) {
      setError(err.message ?? "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (acc) => {
    setEmail(acc.email);
    setPassword("demo1234");
    setError("");
    setLoading(true);
    try {
      const data = await signIn(acc.email, "demo1234");
      onLogin?.(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1C1C1E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🍴</div>
        <h1 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 30, color: "#fff", letterSpacing: "-.02em" }}>Central Kitchen</h1>
        <p style={{ margin: "6px 0 0", color: "#6B7280", fontSize: 14 }}>Order Management System</p>
      </div>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Demo quick-login */}
        <div style={{ background: "#27272A", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#6B7280" }}>
            🎮 Demo accounts — click to log in instantly
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.email} onClick={() => quickLogin(acc)} disabled={loading} style={{
                background: "#3F3F46", border: "1px solid #52525B", borderRadius: 8,
                padding: "9px 14px", cursor: "pointer", fontFamily: "inherit",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "background .15s", color: "#fff",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#52525B"}
                onMouseLeave={e => e.currentTarget.style.background = "#3F3F46"}
              >
                <span style={{ fontWeight: 700, fontSize: 13 }}>{acc.label}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{acc.hint}</span>
              </button>
            ))}
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 11, color: "#52525B", textAlign: "center" }}>All passwords: <code style={{ color: "#9CA3AF" }}>demo1234</code></p>
        </div>

        {/* Manual login */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 28, boxShadow: "0 8px 40px rgba(0,0,0,.4)" }}>
          <h2 style={{ margin: "0 0 20px", fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#1C1C1E" }}>Or sign in manually</h2>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={C.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" style={C.input} />
            </div>
            <div>
              <label style={C.label}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={C.input} />
            </div>
            {error && <p style={{ margin: 0, fontSize: 13, color: "#DC2626", background: "#FEE2E2", padding: "8px 12px", borderRadius: 8 }}>{error}</p>}
            <Btn type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Signing in…" : "Sign in →"}
            </Btn>
          </form>
        </div>
      </div>
    </div>
  );
}
