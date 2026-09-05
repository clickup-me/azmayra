// ============================================
// AZMAYRA — KONFIGURASI CS & ROTATOR
// Edit file ini untuk update nomor & jam shift
// ============================================

export const csConfig = {
  // ── CS 1 ──────────────────────────────────
  cs1: {
    name: "Kak Sari",               // Nama CS (muncul di tombol WA)
    phone: "6281111111111",          // Format: 62xxxxxxxxxx (tanpa +)
    avatar: "S",                     // Inisial untuk avatar
    color: "#C9968A",                // Warna avatar (accent Azmayra)
    shift: {
      start: 8,                      // Jam mulai shift (format 24 jam)
      end: 16,                       // Jam selesai shift
    },
  },

  // ── CS 2 ──────────────────────────────────
  cs2: {
    name: "Kak Rina",
    phone: "6282222222222",
    avatar: "R",
    color: "#8A968A",
    shift: {
      start: 16,
      end: 24,                       // 24 = tengah malam
    },
  },

  // ── Fallback (di luar jam shift keduanya) ─
  // Jika jam tidak masuk shift manapun, gunakan CS ini
  fallback: "cs1",                   // "cs1" atau "cs2"

  // ── Pesan default di WA ───────────────────
  defaultGreeting: "Halo Azmayra! Saya ingin bertanya tentang produk 🌸",
};

// ============================================
// HELPER — jangan diubah
// ============================================

/**
 * Ambil CS aktif berdasarkan jam lokal pengunjung
 * @returns {object} CS yang sedang shift
 */
export function getActiveCS() {
  const now = new Date();
  const hour = now.getHours(); // 0–23, waktu lokal device

  const { cs1, cs2, fallback } = csConfig;

  // Cek CS1
  if (isInShift(hour, cs1.shift)) return { ...cs1, key: "cs1" };

  // Cek CS2 (handle midnight wrap: misal 16–24 atau 22–6)
  if (isInShift(hour, cs2.shift)) return { ...cs2, key: "cs2" };

  // Fallback
  return { ...csConfig[fallback], key: fallback };
}

function isInShift(hour, shift) {
  const { start, end } = shift;
  if (start < end) {
    // Normal: 8–16, 16–24
    return hour >= start && hour < end;
  } else {
    // Midnight wrap: 22–6
    return hour >= start || hour < end;
  }
}

/**
 * Build WA link untuk CS aktif
 * @param {string} message - Pesan custom (opsional)
 */
export function buildCSWALink(message) {
  const cs = getActiveCS();
  const text = encodeURIComponent(message || csConfig.defaultGreeting);
  return {
    cs,
    url: `https://wa.me/${cs.phone}?text=${text}`,
  };
}
