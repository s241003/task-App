import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function callAIRetry(model, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.warn(`503エラー。${i + 1}回目のリトライを待機中...`);
        await new Promise(res => setTimeout(res, 2000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
}

// JSONを安全に抽出する関数
function extractJSON(text) {
  // ```json ブロックを探す
  const jsonBlockMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    return jsonBlockMatch[1];
  }
  
  // { で始まり } で終わる部分を探す
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  return null;
}

// バリデーション関数
function validateTaskData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: '無効なデータ形式です' };
  }
  
  if (!data.taskName || typeof data.taskName !== 'string') {
    return { valid: false, error: 'taskNameが必要です' };
  }
  
  if (!Array.isArray(data.subTasks)) {
    return { valid: false, error: 'subTasksは配列である必要があります' };
  }
  
  if (typeof data.Concrete !== 'boolean') {
    return { valid: false, error: 'Concreteはboolean値である必要があります' };
  }
  
  return { valid: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text } = req.body;
  
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ 
      error: "有効なテキスト入力が必要です" 
    });
  }

  // 入力の長さチェック
  if (text.trim().length < 2) {
    return res.status(400).json({ 
      error: "タスク名が短すぎます。もう少し具体的に入力してください" 
    });
  }

  if (text.length > 500) {
    return res.status(400).json({ 
      error: "タスク名が長すぎます（500文字以内）" 
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
あなたはタスク管理の専門家です。以下のテキストを分析し、JSON形式のみで出力してください。

テキスト: "${text}"

以下の形式で出力してください（説明文やマークダウンは不要、JSONのみ）:
{
  "taskName": "タスクの内容",
  "subTasks": ["サブタスク1", "サブタスク2", "サブタスク3"],
  "Concrete": true or false,
  "reason": "Concreteの判定理由（任意）"
}

ルール:
1. taskName: 入力されたタスクの内容を簡潔にまとめる
2. subTasks: そのタスクを達成するために必要な具体的なステップを3〜7個程度の配列にする
3. Concrete: 
   - True: 入力が具体的で、明確なサブタスクを生成できる場合
   - False: 入力が曖昧すぎて、適切なサブタスクを生成できない場合
     （例: "勉強する"、"頑張る"、"やる"などの抽象的すぎる入力）
4. reason: Concreteの判定理由を簡潔に（Falseの場合は特に重要）

例1（Concrete=true）:
入力: "英検2級に合格する"
出力:
{
  "taskName": "英検2級合格",
  "subTasks": ["リスニング対策", "リーディング対策", "ライティング対策", "過去問演習", "模擬試験受験"],
  "Concrete": true,
  "reason": "具体的な目標があり、明確なステップに分解可能"
}

例2（Concrete=false）:
入力: "勉強する"
出力:
{
  "taskName": "勉強",
  "subTasks": [],
  "Concrete": false,
  "reason": "何を勉強するのか不明確。具体的な科目や目標を指定してください"
}
`.trim();

    const result = await callAIRetry(model, prompt);
    const response = await result.response;
    const responseText = response.text();

    // JSONを抽出
    const jsonString = extractJSON(responseText);
    
    if (!jsonString) {
      console.error("JSON抽出失敗:", responseText);
      return res.status(500).json({ 
        error: "AIの応答からJSONを抽出できませんでした" 
      });
    }

    // JSONをパース
    let jsonData;
    try {
      jsonData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSONパースエラー:", parseError);
      console.error("パース対象:", jsonString);
      return res.status(500).json({ 
        error: "AIの応答を解析できませんでした" 
      });
    }

    // バリデーション
    const validation = validateTaskData(jsonData);
    if (!validation.valid) {
      return res.status(500).json({ 
        error: `データ検証エラー: ${validation.error}` 
      });
    }

    // Concreteがfalseの場合の処理
    if (jsonData.Concrete === false) {
      return res.status(200).json({
        ...jsonData,
        needsMoreDetail: true,
        suggestion: jsonData.reason || "もう少し具体的なタスク名を入力してください。例えば、「何を」「いつまでに」「どのように」などを含めると良いでしょう。"
      });
    }

    // 成功レスポンス
    return res.status(200).json({
      ...jsonData,
      needsMoreDetail: false
    });

  } catch (error) {
    console.error("AI呼び出し失敗:", error);

    // エラーの種類に応じた適切なレスポンス
    if (error.status === 503) {
      return res.status(503).json({
        error: "AIサービスが混雑しています。しばらく待ってから再試行してください。",
        retryAfter: 5
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: "リクエスト制限に達しました。しばらく待ってから再試行してください。"
      });
    }

    return res.status(500).json({
      error: "タスクの処理中にエラーが発生しました。もう一度お試しください。"
    });
  }
}
