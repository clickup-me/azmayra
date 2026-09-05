export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageUrl, existingName } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "imageUrl required" });

  const prompt = `Kamu adalah copywriter produk fashion Indonesia. Lihat foto produk fashion ini dari URL berikut: ${imageUrl}

Berikan informasi produk dalam format JSON berikut (jawab HANYA JSON, tanpa penjelasan lain):

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

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl }
              },
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Groq API error");

    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
