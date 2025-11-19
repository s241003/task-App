import React, { useState } from "react";
import {
  Container, Card, CardHeader, CardBody,
  ListGroup, ListGroupItem, Input, Button, InputGroup, Spinner
} from "reactstrap";

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
      const res = await fetch("/api/AIChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: messages }),
      });
      const data = await res.json();
      const aiMsg = { role: "model", content: data.reply };
      setMessages(m => [...m, aiMsg]);
    } catch (err) {
      setMessages(m => [...m, { role: "model", content: "エラーが発生しました" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4" style={{ maxWidth: 800 }}>
      <Card>
        <CardHeader>AI Chat</CardHeader>
        <CardBody>
          <ListGroup style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {messages.map((m, i) => (
              <ListGroupItem key={i} className="border-0">
                <div className={`p-2 rounded ${m.role === "user" ? "bg-light" : "bg-white"}`}>
                  <strong>{m.role === "user" ? "あなた" : "AI"}:</strong>
                  <div className="mt-1">{m.content}</div>
                </div>
              </ListGroupItem>
            ))}
            {loading && (
              <ListGroupItem className="border-0">
                <Spinner size="sm" className="me-2" /> Thinking…
              </ListGroupItem>
            )}
          </ListGroup>
          <InputGroup className="mt-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="メッセージを入力..."
            />
            <Button color="primary" onClick={sendMessage} disabled={loading}>
              送信
            </Button>
          </InputGroup>
        </CardBody>
      </Card>
    </Container>
  );
}
