import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

function useAdminGuard() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("azmayra_admin")) {
      router.replace("/admin");
    }
  }, [router]);
}

const DEFAULT_SETTINGS = {
  cs1_name: "Kak Sari",
  cs1_phone: "6281111111111",
  cs1_shift_start: "8",
  cs1_shift_end: "16",
  cs2_name: "Kak Rina",
  cs2_phone: "6282222222222",
  cs2_shift_start: "16",
  cs2_shift_end: "24",
  cs_fallback: "cs1",
  pixel_id: "",
};

export default function AdminSettings() {
  useAdminGuard();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("cs");
  const [testHour, setTestHour] = useState(null);
  const [activeCS, setActiveCS] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("cs_config").select("*");
      if (data?.length) {
        const map = {};
        data.forEach((row) => { map[row.key] = row.value; });
        setSettings((prev) => ({ ...prev, ...map }));
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const hour = testHour !== null ? testHour : new Date().getHours();
    setActiveCS(getActiveCS(hour));
  }, [settings, testHour]);

  function getActiveCS(hour) {
    const s1 = parseInt(settings.cs1_shift_start);
    const e1 = parseInt(settings.cs1_shift_end);
    const s2 = parseInt(settings.cs2_shift_start);
    const e2 = parseInt(settings.cs2_shift_end);
    const inShift = (h, s, e) => s < e ? h >= s && h < e : h >= s || h < e;
    if (inShift(hour, s1, e1)) return { name: settings.cs1_name, phone: settings.cs1_phone, key: "cs1" };
    if (inShift(hour, s2, e2)) return { name: settings.cs2_name, phone: settings.cs2_phone, key: "cs2" };
    return settings.cs_fallback === "cs1"
      ? { name: settings.cs1_name, phone: settings.cs1_phone, key: "cs1" }
      : { name: settings.cs2_name, phone: settings.cs2_phone, key: "cs2" };
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const entries = Object.entries(settings).map(([key, value]) => ({ key, value: String(value) }));
      for (const entry of entries) {
        await supabase.from("cs_config").upsert({ key: entry.key, value: entry.value }, { onConflict: "key" });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)", fontSize: 14, fontFamily: "var(--font-body)",
    color: "var(--ink)", background: "var(--surface)", outline: "none", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: "var(--ink-light)", display: "block",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em",
  };
  const cardStyle = {
    background: "#fff", borderRadius: "var(--radius-lg)", padding: 28,
    boxShadow: "var(--shadow-card)", marginBottom: 20,
  };

  const nowHour = new Date().getHours();
  const nowPct = (nowHour / 24) * 100;

  return (
    <>
      <Head>
        <title>Admin Settings — Azmayra</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)" }}>
        {/* Navbar */}
        <div style={{ background: "var(--ink)", color: "#fff", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Azmayra Admin</div>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <Link href="/admin/produk" style={{ color: "#fff", opacity: 0.6 }}>Produk</Link>
            <Link href="/admin/orders" style={{ color: "#fff", opacity: 0.6 }}>Orders</Link>
            <Link href="/admin/settings" style={{ color: "#fff", fontWeight: 600 }}>Settings</Link>
            <Link href="/" style={{ color: "#fff", opacity: 0.6 }}>← Katalog</Link>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400 }}>Settings</h1>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "10px 24px", background: saved ? "#1DAA53" : "var(--ink)", color: "#fff",
              border: "none", borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 600, cursor: "pointer",
              transition: "background 0.3s",
            }}>
              {saving ? "Menyimpan..." : saved ? "✓ Tersimpan!" : "Simpan Semua"}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-alt)", padding: 4, borderRadius: "var(--radius-md)", width: "fit-content" }}>
            {[["cs", "CS Rotator"], ["pixel", "Meta Pixel"]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                padding: "8px 20px", borderRadius: "var(--radius-sm)", border: "none",
                background: activeTab === key ? "#fff" : "transparent",
                color: activeTab === key ? "var(--ink)" : "var(--ink-light)",
                fontSize: 13, fontWeight: activeTab === key ? 600 : 400,
                cursor: "pointer", boxShadow: activeTab === key ? "var(--shadow-card)" : "none",
                transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>

          {loading ? <p style={{ color: "var(--ink-light)" }}>Memuat...</p> : (
            <>
              {/* CS ROTATOR TAB */}
              {activeTab === "cs" && (
                <>
                  {/* Status CS Aktif */}
                  <div style={{ ...cardStyle, borderLeft: "4px solid var(--accent)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "var(--ink-light)", marginBottom: 12, textTransform: "uppercase" }}>
                      {testHour !== null ? `⚡ Simulasi Jam ${testHour}:00` : "✅ CS Aktif Sekarang"}
                    </div>
                    {activeCS && (
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: "50%", background: "var(--accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 18, fontFamily: "var(--font-display)", flexShrink: 0,
                        }}>
                          {activeCS.name.split(" ").pop()?.[0] || "C"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 17 }}>{activeCS.name}</div>
                          <div style={{ fontSize: 13, color: "var(--ink-light)" }}>+{activeCS.phone}</div>
                        </div>
                        {testHour !== null && (
                          <button onClick={() => setTestHour(null)} style={{
                            marginLeft: "auto", fontSize: 12, color: "var(--accent)", background: "none",
                            border: "none", cursor: "pointer", textDecoration: "underline",
                          }}>Reset ke sekarang</button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div style={cardStyle}>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "var(--ink-light)", marginBottom: 16, textTransform: "uppercase" }}>Timeline 24 Jam</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-light)", marginBottom: 6 }}>
                      {[0,4,8,12,16,20,24].map((h) => <span key={h}>{h === 24 ? "00" : h}</span>)}
                    </div>
                    {["cs1", "cs2"].map((cs) => {
                      const start = parseInt(settings[`${cs}_shift_start`]);
                      const end = parseInt(settings[`${cs}_shift_end`]);
                      const dur = end > start ? end - start : 24 - start + end;
                      const leftPct = (start / 24) * 100;
                      const widthPct = (dur / 24) * 100;
                      const isActive = activeCS?.key === cs;
                      return (
                        <div key={cs} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 4 }}>{settings[`${cs}_name`]}</div>
                          <div style={{ position: "relative", height: 32, background: "var(--bg-alt)", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{
                              position: "absolute", left: `${leftPct}%`, width: `${widthPct}%`,
                              top: 0, bottom: 0, background: isActive ? "var(--accent)" : "rgba(201,150,138,0.3)",
                              borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "background 0.3s",
                            }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? "#fff" : "var(--ink-light)", whiteSpace: "nowrap", padding: "0 6px" }}>
                                {start}:00 – {end === 24 ? "00:00" : `${end}:00`}
                              </span>
                            </div>
                            <div style={{ position: "absolute", left: `${nowPct}%`, top: 0, bottom: 0, width: 2, background: "var(--ink)", opacity: 0.4 }} />
                          </div>
                        </div>
                      );
                    })}
                    {/* Simulator */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 8 }}>Simulasi jam:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                          <button key={h} onClick={() => setTestHour(h)} style={{
                            padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "1.5px solid",
                            borderColor: testHour === h ? "var(--ink)" : "var(--border)",
                            background: testHour === h ? "var(--ink)" : "transparent",
                            color: testHour === h ? "#fff" : "var(--ink)",
                            fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                          }}>
                            {String(h).padStart(2, "0")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CS 1 Form */}
                  <div style={cardStyle}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                        {settings.cs1_name.split(" ").pop()?.[0] || "1"}
                      </div>
                      CS 1
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div><label style={labelStyle}>Nama</label><input style={inputStyle} value={settings.cs1_name} onChange={(e) => handleChange("cs1_name", e.target.value)} /></div>
                      <div><label style={labelStyle}>Nomor WA (628xxx)</label><input style={inputStyle} value={settings.cs1_phone} onChange={(e) => handleChange("cs1_phone", e.target.value)} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Jam Mulai Shift</label>
                        <select style={inputStyle} value={settings.cs1_shift_start} onChange={(e) => handleChange("cs1_shift_start", e.target.value)}>
                          {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2,"0")}:00</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Jam Selesai Shift</label>
                        <select style={inputStyle} value={settings.cs1_shift_end} onChange={(e) => handleChange("cs1_shift_end", e.target.value)}>
                          {Array.from({ length: 24 }, (_, i) => i + 1).map((i) => <option key={i} value={i === 24 ? 24 : i}>{i === 24 ? "00:00 (tengah malam)" : `${String(i).padStart(2,"0")}:00`}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* CS 2 Form */}
                  <div style={cardStyle}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#8A968A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                        {settings.cs2_name.split(" ").pop()?.[0] || "2"}
                      </div>
                      CS 2
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div><label style={labelStyle}>Nama</label><input style={inputStyle} value={settings.cs2_name} onChange={(e) => handleChange("cs2_name", e.target.value)} /></div>
                      <div><label style={labelStyle}>Nomor WA (628xxx)</label><input style={inputStyle} value={settings.cs2_phone} onChange={(e) => handleChange("cs2_phone", e.target.value)} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Jam Mulai Shift</label>
                        <select style={inputStyle} value={settings.cs2_shift_start} onChange={(e) => handleChange("cs2_shift_start", e.target.value)}>
                          {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2,"0")}:00</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Jam Selesai Shift</label>
                        <select style={inputStyle} value={settings.cs2_shift_end} onChange={(e) => handleChange("cs2_shift_end", e.target.value)}>
                          {Array.from({ length: 24 }, (_, i) => i + 1).map((i) => <option key={i} value={i === 24 ? 24 : i}>{i === 24 ? "00:00 (tengah malam)" : `${String(i).padStart(2,"0")}:00`}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Fallback */}
                  <div style={cardStyle}>
                    <label style={labelStyle}>CS Fallback (di luar jam shift keduanya)</label>
                    <select style={{ ...inputStyle, maxWidth: 300 }} value={settings.cs_fallback} onChange={(e) => handleChange("cs_fallback", e.target.value)}>
                      <option value="cs1">{settings.cs1_name}</option>
                      <option value="cs2">{settings.cs2_name}</option>
                    </select>
                    <p style={{ fontSize: 12, color: "var(--ink-light)", marginTop: 8 }}>CS ini yang menerima chat jika tidak ada yang sedang shift.</p>
                  </div>
                </>
              )}

              {/* PIXEL TAB */}
              {activeTab === "pixel" && (
                <div style={cardStyle}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Meta Pixel ID</div>
                  <p style={{ fontSize: 13, color: "var(--ink-light)", marginBottom: 20, lineHeight: 1.6 }}>
                    Pixel ID digunakan untuk tracking event di Meta Ads (PageView, ViewContent, Contact, InitiateCheckout).
                    Kosongkan jika belum punya.
                  </p>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Pixel ID</label>
                    <input style={{ ...inputStyle, maxWidth: 400 }} value={settings.pixel_id} onChange={(e) => handleChange("pixel_id", e.target.value)} placeholder="1234567890123456" />
                  </div>
                  <div style={{ background: "var(--bg-alt)", borderRadius: "var(--radius-md)", padding: 16, fontSize: 13, color: "var(--ink-light)", lineHeight: 1.8 }}>
                    <strong style={{ color: "var(--ink)", display: "block", marginBottom: 6 }}>Cara cari Pixel ID:</strong>
                    1. Buka <strong>business.facebook.com</strong><br />
                    2. Events Manager → pilih Pixel kamu<br />
                    3. Copy angka ID di bagian atas (contoh: 1234567890123456)
                  </div>
                  {settings.pixel_id && (
                    <div style={{ marginTop: 16, padding: 16, background: "#EAF3DE", borderRadius: "var(--radius-md)", fontSize: 13 }}>
                      ✅ Pixel ID aktif: <strong>{settings.pixel_id}</strong>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
