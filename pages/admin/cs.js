import { useState, useEffect } from "react";
import Head from "next/head";
import { csConfig, getActiveCS } from "../../data/cs-config";

// ============================================
// HALAMAN ADMIN — Setting & Monitor CS
// URL: /admin/cs
// Tidak terindex Google (noindex)
// ============================================

function ClockDisplay() {
  const [time, setTime] = useState("");
  const [activeCS, setActiveCS] = useState(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
      setActiveCS(getActiveCS());
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return { time, activeCS };
}

function ShiftBar({ shift, csKey, activeKey }) {
  const isActive = csKey === activeKey;
  const { start, end } = shift;
  const duration = end > start ? end - start : 24 - start + end;
  const leftPct = (start / 24) * 100;
  const widthPct = (duration / 24) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        top: 0,
        bottom: 0,
        background: isActive
          ? "var(--accent)"
          : "rgba(201,150,138,0.25)",
        borderRadius: 4,
        transition: "background 0.3s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: isActive ? "#fff" : "var(--ink-light)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          padding: "0 6px",
        }}
      >
        {start}:00 – {end === 24 ? "00:00" : `${end}:00`}
      </span>
    </div>
  );
}

export default function CSAdminPage() {
  const [time, setTime] = useState("");
  const [activeCS, setActiveCS] = useState(null);
  const [testHour, setTestHour] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
      setActiveCS(getActiveCS());
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Simulasi jam tertentu
  function simulateHour(hour) {
    setTestHour(hour);
    // Simulasi manual (di luar getActiveCS karena config static)
    const { cs1, cs2, fallback } = csConfig;
    function inShift(h, s) {
      return s.start < s.end ? h >= s.start && h < s.end : h >= s.start || h < s.end;
    }
    if (inShift(hour, cs1.shift)) setActiveCS({ ...cs1, key: "cs1" });
    else if (inShift(hour, cs2.shift)) setActiveCS({ ...cs2, key: "cs2" });
    else setActiveCS({ ...csConfig[fallback], key: fallback });
  }

  function resetSimulate() {
    setTestHour(null);
    setActiveCS(getActiveCS());
  }

  const now = new Date();
  const hourNow = now.getHours();
  const minuteNow = now.getMinutes();
  const nowPct = ((hourNow * 60 + minuteNow) / (24 * 60)) * 100;

  return (
    <>
      <Head>
        <title>CS Panel — Azmayra Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          fontFamily: "var(--font-body)",
          padding: "0 0 60px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "var(--ink)",
            color: "#fff",
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>
              Azmayra
            </div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
              CS Rotator Panel
            </div>
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: 2,
              opacity: 0.8,
            }}
          >
            {time}
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>

          {/* Active CS Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              padding: 28,
              marginBottom: 28,
              boxShadow: "var(--shadow-card)",
              border: "2px solid var(--accent)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "var(--ink-light)", marginBottom: 14, textTransform: "uppercase" }}>
              {testHour !== null ? `⚡ Simulasi Jam ${testHour}:00` : "✅ CS Aktif Sekarang"}
            </div>
            {activeCS && (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: activeCS.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 22,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {activeCS.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 400, marginBottom: 4 }}>
                    {activeCS.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-light)" }}>
                    +{activeCS.phone}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-light)", marginTop: 2 }}>
                    Shift {activeCS.shift.start}:00 – {activeCS.shift.end === 24 ? "00:00" : `${activeCS.shift.end}:00`}
                  </div>
                </div>
                <a
                  href={`https://wa.me/${activeCS.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 18px",
                    background: "var(--wa-green)",
                    color: "#fff",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Buka WA
                </a>
              </div>
            )}
            {testHour !== null && (
              <button
                onClick={resetSimulate}
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                ← Kembali ke waktu sekarang
              </button>
            )}
          </div>

          {/* Timeline Shift */}
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              padding: 28,
              marginBottom: 28,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "var(--ink-light)", marginBottom: 20, textTransform: "uppercase" }}>
              Timeline 24 Jam
            </div>

            {/* Hour labels */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-light)", marginBottom: 6 }}>
              {[0, 4, 8, 12, 16, 20, 24].map((h) => (
                <span key={h}>{h === 24 ? "00" : h}</span>
              ))}
            </div>

            {/* CS1 bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 4 }}>
                {csConfig.cs1.name}
              </div>
              <div style={{ position: "relative", height: 32, background: "var(--bg-alt)", borderRadius: 6, overflow: "hidden" }}>
                <ShiftBar shift={csConfig.cs1.shift} csKey="cs1" activeKey={activeCS?.key} />
                {/* Current time indicator */}
                <div style={{
                  position: "absolute",
                  left: `${nowPct}%`,
                  top: 0, bottom: 0,
                  width: 2,
                  background: "var(--ink)",
                  opacity: 0.5,
                }} />
              </div>
            </div>

            {/* CS2 bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 4 }}>
                {csConfig.cs2.name}
              </div>
              <div style={{ position: "relative", height: 32, background: "var(--bg-alt)", borderRadius: 6, overflow: "hidden" }}>
                <ShiftBar shift={csConfig.cs2.shift} csKey="cs2" activeKey={activeCS?.key} />
                <div style={{
                  position: "absolute",
                  left: `${nowPct}%`,
                  top: 0, bottom: 0,
                  width: 2,
                  background: "var(--ink)",
                  opacity: 0.5,
                }} />
              </div>
            </div>

            <div style={{ fontSize: 11, color: "var(--ink-light)" }}>
              Garis hitam = posisi jam sekarang · Warna terang = shift aktif
            </div>
          </div>

          {/* Simulator */}
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              padding: 28,
              marginBottom: 28,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "var(--ink-light)", marginBottom: 16, textTransform: "uppercase" }}>
              ⚡ Simulasi Jam
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-light)", marginBottom: 16 }}>
              Klik jam untuk lihat CS mana yang aktif pada jam tersebut.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <button
                  key={h}
                  onClick={() => simulateHour(h)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1.5px solid",
                    borderColor: testHour === h ? "var(--ink)" : "var(--border)",
                    background: testHour === h ? "var(--ink)" : "transparent",
                    color: testHour === h ? "#fff" : "var(--ink)",
                    fontSize: 13,
                    fontWeight: testHour === h ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    minWidth: 48,
                    textAlign: "center",
                  }}
                >
                  {String(h).padStart(2, "0")}:00
                </button>
              ))}
            </div>
          </div>

          {/* CS Cards — Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            {[
              { key: "cs1", data: csConfig.cs1 },
              { key: "cs2", data: csConfig.cs2 },
            ].map(({ key, data }) => (
              <div
                key={key}
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius-md)",
                  padding: 20,
                  boxShadow: "var(--shadow-card)",
                  borderLeft: `4px solid ${data.color}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: data.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 14, fontWeight: 700,
                  }}>
                    {data.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{data.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-light)" }}>
                      {key.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.8 }}>
                  <div>📱 +{data.phone}</div>
                  <div>🕐 {data.shift.start}:00 – {data.shift.end === 24 ? "00:00" : `${data.shift.end}:00`}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Instruction */}
          <div
            style={{
              background: "var(--bg-alt)",
              borderRadius: "var(--radius-md)",
              padding: 24,
              fontSize: 13,
              color: "var(--ink-light)",
              lineHeight: 1.8,
            }}
          >
            <strong style={{ color: "var(--ink)", display: "block", marginBottom: 8 }}>
              📝 Cara update nomor / jam shift CS
            </strong>
            Buka file <code style={{ background: "var(--border)", padding: "2px 6px", borderRadius: 4 }}>data/cs-config.js</code> di project kamu, lalu edit bagian <code style={{ background: "var(--border)", padding: "2px 6px", borderRadius: 4 }}>cs1</code> dan <code style={{ background: "var(--border)", padding: "2px 6px", borderRadius: 4 }}>cs2</code>:
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li><strong>name</strong> — nama CS yang muncul di tombol WA</li>
              <li><strong>phone</strong> — nomor WA format 62xxxxxxxxxx</li>
              <li><strong>shift.start / shift.end</strong> — jam mulai &amp; selesai (0–24)</li>
              <li><strong>fallback</strong> — CS yang menerima chat di luar jam shift keduanya</li>
            </ul>
            <div style={{ marginTop: 12 }}>
              Setelah edit, push ke GitHub → Vercel auto-deploy dalam ~1 menit.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
