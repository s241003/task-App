import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import { askQwen } from "../../api/generateTask";
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

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    // 履歴をクリア
    localStorage.removeItem(CHAT_HISTORY_KEY);
    setMessages([]);
  };

  //プロンプト群
  const general = `
あなたは親切なチャットアシスタントです。
ただし、ユーザーからの質問に答える際には、必ず以下のルールを守ってください。

1. 回答はユーザが使っている言語で行ってください。
2. ユーザーの質問に対して正確かつ簡潔に、でも温かみをもって答えてください。冗長になることがないように注意してください。
3. 不明な点がある場合は、正直に「わかりません」と答えてください。

ユーザー: "${input}"
アシスタント:`.trim();

  const startTask = `
あなたはタスク管理の専門家です。
ユーザーが「タスクを始める」ことを希望する場合、以下の手順でタスクを設定してください。

1. ユーザーが指定したタスクの内容を明確にします。
2. タスクの優先度を設定します。
3. タスクの期限を設定します。
4. タスクの詳細な説明を提供します。

ユーザー: "${input}"
アシスタント:`.trim();



  const sendMessage = async (prompt) => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      /*const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });*/


      const result = await askQwen(prompt);

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
            onClick={()=>sendMessage(startTask)}
            className="px-4! py-1.5! rounded-full!
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
                onClick={() => sendMessage(general)}
                disabled={loading}
              >
                送信
              </Button>
            </InputGroup>
            <Button color="danger" className="mt-3" onClick={clearHistory}>
              履歴をクリア
            </Button>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
}
