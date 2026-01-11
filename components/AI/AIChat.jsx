import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";
import {
  Container, Card, CardHeader, CardBody,
  ListGroup, ListGroupItem, Input, Button, InputGroup, Spinner
} from "reactstrap";


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

async function callAIRetry(model, prompt, retries = 3) {
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

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
あなたは親切なチャットアシスタントです。
ただし、ユーザーからの質問に答える際には、必ず以下のルールを守ってください。

1. 回答はユーザが使っている言語で行ってください。
2. ユーザーの質問に対して正確かつ簡潔に、でも温かみをもって答えてください。冗長になることがないように注意してください。
3. 不明な点がある場合は、正直に「わかりません」と答えてください。

ユーザー: "${input}"
アシスタント:`.trim();

      const result = await callAIRetry(model, prompt);
      const responseText = result.response.text();

      const aiMsg = { role: "model", content: responseText };
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
          <Button className="px-4! py-1.5! rounded-full!
              text-blue-400! font-semibold!
              transition-all! duration-300!
              bg-cyan-400/20!
              backdrop-blur-md!
              border border-cyan-300/40!
              shadow-[0_0_20px_rgba(0,200,255,0.4)]!
              hover:shadow-[0_0_30px_rgba(0,200,255,0.7)]!
              hover:bg-cyan-400/30!
              active:scale-95!
">AIとタスクを考える</Button>
          <InputGroup className="mt-1">
            <Input
              placeholder="AIになんでも相談！"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{ backgroundColor: "#f6f6f6"}} // 入力欄も拡大
            />
            <Button
              color="primary"
              onClick={sendMessage}
              disabled={loading}
            >
              送信
            </Button>
          </InputGroup>
        </CardBody>
      </Card>
    </Container>
  );
}
