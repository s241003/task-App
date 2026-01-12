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
