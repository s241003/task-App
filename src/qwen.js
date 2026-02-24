export default async function askQwen(prompt) {
  const res = await fetch(import.meta.env.VITE_QWEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
        import.meta.env.VITE_USE_LOCAL
        ?{ model: "qwen2.5:7b", prompt: prompt, stream: false }
        :{prompt,max_tokens: 256,temperature: 0.7}
    )
  });

  const data = await res.json();
  return data.response;
}

export async function askGroq(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15秒で強制終了

  try {
    const res = await fetch(import.meta.env.VITE_GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    // HTTPエラーを拾う
    if (!res.ok) {
      console.error("Groq HTTP error:", res.status, await res.text());
      return "";
    }

    const data = await res.json();
    console.log("Groq response:", data);

    return data.choices?.[0]?.message?.content || "";

  } catch (err) {
    clearTimeout(timeout);
    console.error("Groq request failed:", err);
    return "";
  }
}