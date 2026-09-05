import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const WA_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

async function getActiveCSFromDB() {
  const { data } = await supabase.from("cs_config").select("*");
  if (!data?.length) return null;
  const map = {};
  data.forEach((row) => { map[row.key] = row.value; });

  const hour = new Date().getHours();
  const s1 = parseInt(map.cs1_shift_start || 8);
  const e1 = parseInt(map.cs1_shift_end || 16);
  const s2 = parseInt(map.cs2_shift_start || 16);
  const e2 = parseInt(map.cs2_shift_end || 24);

  const inShift = (h, s, e) => s < e ? h >= s && h < e : h >= s || h < e;

  if (inShift(hour, s1, e1)) {
    return { name: map.cs1_name || "CS 1", phone: map.cs1_phone || "" };
  }
  if (inShift(hour, s2, e2)) {
    return { name: map.cs2_name || "CS 2", phone: map.cs2_phone || "" };
  }
  const fallback = map.cs_fallback || "cs1";
  return fallback === "cs1"
    ? { name: map.cs1_name || "CS 1", phone: map.cs1_phone || "" }
    : { name: map.cs2_name || "CS 2", phone: map.cs2_phone || "" };
}

function buildWAUrl(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message || "Halo Azmayra! 🌸")}`;
}

export function CTAWAButton({ message, onTrack }) {
  const [waData, setWaData] = useState(null);

  useEffect(() => {
    getActiveCSFromDB().then((cs) => {
      if (cs) setWaData({ cs, url: buildWAUrl(cs.phone, message) });
    });
  }, [message]);

  function handleClick() {
    if (onTrack) onTrack(waData?.cs);
    if (waData?.url) window.open(waData.url, "_blank");
  }

  return (
    <button className="cta-wa" onClick={handleClick} disabled={!waData}>
      {WA_ICON}
      {waData ? `Chat ke ${waData.cs.name}` : "Chat ke WhatsApp"}
    </button>
  );
}

export function NavbarWAButton() {
  const [waData, setWaData] = useState(null);

  useEffect(() => {
    getActiveCSFromDB().then((cs) => {
      if (cs) setWaData({ cs, url: buildWAUrl(cs.phone) });
    });
  }, []);

  if (!waData) return null;

  return (
    <a href={waData.url} target="_blank" rel="noopener noreferrer" className="navbar-wa" title={`Chat dengan ${waData.cs.name}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      {waData.cs.name}
    </a>
  );
}

export function OrderWAButton({ message, disabled }) {
  const [waData, setWaData] = useState(null);

  useEffect(() => {
    getActiveCSFromDB().then((cs) => {
      if (cs) setWaData({ cs, url: buildWAUrl(cs.phone, message) });
    });
  }, [message]);

  return (
    <button type="submit" disabled={disabled || !waData} style={{
      width: "100%", padding: "16px", background: "var(--wa-green)", color: "#fff",
      borderRadius: "var(--radius-md)", fontSize: 15, fontWeight: 600,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      cursor: disabled ? "not-allowed" : "pointer", border: "none",
      opacity: disabled ? 0.6 : 1, transition: "background 0.2s, opacity 0.2s",
    }}>
      {WA_ICON}
      {waData ? `Kirim Order ke ${waData.cs.name}` : "Kirim Order via WhatsApp"}
    </button>
  );
}
