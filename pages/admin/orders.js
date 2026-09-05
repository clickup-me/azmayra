import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase, formatPrice } from "../../lib/supabase";

function useAdminGuard() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("azmayra_admin")) {
      router.replace("/admin");
    }
  }, [router]);
}

export default function AdminOrders() {
  useAdminGuard();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Head>
        <title>Admin Orders — Azmayra</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)" }}>
        <div style={{ background: "var(--ink)", color: "#fff", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Azmayra Admin</div>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <Link href="/admin/produk" style={{ color: "#fff", opacity: 0.6 }}>Produk</Link>
            <Link href="/admin/orders" style={{ color: "#fff", fontWeight: 600 }}>Orders</Link>
            <Link href="/admin/cs" style={{ color: "#fff", opacity: 0.6 }}>CS</Link>
            <Link href="/" style={{ color: "#fff", opacity: 0.6 }}>← Katalog</Link>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, marginBottom: 24 }}>
            Orders Masuk
          </h1>
          {loading ? (
            <p style={{ color: "var(--ink-light)" }}>Memuat...</p>
          ) : orders.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 40, textAlign: "center", boxShadow: "var(--shadow-card)" }}>
              <p style={{ color: "var(--ink-light)", fontSize: 15 }}>Belum ada order masuk.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((o) => (
                <div key={o.id} style={{
                  background: "#fff", borderRadius: "var(--radius-md)", padding: "20px 24px",
                  boxShadow: "var(--shadow-card)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{o.customer_name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-light)" }}>
