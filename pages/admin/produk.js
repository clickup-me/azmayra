import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase, formatPrice } from "../../lib/supabase";

function useAdminGuard() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("azmayra_admin")) {
      router.replace("/admin");
    }
  }, [router]);
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "azmayra_unsigned";

const emptyProduct = {
  slug: "", name: "", tagline: "", price: "", original_price: "",
  images: "", sizes: "S, M, L, XL", colors: '[{"name":"Hitam","hex":"#1A1A1A"}]',
  description: "", details: "", wa_message: "", featured: false, badge: "", sort_order: 0,
};

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "azmayra");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST", body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload gagal");
  return data.secure_url.replace("/upload/", "/upload/q_auto,f_auto,w_800/");
}

async function analyzeProductImage(imageUrl, existingName) {
  const prompt = `Kamu adalah copywriter produk fashion Indonesia. Analisis foto produk fashion ini dan berikan informasi dalam format JSON berikut (jawab HANYA JSON, tanpa penjelasan lain):

{
  "name": "nama produk singkat dan menarik (bahasa Indonesia)",
  "slug": "nama-produk-tanpa-spasi-pakai-strip",
  "tagline": "kalimat singkat 1 baris yang menarik (max 60 karakter)",
  "description": "deskripsi 2-3 kalimat yang menggambarkan produk, bahan, dan keunggulannya",
  "details": ["detail 1", "detail 2", "detail 3", "detail 4"],
  "sizes": "S, M, L, XL",
  "colors": [{"name":"nama warna yang terlihat di foto","hex":"#kode_hex_perkiraan"}],
  "wa_message": "Halo Azmayra! Saya tertarik dengan *nama produk*. Boleh info ketersediaan stok?"
}

${existingName ? `Nama produk yang sudah diisi: "${existingName}". Gunakan nama ini.` : ""}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: prompt }
        ]
      }]
    })
  });
  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState(
    initial?.images ? initial.images.split("\n").filter(Boolean) : []
  );
  const fileRef = useRef();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (!CLOUD_NAME) {
      alert("Cloudinary belum dikonfigurasi. Tambahkan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME di Vercel.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setUploadedUrls((prev) => [...prev, ...urls]);
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images ? prev.images.split("\n").filter(Boolean) : []), ...urls].join("\n"),
      }));
    } catch (err) {
      setError("Upload gagal: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    const firstUrl = form.images?.split("\n").find((u) => u.trim());
    if (!firstUrl) { alert("Upload foto dulu sebelum analisis."); return; }
    setAnalyzing(true);
    setError("");
    try {
      const result = await analyzeProductImage(firstUrl.trim(), form.name);
      setForm((prev) => ({
        ...prev,
        name: result.name || prev.name,
        slug: result.slug || prev.slug,
        tagline: result.tagline || prev.tagline,
        description: result.description || prev.description,
        details: Array.isArray(result.details) ? result.details.join("\n") : prev.details,
        sizes: result.sizes || prev.sizes,
        colors: JSON.stringify(result.colors || [], null, 2),
        wa_message: result.wa_message || prev.wa_message,
      }));
    } catch (err) {
      setError("Analisis gagal: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        price: parseInt(form.price) || 0,
        original_price: form.original_price ? parseInt(form.original_price) : null,
        images: form.images ? form.images.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        colors: (() => { try { return JSON.parse(form.colors); } catch { return []; } })(),
        description: form.description.trim(),
        details: form.details ? form.details.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        wa_message: form.wa_message.trim(),
        featured: form.featured,
        badge: form.badge.trim() || null,
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (initial?.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }
      onSave();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
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

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* UPLOAD FOTO */}
      <div style={{ background: "var(--bg-alt)", borderRadius: "var(--radius-md)", padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📸 Foto Produk</div>

        {uploadedUrls.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {uploadedUrls.map((url, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={url} alt={`Foto ${i+1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "2px solid var(--accent)" }} />
                <button type="button" onClick={() => {
                  const newUrls = uploadedUrls.filter((_, idx) => idx !== i);
                  setUploadedUrls(newUrls);
                  setForm((prev) => ({ ...prev, images: newUrls.join("\n") }));
                }} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#E24B4A", color: "#fff", border: "none", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
            padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)",
            background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>
            {uploading ? "⏳ Mengupload..." : "📁 Upload Foto"}
          </button>

          <button type="button" onClick={handleAnalyze} disabled={analyzing || !form.images} style={{
            padding: "10px 20px", border: "none", borderRadius: "var(--radius-sm)",
            background: analyzing || !form.images ? "#ccc" : "var(--accent)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: analyzing || !form.images ? "not-allowed" : "pointer",
          }}>
            {analyzing ? "⏳ Menganalisis..." : "✨ Auto-isi dari Foto (AI)"}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 4 }}>Atau paste URL foto (satu per baris)</label>
          <textarea style={{ ...inputStyle, resize: "vertical", fontSize: 12, fontFamily: "monospace" }}
            name="images" value={form.images} onChange={handleChange} rows={2}
            placeholder="https://res.cloudinary.com/..." />
        </div>
      </div>

      {/* DETAIL PRODUK */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div><label style={labelStyle}>Nama Produk *</label><input style={inputStyle} name="name" value={form.name} onChange={handleChange} required /></div>
        <div><label style={labelStyle}>Slug (URL) *</label><input style={inputStyle} name="slug" value={form.slug} onChange={handleChange} placeholder="nama-produk" required /></div>
      </div>

      <div><label style={labelStyle}>Tagline</label><input style={inputStyle} name="tagline" value={form.tagline} onChange={handleChange} /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div><label style={labelStyle}>Harga (Rp) *</label><input style={inputStyle} name="price" type="number" value={form.price} onChange={handleChange} required /></div>
        <div><label style={labelStyle}>Harga Coret (Rp)</label><input style={inputStyle} name="original_price" type="number" value={form.original_price} onChange={handleChange} /></div>
      </div>

      <div><label style={labelStyle}>Ukuran (pisah koma)</label><input style={inputStyle} name="sizes" value={form.sizes} onChange={handleChange} placeholder="S, M, L, XL" /></div>

      <div>
        <label style={labelStyle}>Warna (format JSON)</label>
        <textarea style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
          name="colors" value={form.colors} onChange={handleChange} rows={3}
          placeholder={`[{"name":"Sage","hex":"#B2BEA5"}]`} />
      </div>

      <div><label style={labelStyle}>Deskripsi</label><textarea style={{ ...inputStyle, resize: "vertical" }} name="description" value={form.description} onChange={handleChange} rows={3} /></div>

      <div>
        <label style={labelStyle}>Detail Produk (satu per baris)</label>
        <textarea style={{ ...inputStyle, resize: "vertical" }} name="details" value={form.details} onChange={handleChange} rows={4} placeholder={"Bahan: Linen premium\nUkuran S sampai XL"} />
      </div>

      <div><label style={labelStyle}>Pesan WA Otomatis</label><textarea style={{ ...inputStyle, resize: "vertical" }} name="wa_message" value={form.wa_message} onChange={handleChange} rows={2} /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "end" }}>
        <div><label style={labelStyle}>Badge</label><input style={inputStyle} name="badge" value={form.badge} onChange={handleChange} placeholder="Bestseller / Baru / Limited" /></div>
        <div><label style={labelStyle}>Urutan</label><input style={inputStyle} name="sort_order" type="number" value={form.sort_order} onChange={handleChange} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" name="featured" id="featured" checked={form.featured} onChange={handleChange} style={{ width: 18, height: 18 }} />
          <label htmlFor="featured" style={{ fontSize: 14, cursor: "pointer" }}>Pilihan Utama</label>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "#E24B4A", margin: 0, background: "#FFF0F0", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" disabled={saving} style={{
          flex: 1, padding: "14px", background: "var(--ink)", color: "#fff",
          border: "none", borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          {saving ? "Menyimpan..." : (initial ? "Simpan Perubahan" : "Tambah Produk")}
        </button>
        <button type="button" onClick={onCancel} style={{
          padding: "14px 24px", background: "transparent", color: "var(--ink)",
          border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 14, cursor: "pointer",
        }}>Batal</button>
      </div>
    </form>
  );
}

