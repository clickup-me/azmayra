import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { getProducts, formatPrice } from "../lib/supabase";

function ProductCard({ product }) {
  const badgeClass =
    product.badge === "Baru" ? "product-badge new"
    : product.badge === "Limited" ? "product-badge limited"
    : "product-badge";

  return (
    <Link href={`/produk/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <div className="img-placeholder">Foto segera hadir</div>
        )}
        {product.badge && <span className={badgeClass}>{product.badge}</span>}
      </div>
      <div className="product-card-body">
        <h2 className="product-card-name">{product.name}</h2>
        <p className="product-card-tagline">{product.tagline}</p>
        <div className="product-card-price">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="price-original">{formatPrice(product.original_price)}</span>
          )}
        </div>
        <span className="product-card-cta">Lihat Produk →</span>
      </div>
    </Link>
  );
}

export async function getStaticProps() {
  try {
    const products = await getProducts();
    return { props: { products }, revalidate: 60 };
  } catch {
    return { props: { products: [] }, revalidate: 60 };
  }
}

export default function CatalogPage({ products }) {
  const [filter, setFilter] = useState("all");
  const displayed = filter === "featured" ? products.filter((p) => p.featured) : products;

  return (
    <>
      <Head>
        <title>Katalog — Azmayra</title>
        <meta name="description" content="Koleksi fashion Azmayra — pakaian wanita berkualitas dengan sentuhan lokal." />
        <meta property="og:title" content="Katalog Azmayra" />
        <meta property="og:type" content="website" />
      </Head>
      <Navbar />
      <main>
        <section className="catalog-hero">
          <h1>Koleksi<br />Azmayra</h1>
          <p>Fashion wanita lokal — dibuat dengan bahan pilihan, potongan yang nyaman.</p>
          <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
            {["all", "featured"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "8px 18px", borderRadius: 100, border: "1.5px solid",
                borderColor: filter === f ? "var(--ink)" : "var(--border)",
                background: filter === f ? "var(--ink)" : "transparent",
                color: filter === f ? "#fff" : "var(--ink-light)",
                fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              }}>
                {f === "all" ? "Semua" : "Pilihan Utama"}
              </button>
            ))}
          </div>
        </section>
        <section className="catalog-grid">
          {displayed.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </section>
      </main>
      <footer className="footer">
        <div className="footer-logo">Azmayra</div>
        <p>© {new Date().getFullYear()} Azmayra. Dengan ❤️ dari Indonesia.</p>
      </footer>
    </>
  );
}
