import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../../../components/Navbar";
import { OrderWAButton } from "../../../components/WAButton";
import { getProducts, getProductBySlug, formatPrice } from "../../../lib/supabase";
import { trackInitiateCheckout } from "../../../components/MetaPixel";

export async function getStaticPaths() {
  const products = await getProducts();
  return {
    paths: products.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { notFound: true };
  return { props: { product }, revalidate: 60 };
}

export default function OrderPage({ product }) {
  const router = useRouter();
  const { size: querySize, color: queryColor } = router.query;

  const [form, setForm] = useState({
    name: "", phone: "", address: "",
    size: querySize || "", color: queryColor || "", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.size || !form.color) {
      alert("Mohon lengkapi nama, nomor WA, ukuran, dan warna.");
      return;
    }
    trackInitiateCheckout(product, form.size, form.color);
    setSubmitted(true);
  }

  const isDisabled = !form.name || !form.phone || !form.size || !form.color;

  if (submitted) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🌸</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, marginBottom: 12 }}>Pesanan Terkirim!</h1>
          <p style={{ color: "var(--ink-light)", marginBottom: 32 }}>
            Detail ordermu sudah dikirim ke WhatsApp Azmayra. Tim kami akan membalas segera.
          </p>
          <Link href="/" style={{ display: "inline-block", padding: "12px 28px", background: "var(--ink)", color: "#fff", borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 500 }}>
            ← Kembali ke Katalog
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Pesan {product.name} — Azmayra</title>
      </Head>
      <Navbar />
      <main className="order-page">
        <div>
          <Link href={`/produk/${product.slug}`} style={{ fontSize: 13, color: "var(--ink-light)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            ← Kembali ke produk
          </Link>
          <h1>{product.name}</h1>
          <p className="subtitle">Isi form di bawah — pesananmu akan dikirim langsung ke WhatsApp Azmayra.</p>
        </div>

        <form className="order-form" onSubmit={handleSubmit}>
          {/* Order Summary */}
          <div className="order-summary">
            <div className="order-summary-row">
              <span style={{ color: "var(--ink-light)" }}>Produk</span>
              <span style={{ fontWeight: 500 }}>{product.name}</span>
            </div>
            <div className="order-summary-row">
              <span style={{ color: "var(--ink-light)" }}>Harga</span>
              <span>{formatPrice(product.price)}</span>
            </div>
            {form.size && <div className="order-summary-row"><span style={{ color: "var(--ink-light)" }}>Ukuran</span><span>{form.size}</span></div>}
            {form.color && <div className="order-summary-row"><span style={{ color: "var(--ink-light)" }}>Warna</span><span>{form.color}</span></div>}
            <div className="order-summary-row total"><span>Total</span><span>{formatPrice(product.price)}</span></div>
          </div>

          {/* Size */}
          <div className="form-group">
            <label>Ukuran *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {product.sizes?.map((size) => (
                <button key={size} type="button"
                  className={`size-btn ${form.size === size ? "selected" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, size }))}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="form-group">
            <label>Warna *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {product.colors?.map((color) => (
                <button key={color.name} type="button"
                  className={`color-btn ${form.color === color.name ? "selected" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, color: color.name }))}>
                  <span className="color-swatch" style={{ background: color.hex }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="form-group">
            <label>Nama Lengkap *</label>
            <input className="form-input" type="text" name="name" placeholder="Nama kamu" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nomor WhatsApp *</label>
            <input className="form-input" type="tel" name="phone" placeholder="08xxxxxxxxxx" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Alamat Pengiriman</label>
            <textarea className="form-input" name="address" placeholder="Alamat lengkap + kode pos" value={form.address} onChange={handleChange} rows={3} style={{ resize: "vertical" }} />
          </div>
          <div className="form-group">
            <label>Catatan (opsional)</label>
            <input className="form-input" type="text" name="notes" placeholder="Contoh: jangan lipat, paket kado, dll." value={form.notes} onChange={handleChange} />
          </div>

          <OrderWAButton product={product} form={form} disabled={isDisabled} />

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-light)" }}>
            Pesananmu akan dikirim ke WA Azmayra. Konfirmasi stok & pembayaran menyusul via chat.
          </p>
        </form>
      </main>
      <footer className="footer">
        <div className="footer-logo">Azmayra</div>
        <p>© {new Date().getFullYear()} Azmayra. Dengan ❤️ dari Indonesia.</p>
      </footer>
    </>
  );
}
