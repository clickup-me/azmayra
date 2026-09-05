export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const imageUrl = req.body.imageUrl;
  const existingName = req.body.existingName || "";

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl required" });
  }

  const nameHint = existingName
    ? "Nama produk yang sudah diisi: " + existingName + ". Gunakan nama ini."
    : "";

  const prompt = "Kamu adalah copywriter produk fashion Indonesia. " +
    "Lihat foto produk dari URL ini: " + imageUrl + ". " +
    "Berikan informasi dalam format JSON berikut (jawab HANYA JSON): " +
    '{"name":"nama produk","slug":"nama-produk","tagline":"tagline max 60 karakter",' +
    '"description":"deskripsi 2-3 kalimat",' +
    '"details":["detail 1","detail 2","detail 3"],' +
    '"sizes":"S, M, L, XL",' +
    '"colors":[{"name":"nama warna","hex":"#hexcode"}],' +
    '"wa_message":"Halo Azmayra! Saya tertarik dengan *nama produk*. Boleh info stok?"}' +
    " " + nameHint;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
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

    if (!response.ok) {
      throw new Error(data.error ? data.error.message : "Groq API error");
    }

    const text = data.choices && data.choices[0]
      ? data.choices[0].message.content
      : "";

    const clean = text
  .replace(/<think>[\s\S]*?<\/think>/g, "")
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