export default function AdminProduk() {
  useAdminGuard();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list");
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleDelete(id) {
    await supabase.from("products").delete().eq("id", id);
    setDeleteId(null);
    loadProducts();
  }

  function handleEdit(product) {
    setEditing({
      ...product,
      images: product.images?.join("\n") || "",
      sizes: product.sizes?.join(", ") || "",
      colors: JSON.stringify(product.colors || [], null, 2),
      details: product.details?.join("\n") || "",
      original_price: product.original_price || "",
      badge: product.badge || "",
    });
    setMode("edit");
  }

  function handleSaved() {
    setMode("list");
    setEditing(null);
    loadProducts();
  }

  return (
    <>
      <Head>
        <title>Admin Produk — Azmayra</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)" }}>
        <div style={{ background: "var(--ink)", color: "#fff", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Azmayra Admin</div>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <Link href="/admin/produk" style={{ color: "#fff", fontWeight: 600 }}>Produk</Link>
            <Link href="/admin/orders" style={{ color: "#fff", opacity: 0.6 }}>Orders</Link>
            <Link href="/admin/settings" style={{ color: "#fff", opacity: 0.6 }}>Settings</Link>
            <Link href="/" style={{ color: "#fff", opacity: 0.6 }}>← Katalog</Link>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
          {mode === "list" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400 }}>Produk</h1>
                <button onClick={() => setMode("add")} style={{
                  padding: "10px 20px", background: "var(--ink)", color: "#fff",
                  border: "none", borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>+ Tambah Produk</button>
              </div>
              {loading ? <p style={{ color: "var(--ink-light)" }}>Memuat...</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {products.map((p) => (
                    <div key={p.id} style={{
                      background: "#fff", borderRadius: "var(--radius-md)", padding: "16px 20px",
                      boxShadow: "var(--shadow-card)", display: "flex", alignItems: "center", gap: 16,
                    }}>
                      <div style={{ width: 64, height: 64, borderRadius: 10, background: "var(--bg-alt)", overflow: "hidden", flexShrink: 0 }}>
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: "var(--ink-light)" }}>{formatPrice(p.price)}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 2 }}>/produk/{p.slug}</div>
                      </div>
                      {p.badge && <span style={{ fontSize: 11, fontWeight: 600, background: "var(--ink)", color: "#fff", padding: "3px 10px", borderRadius: 100 }}>{p.badge}</span>}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleEdit(p)} style={{ padding: "8px 16px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, cursor: "pointer", background: "transparent" }}>Edit</button>
                        {deleteId === p.id ? (
                          <>
                            <button onClick={() => handleDelete(p.id)} style={{ padding: "8px 16px", background: "#E24B4A", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, cursor: "pointer" }}>Yakin hapus?</button>
                            <button onClick={() => setDeleteId(null)} style={{ padding: "8px 16px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, cursor: "pointer", background: "transparent" }}>Batal</button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteId(p.id)} style={{ padding: "8px 16px", border: "1.5px solid #E24B4A", color: "#E24B4A", borderRadius: "var(--radius-sm)", fontSize: 13, cursor: "pointer", background: "transparent" }}>Hapus</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {mode === "add" && (
            <>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, marginBottom: 24 }}>Tambah Produk</h1>
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow-card)" }}>
                <ProductForm onSave={handleSaved} onCancel={() => setMode("list")} />
              </div>
            </>
          )}

          {mode === "edit" && editing && (
            <>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, marginBottom: 24 }}>Edit — {editing.name}</h1>
              <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow-card)" }}>
                <ProductForm initial={editing} onSave={handleSaved} onCancel={() => { setMode("list"); setEditing(null); }} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}