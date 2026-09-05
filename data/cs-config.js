// ============================================
// AZMAYRA — KONFIGURASI CS & ROTATOR
// Nomor WA diambil dari Environment Variables
// Set di Vercel Dashboard > Settings > Environment Variables
// ============================================

const CS1_PHONE = process.env.NEXT_PUBLIC_CS1_PHONE || "6281111111111";
const CS2_PHONE = process.env.NEXT_PUBLIC_CS2_PHONE || "6282222222222";
const CS1_NAME  = process.env.NEXT_PUBLIC_CS1_NAME  || "Kak Sari";
const CS2_NAME  = process.env.NEXT_PUBLIC_CS2_NAME  || "Kak Rina";

export const csConfig = {
  cs1: {
    name: CS1_NAME,
    phone: CS1_PHONE,
    avatar: CS1_NAME.charAt(CS1_NAME.lastIndexOf(" ") + 1) || "S",
    color: "#C9968A",
    shift: { start: 8, end: 16 },
  },
  cs2: {
    name: CS2_NAME,
    phone: CS2_PHONE,
    avatar: CS2_NAME.charAt(CS2_NAME.lastIndexOf(" ") + 1) || "R",
    color: "#8A968A",
    shift: { start: 16, end: 24 },
  },
  fallback: "cs1",
  defaultGreeting: "Halo Azmayra! Saya ingin bertanya tentang produk 🌸",
};

export function getActiveCS() {
  const hour = new Date().getHours();
  const { cs1, cs2, fallback } = csConfig;
  if (isInShift(hour, cs1.shift)) return { ...cs1, key: "cs1" };
  if (isInShift(hour, cs2.shift)) return { ...cs2, key: "cs2" };
  return { ...csConfig[fallback], key: fallback };
}

function isInShift(hour, shift) {
  const { start, end } = shift;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

export function buildCSWALink(message) {
  const cs = getActiveCS();
  const text = encodeURIComponent(message || csConfig.defaultGreeting);
  return { cs, url: `https://wa.me/${cs.phone}?text=${text}` };
}
