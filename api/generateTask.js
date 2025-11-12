import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function callAIRetry(model, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.warn(`503エラー。${i + 1}回目のリトライを待機中...`);
        await new Promise(res => setTimeout(res, 2000 * (i + 1))); // バックオフ
        continue;
      }
      throw err;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text input is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // プロンプト記述
    const prompt = `
      以下のテキストからタスク情報を抽出し、JSON形式で出力してください。

      ・taskName: タスクの内容
      ・subTasks: taskNameから想定されるそのタスク遂行に至るまでの過程を細分化して配列にする。 例:taskName[英検2級合格]からリスニング,リーディング,ライティングに細分化する
      ・Concrete: テキストの情報が詳細でなく、正確なサブタスクを生成できない場合はFalse。そうでなければTrue。

      テキスト: "${text}"
    `;

    const result = await callAIRetry(model, prompt);
    const response = await result.response;
    const responseText = response.text();

    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      const jsonData = JSON.parse(jsonMatch[1]);
      return res.status(200).json(jsonData);
    } else {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }
  } catch (error) {
    console.error("AI呼び出し失敗:", error);
    return res.status(503).json({
      error: "AIサービスが混雑しています。しばらく待ってから再試行してください。",
    });
  }
}
