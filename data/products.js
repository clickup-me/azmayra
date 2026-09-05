// ============================================
// AZMAYRA — DATA PRODUK
// Edit file ini untuk update katalog
// ============================================

const WA_NUMBER = "6281234567890"; // Ganti dengan nomor WA Azmayra

export const products = [
  {
    slug: "dress-bunga-linen",
    name: "Dress Bunga Linen",
    tagline: "Ringan, adem, cocok untuk hari-hari panjang.",
    price: 285000,
    originalPrice: 350000,
    images: [
      "/images/dress-bunga-linen-1.jpg",
      "/images/dress-bunga-linen-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Sage", hex: "#B2BEA5" },
      { name: "Dusty Rose", hex: "#C9968A" },
      { name: "Putih Tulang", hex: "#F2EDE9" },
    ],
    description:
      "Dress casual berbahan linen premium dengan motif bunga kecil yang lembut. Potongan A-line yang nyaman dipakai seharian — dari kopi pagi hingga makan malam santai.",
    details: [
      "Bahan: Linen premium 100%",
      "Tersedia 3 warna pilihan",
      "Ukuran S–XL",
      "Cuci tangan / mesin program gentle",
    ],
    waMessage: `Halo Azmayra! Saya tertarik dengan *Dress Bunga Linen*. Boleh info ketersediaan stok?`,
    orderPath: "/produk/dress-bunga-linen/order",
    featured: true,
    badge: "Bestseller",
  },
  {
    slug: "blouse-tenun-modern",
    name: "Blouse Tenun Modern",
    tagline: "Kain lokal dengan siluet kontemporer.",
    price: 320000,
    originalPrice: null,
    images: [
      "/images/blouse-tenun-modern-1.jpg",
    ],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Indigo", hex: "#3D4F7C" },
      { name: "Coklat Tanah", hex: "#8B6F5E" },
    ],
    description:
      "Blouse dengan kain tenun ATBM dari pengrajin lokal. Lengan balon yang playful bertemu potongan modern — tampil berbeda tanpa kehilangan kenyamanan.",
    details: [
      "Bahan: Tenun ATBM",
      "Produksi terbatas per batch",
      "Ukuran S–L",
      "Cuci tangan, jemur terbalik",
    ],
    waMessage: `Halo Azmayra! Saya tertarik dengan *Blouse Tenun Modern*. Boleh info ketersediaan stok?`,
    orderPath: "/produk/blouse-tenun-modern/order",
    featured: true,
    badge: "Limited",
  },
  {
    slug: "rok-plisket-midi",
    name: "Rok Plisket Midi",
    tagline: "Flowy, ringan, dan versatile.",
    price: 245000,
    originalPrice: 290000,
    images: [
      "/images/rok-plisket-midi-1.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Hitam", hex: "#1A1A1A" },
      { name: "Caramel", hex: "#C4956A" },
      { name: "Sage", hex: "#B2BEA5" },
    ],
    description:
      "Rok plisket midi yang jatuh sempurna. Bisa dipadukan dengan apa saja — kaos putih untuk casual, atau blouse untuk tampilan lebih rapi.",
    details: [
      "Bahan: Satin plisket",
      "Panjang midi ±80cm",
      "Tersedia 3 warna",
      "Ukusize S–XXL",
    ],
    waMessage: `Halo Azmayra! Saya tertarik dengan *Rok Plisket Midi*. Boleh info ketersediaan stok?`,
    orderPath: "/produk/rok-plisket-midi/order",
    featured: false,
    badge: null,
  },
  {
    slug: "set-piyama-batik",
    name: "Set Piyama Batik",
    tagline: "Tidur nyaman dengan sentuhan budaya.",
    price: 195000,
    originalPrice: null,
    images: [
      "/images/set-piyama-batik-1.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Biru Malam", hex: "#2C3E6B" },
      { name: "Merah Bata", hex: "#A0522D" },
    ],
    description:
      "Set piyama dua potong dengan motif batik cap modern. Bahan rayon yang lembut dan adem — cocok untuk iklim tropis.",
    details: [
      "Bahan: Rayon batik cap",
      "Set terdiri dari atasan + celana panjang",
      "Ukuran S–XL",
      "Cuci tangan",
    ],
    waMessage: `Halo Azmayra! Saya tertarik dengan *Set Piyama Batik*. Boleh info ketersediaan stok?`,
    orderPath: "/produk/set-piyama-batik/order",
    featured: false,
    badge: "Baru",
  },
];

export const waNumber = WA_NUMBER;

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || null;
}

export function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export function buildWALink(product, selectedSize, selectedColor) {
  const size = selectedSize ? `\nUkuran: *${selectedSize}*` : "";
  const color = selectedColor ? `\nWarna: *${selectedColor}*` : "";
  const message = encodeURIComponent(
    `${product.waMessage}${size}${color}\n\nTerima kasih! 🌸`
  );
  return `https://wa.me/${WA_NUMBER}?text=${message}`;
}
