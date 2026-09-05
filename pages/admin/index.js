import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "azmayra2024";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("azmayra_admin", "true");
      router.push("/admin/produk");
    } else {
      setError("Password salah.");
    }
  }

  return (
    <>
      <Head>
        <title>Admin — Azmayra</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)", fontFamily: "var(--font-body)",
      }}>
        <div style={{ width: "100%", maxWidth: 360, padding: "0 24px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 8 }}>Azmayra</div>
          <div style={{ fontSize: 13, color: "var(--ink-light)", marginBottom: 32 }}>Admin Panel</div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="password"
              placeholder="Password admin"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="form-input"
              autoFocus
            />
            {error && <p style={{ fontSize: 13, color: "#E24B4A", margin: 0 }}>{error}</p>}
            <button type="submit" style={{
              padding: "14px", background: "var(--ink)", color: "#fff",
              border: "none", borderRadius: "var(--radius-md)", fontSize: 15,
              fontWeight: 600, cursor: "pointer",
            }}>
              Masuk
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
