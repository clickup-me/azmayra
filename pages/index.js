import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { products, formatPrice } from "../data/products";

function ProductCard({ product }) {
  const badgeClass =
    product.badge === "Baru"
      ? "product-badge new"
      : product.badge === "Limited"
      ? "product-badge limited"
      : "product-badge";

  return (
    <Link href={`/produk/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <div className="img-placeholder">Foto segera hadir</div>
        )}
        {product.badge && (
          <span className={badgeClass}>{product.badge}</span>
        )}
      </div>
      <div className="product-card-body">
        <h2 className="product-card-name">{product.name}</h2>
        <p className="product-card-tagline">{product.tagline}</p>
        <div className="product-card-price">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="price-original">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <span className="product-card-cta">Lihat Produk →</span>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  const [filter, setFilter] = useState("all");

  const displayed =
    filter === "featured"
      ? products.filter((p) => p.featured)
      : products;

  return (
    <>
      <Head>
        <title>Katalog — Azmayra</title>
        <meta
          name="description"
          content="Koleksi fashion Azmayra — pakaian wanita berkualitas dengan sentuhan lokal."
        />
        <meta property="og:title" content="Katalog Azmayra" />
        <meta
          property="og:description"
          content="Temukan koleksi terbaru Azmayra. Fashion wanita lokal berkualitas."
        />
        <meta property="og:type" content="website" />
      </Head>

      <Navbar />

      <main>
        <section className="catalog-hero">
          <h1>
            Koleksi
            <br />
            Azmayra
          </h1>
          <p>Fashion wanita lokal — dibuat dengan bahan pilihan, potongan yang nyaman.</p>

          {/* Filter */}
          <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
            <button
              onClick={() => setFilter("all")}
              style={{
                padding: "8px 18px",
                borderRadius: 100,
                border: "1.5px solid",
                borderColor: filter === "all" ? "var(--ink)" : "var(--border)",
                background: filter === "all" ? "var(--ink)" : "transparent",
                color: filter === "all" ? "#fff" : "var(--ink-light)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("featured")}
              style={{
                padding: "8px 18px",
                borderRadius: 100,
                border: "1.5px solid",
                borderColor:
                  filter === "featured" ? "var(--ink)" : "var(--border)",
                background:
                  filter === "featured" ? "var(--ink)" : "transparent",
                color:
                  filter === "featured" ? "#fff" : "var(--ink-light)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Pilihan Utama
            </button>
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
