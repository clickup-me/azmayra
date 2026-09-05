# Azmayra — Landing Page Katalog

Next.js project siap deploy ke Vercel.

---

## 🚀 Setup & Deploy

### 1. Install dependencies
```bash
npm install
```

### 2. Konfigurasi (wajib sebelum deploy)

**A. Ganti Pixel ID Meta**
Buka `components/MetaPixel.js`, ganti:
```js
export const PIXEL_ID = "YOUR_PIXEL_ID_HERE"; // ← Ganti ini!
```

**B. Ganti Nomor WhatsApp**
Buka `data/products.js`, ganti:
```js
const WA_NUMBER = "6281234567890"; // ← Nomor WA Azmayra (format internasional, tanpa +)
```

**C. Update produk**
Edit array `products` di `data/products.js` — tambah/edit/hapus produk sesuai kebutuhan.

**D. Tambah foto produk**
Simpan foto ke folder `public/images/` dengan nama sesuai yang ada di `data/products.js`.
Contoh: `public/images/dress-bunga-linen-1.jpg`

### 3. Test lokal
```bash
npm run dev
# Buka http://localhost:3000
```

### 4. Deploy ke Vercel
```bash
# Opsi 1: Via Vercel CLI
npm i -g vercel
vercel

# Opsi 2: Push ke GitHub, lalu connect di vercel.com
```

---

## 📁 Struktur File

```
azmayra/
├── data/
│   └── products.js          ← ⭐ Edit ini untuk update produk
├── components/
│   ├── MetaPixel.js         ← ← Pixel ID & event helpers
│   └── Navbar.js
├── pages/
│   ├── index.js             ← Halaman katalog
│   └── produk/
│       ├── [slug].js        ← LP per produk (dengan 2 CTA)
│       └── [slug]/
│           └── order.js     ← Halaman order mandiri
├── styles/
│   └── globals.css          ← Design tokens & CSS
└── public/
    └── images/              ← Simpan foto produk di sini
```

---

## 🛍️ Alur User

```
Katalog (/)
    ↓ klik produk
LP Produk (/produk/[slug])
    ↓ pilih size & warna
    ├── [CTA 1] Chat ke WA  → wa.me/... (dengan info size+warna)
    └── [CTA 2] Pesan Sendiri → /produk/[slug]/order
                                    ↓ isi form
                                    → Kirim via WA dengan detail lengkap
```

---

## 📊 Meta Pixel Events

| Event | Dipicu saat |
|-------|------------|
| `PageView` | Setiap halaman dibuka (otomatis) |
| `ViewContent` | Halaman produk dibuka |
| `Contact` | Klik "Chat ke WhatsApp" |
| `InitiateCheckout` | Klik "Pesan Sendiri" atau submit order form |

---

## ➕ Menambah Produk

Edit `data/products.js`, tambahkan objek baru ke array `products`:

```js
{
  slug: "nama-url-produk",           // URL: /produk/nama-url-produk
  name: "Nama Produk",
  tagline: "Kalimat singkat produk",
  price: 250000,
  originalPrice: 300000,            // null jika tidak ada coret-coretan
  images: ["/images/foto-1.jpg"],
  sizes: ["S", "M", "L", "XL"],
  colors: [
    { name: "Hitam", hex: "#1A1A1A" },
  ],
  description: "Deskripsi panjang produk...",
  details: ["Bahan: ...", "Ukuran: ..."],
  waMessage: "Halo Azmayra! Saya tertarik dengan *Nama Produk*.",
  featured: true,                   // tampil di filter "Pilihan Utama"
  badge: null,                      // null / "Bestseller" / "Baru" / "Limited"
}
```
