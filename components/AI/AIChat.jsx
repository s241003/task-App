import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import  askQwen  from "../../src/qwen.js";
import {
  Container, Card, CardHeader, CardBody,
  ListGroup, ListGroupItem, Input, Button, InputGroup, Spinner
} from "reactstrap";


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);


export default function AIChat() {
  const CHAT_HISTORY_KEY = "chatHistory";
  const [messages, setMessages] = useState(() => {
    // 初期化時にlocalStorageから履歴を読み込む
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 以下はタスク作成用の状態変数
  const [text, setText] = useState('');
  const [subTasks,setSubTasks] = useState('')
  const [importance, setImportance] = useState('');
  const [estimated, setEstimated] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [withAI, setWithAI] = useState(false);
  const [withState, setWithState] = useState(0);

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);


  //プロンプト群
  const general = `
    <|im_start|>system
    あなたは親切なチャットアシスタントです。
    ユーザーの質問に対して正確かつ簡潔に、温かみをもって答えてください。
    絶対に日本語のみで回答してください。
    <|im_end|>


    ${messages
      .map(m => `${m.role === "user" ? "<|im_start|>user" : "<|im_start|>assistant"}\n${m.content}\n<|im_end|>`)
      .join("\n")}

    <|im_start|>user
    ${input}
    <|im_end|>
    <|im_start|>assistant`
  .trim();

  const startTask = "あなたの達成したいタスクを一緒に考えましょう。達成したいことを教えてください。";
  const taskEstimateFirst = `
  あなたはタスク管理AI(ぷらとん)です。
  次のユーザの入力から達成すべきタスクを読み取り、
  そこから推測できることを以下のJSON形式で必ず出力してください。
  また、タスクの内容が抽象的過ぎて具体的なタスクに落とし込めない場合は、
  messageにその旨を伝え、他の項目はnullまたは空配列で出力してください。

  ユーザー: "${input}"

{
  "message": "ユーザへの返信",
  "taskName": "10文字以内のタイトル",
  "subTasks": ["必要なら3〜7個のステップ"],
  "importance": 数値1〜5,
  "estimated_time": 数値（分）,
  "start_date": "YYYY-MM-DD(タスク開始日)",
  "end_date": "YYYY-MM-DD(締切日)"
}
  例:
  ユーザー: "おれは英検2級に合格するんだ!"
出力:
{

  "taskName": "英検2級合格",
  "subTasks": ["リスニング対策", "リーディング対策", "ライティング対策", "過去問演習", "模擬試験受験"],
  "importance": 4,
  "estimated_time": 15000,
  "start_date": "2026-01-16",
  "end_date": "2026-02-28"
}

JSON以外の文章は絶対に出力しない。

`.trim();
  const taskEstimate = "";



const promptGroup = [taskEstimateFirst,taskEstimate];


  const clearHistory = () => {
    setWithAI(false);
    setWithState(0);
    // 履歴をクリア
    localStorage.removeItem(CHAT_HISTORY_KEY);
    setMessages([]);
  };

  const setMessage = (msg) => {
    clearHistory();
    setWithAI(true);
    const aiMsg = { role: "model", content: msg };
    setMessages(m => [...m, aiMsg]);
  }

  const sendMessage = async (prompt) => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      /*const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });*/


      const result = await askQwen(prompt);
      console.log(prompt);

      const aiMsg = { role: "model", content: result };
      setMessages(m => [...m, aiMsg]);
    } catch (err) {
      setMessages(m => [...m, { role: "model", content: "すいません、エラーです" }]);
    } finally {
      setLoading(false);
    }
  };

  const estimate = async (prompt) => {
  if (!input.trim()) return;
  const userMsg = { role: "user", content: input };
  setMessages([...messages, userMsg]);
  setInput("");
  setLoading(true);

  try {
    /*const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });*/


    const result = await askQwen(prompt);
    console.log(prompt);

    const aiMsg = { role: "model", content: result };
    setMessages(m => [...m, aiMsg]);
  } catch (err) {
    setMessages(m => [...m, { role: "model", content: "すいません、エラーです" }]);
  } finally {
    setLoading(false);
  }
};

  return (
    <Container fluid className="my-4">
      <Card style={{ fontSize: "1.2rem" }}> {/* 全体フォントサイズ拡大 */}
        <CardHeader className="fs-2 text-bg-secondary p-3">AI Chat</CardHeader>
        <CardBody>
          <ListGroup style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {messages.map((m, i) => (
              <ListGroupItem
                key={i}
                className="border-0"
                style={{ listStyleType: "none", paddingLeft: 0 }} // 中点削除
              >
                <div
                  className="d-flex"
                  style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      backgroundColor: m.role === "user" ? "#cce5ff" : "#f1f1f1",
                      color: "#000",
                      borderRadius: "16px", // 丸みを強調
                      padding: "12px 16px", // 吹き出しを大きく
                      fontSize: "1.1rem",   // 吹き出し内の文字サイズ拡大
                      textAlign: "left"
                    }}
                  >
                    <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: 6 }}>
                      {m.role === "user" ? "あなた" : "AI"}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                  </div>
                </div>
              </ListGroupItem>
            ))}
            {loading && (
              <ListGroupItem className="border-0" style={{ listStyleType: "none" }}>
                <Spinner size="sm" className="me-2" /> ふむふむ…
              </ListGroupItem>
            )}
          </ListGroup>
          {}
          <div className="bg-gray-200 p-3 mt-3 rounded-lg">
            <Button
            onClick={()=>setMessage(startTask)}
            className="px-4! mb-1! py-1.5! rounded-full!
              text-blue-400! font-semibold!
              transition-all! duration-300!
              bg-cyan-400/20!
              backdrop-blur-md!
              border border-cyan-300/40!
              shadow-[0_0_20px_rgba(0,200,255,0.4)]!
              hover:shadow-[0_0_30px_rgba(0,200,255,0.7)]!
              hover:bg-cyan-400/30!
              active:scale-95!
            "> 
            AIとタスクを考える
            </Button>
            <Button color="danger" className="px-3 py-1 mb-1 mx-2 rounded-full!" onClick={clearHistory}>
              履歴をクリア
            </Button>
            <InputGroup className="mt-1">
              <Input
                placeholder="AIになんでも相談！"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(general)}
                style={{ backgroundColor: "#f6f6f6"}} // 入力欄も拡大
              />
              
              <Button
                color="primary"
                onClick={() => withAI ? estimate(promptGroup[withState]) : sendMessage(general)}
                disabled={loading}
              >
                送信
              </Button>
            </InputGroup>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
}
