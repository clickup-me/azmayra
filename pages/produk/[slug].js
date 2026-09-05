import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import { CTAWAButton } from "../../components/WAButton";
import {
  products,
  getProductBySlug,
  formatPrice,
} from "../../data/products";
import {
  trackViewContent,
  trackContact,
  trackInitiateCheckout,
} from "../../components/MetaPixel";

export async function getStaticPaths() {
  return {
    paths: products.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const product = getProductBySlug(params.slug);
  if (!product) return { notFound: true };
  return { props: { product } };
}

export default function ProductPage({ product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Fire ViewContent on load
  useEffect(() => {
    trackViewContent(product);
  }, [product]);

  function handleOrderClick() {
    trackInitiateCheckout(product, selectedSize, selectedColor?.name);
    // Build order URL with params
    const params = new URLSearchParams();
    if (selectedSize) params.set("size", selectedSize);
    if (selectedColor) params.set("color", selectedColor.name);
    window.location.href = `/produk/${product.slug}/order?${params.toString()}`;
  }

  return (
    <>
      <Head>
        <title>{product.name} — Azmayra</title>
        <meta name="description" content={product.description} />
        {/* OG Tags untuk share ke WA / sosmed */}
        <meta property="og:title" content={`${product.name} — Azmayra`} />
        <meta property="og:description" content={product.tagline} />
        <meta property="og:type" content="product" />
        {product.images?.[0] && (
          <meta property="og:image" content={product.images[0]} />
        )}
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="IDR" />
      </Head>

      <Navbar />

      <main className="product-page">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="product-main-image">
            {product.images?.[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                key={activeImage}
              />
            ) : (
              <div className="img-placeholder">Foto segera hadir</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="product-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`product-thumb ${activeImage === i ? "active" : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          {/* Breadcrumb */}
          <div className="product-breadcrumb">
            <Link href="/">Katalog</Link>
            <span>›</span>
            <span>{product.name}</span>
          </div>

          {/* Name + Tagline */}
          <div>
            <h1 className="product-name">{product.name}</h1>
            <p className="product-tagline">{product.tagline}</p>
          </div>

          {/* Price */}
          <div className="product-price-row">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="product-price-original">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="product-divider" />

          {/* Size Selector */}
          <div>
            <p className="selector-label">
              Ukuran {selectedSize && `— ${selectedSize}`}
            </p>
            <div className="size-options">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? "selected" : ""}`}
                  onClick={() =>
                    setSelectedSize(selectedSize === size ? null : size)
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <p className="selector-label">
              Warna {selectedColor && `— ${selectedColor.name}`}
            </p>
            <div className="color-options">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  className={`color-btn ${selectedColor?.name === color.name ? "selected" : ""}`}
                  onClick={() =>
                    setSelectedColor(
                      selectedColor?.name === color.name ? null : color
                    )
                  }
                >
                  <span
                    className="color-swatch"
                    style={{ background: color.hex }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div className="product-divider" />

          {/* CTA Group — 2 pilihan */}
          <div className="cta-group">
            <CTAWAButton
              message={`${product.waMessage}${selectedSize ? `\nUkuran: *${selectedSize}*` : ""}${selectedColor ? `\nWarna: *${selectedColor.name}*` : ""}\n\nTerima kasih! 🌸`}
              onTrack={() => trackContact(product)}
            />

            <button className="cta-order" onClick={handleOrderClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Pesan Sendiri — Pilih Size & Warna
            </button>

            <p className="cta-note">
              Chat WA untuk tanya stok & negosiasi · Pesan sendiri untuk order langsung
            </p>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <h3>Detail Produk</h3>
            <p style={{ fontSize: 14, color: "var(--ink-light)", marginBottom: 14, lineHeight: 1.6 }}>
              {product.description}
            </p>
            <ul>
              {product.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-logo">Azmayra</div>
        <p>© {new Date().getFullYear()} Azmayra. Dengan ❤️ dari Indonesia.</p>
      </footer>
    </>
  );
}
