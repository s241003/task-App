import { GoogleGenerativeAI } from "@google/generative-ai";
import { callAIRetry } from "../../api/generateTask";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "有効なメッセージが必要です" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 履歴を含めたプロンプトを構築
    const prompt = `
あなたは親切なチャットアシスタントです。
これまでの会話:
${(history || []).map(h => `${h.role}: ${h.content}`).join("\n")}

ユーザー: ${message}
アシスタント:`;

    const result = await callAIRetry(model, prompt);
    const response = await result.response;
    const reply = response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI呼び出し失敗:", error);
    return res.status(500).json({ error: "チャット処理中にエラーが発生しました" });
  }
}
