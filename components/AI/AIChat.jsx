import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import  askQwen ,{ askGroq }  from "../../src/qwen.js";
import {
  Container, Card, CardHeader, CardBody,
  ListGroup, ListGroupItem, Input, Button, InputGroup, Spinner
} from "reactstrap";
import { createClient } from '@supabase/supabase-js';
import { supabase } from "./AITaskColl";
import { DBname } from "../../src/App.jsx"



const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);


export default function AIChat({setTasks}) {
  const CHAT_HISTORY_KEY = "chatHistory";
  const [messages, setMessages] = useState(() => {
    // 初期化時にlocalStorageから履歴を読み込む
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 以下はタスク作成用の状態変数
  const [task, setTask] = useState('');
  const [subTasks,setSubTasks] = useState("")
  const [importance, setImportance] = useState('');
  const [estimated, setEstimated] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [withAI, setWithAI] = useState(false);
  const [withState, setWithState] = useState(0);

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);


  useEffect(()=>{
  console.log("withAI changed:", withAI);
  },[withAI])

  //プロンプト群
  const general =`
    あなたは親切なチャットアシスタントです。
    ユーザーの入力に対して正確かつ簡潔に、温かみをもって答えてください。
    チャット履歴を参考にして、絶対に日本語のみで回答してください。

    <これまでのチャット履歴>${messages!=[]?messages.map(m => `${m.role === "user" ? "ユーザ" : "アシスタント"}:${m.content}\n`).join("\n"):"なし"}
    答えるべきユーザーの入力:${input}
  `.trim();
  /*` Qwen用
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
  .trim();*/

  const startTask = "あなたの達成したいタスクを一緒に考えましょう。達成したいことを教えてください。";
  const taskEstimateFirst = `
  あなたはタスク管理AI(ぷらとん)です。
  ユーザーの入力から達成すべきタスクを読み取り、
  細かい情報を推測して、以下のJSON形式で必ず出力してください。


出力形式:
{
  "message": "ユーザへ修正案内メッセージ",
  "taskName": 10文字以内のタイトル,
  "subTasks": ["必要なら3〜7個のステップ"],
  "importance": 数値1〜5 (5が最重要),
  "estimated_time": 数値（そのタスクを達成するまでにかかる見込み分数）,
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD"
}

ユーザー入力:
${input}

JSONのみを出力してください。`
.trim();

  const taskEstimate = `
  あなたはタスク管理AI(ぷらとん)です。
  ユーザがタスク内容を修正したいときは
  ユーザとあなたで考えている現在のタスク内容を踏まえ、
  ユーザーの追加情報をもとにタスク内容を修正して、
  以下のJSON形式で必ず出力してください。

現在のタスク内容:
{
  message: "ユーザへの返信メッセージ",
  taskName: ${task},
  subTasks: [${subTasks}],
  importance: ${importance},
  estimated_time: ${estimated},
  start_date: ${startDate},
  end_date: ${endDate}
}
  ユーザー入力:
  ${input}

JSONのみを出力してください。
`.trim();



const promptGroup = [taskEstimateFirst,taskEstimate];


  const clearHistory = () => {
    setWithAI(false);
    setWithState(0);
    // 履歴をクリア
    localStorage.removeItem(CHAT_HISTORY_KEY);
    setMessages([]);
  };

  const setMessage = (msg) => {
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


      const result = await askGroq(prompt);
      console.log(prompt);

      const aiMsg = { role: "model", content: result };
      setMessages(m => [...m, aiMsg]);
    } catch (err) {
      setMessages(m => [...m, { role: "model", content: "すいません、エラーです" }]);
    } finally {
      setLoading(false);
    }
  };

  const estimate = async (command) => {
  if (!input.trim()) return;
  const userMsg = { role: "user", content: input };
  setMessages([...messages, userMsg]);
  setInput("");
  setLoading(true);

  try {
    /*const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });*/
    const result = await askGroq(command);
    const response = JSON.parse(result);
    console.log(`プロンプト:${command}`);
    console.log(result);

    //state更新
    setTask(response.taskName);
    setSubTasks(response.subTasks);
    setImportance(response.importance);
    setEstimated(response.estimated_time);
    setStartDate(response.start_date);
    setEndDate(response.end_date);
    
    let contentBody="";
    if (withState === 0) {
      contentBody=`このようなタスクを考えました！
【タスク名】 ${response.taskName}
【サブタスク】 [${response.subTasks}]
【重要度】 ${response.importance}
【推定所要時間】 ${response.estimated_time}分
【開始日】 ${response.start_date}
【締切日】 ${response.end_date}\n
  ${response.message}。
      `;
      setWithState(1);
    }else if (withState === 1) {
      contentBody=`タスクを修正しました！
【タスク名】 ${response.taskName}
【サブタスク】 [${response.subTasks}]
【重要度】 ${response.importance}
【推定所要時間】 ${response.estimated_time}分
【開始日】 ${response.start_date}
【締切日】 ${response.end_date}\n
  ${response.message}。
      `;
    }
    console.log(contentBody);
    const aiMsg = { role: "model",content: contentBody };
    setMessages(m => [...m, aiMsg]);
    console.log(`task: ${task}, subTasks: ${subTasks}, importance: ${importance}, estimated: ${estimated}, startDate: ${startDate}, endDate: ${endDate}`);

  } catch (err) {
    setMessages(m => [...m, { role: "model", content: "すいません、エラーです\nもう一度お試しください" }]);
  } finally {
    setLoading(false);
  }
  };

const saveTask = async () => {
  if (!task||!startDate||!endDate||!importance||!estimated){
    alert("タスク情報が不完全です。");
    return;
  }
  const { data, error } = await supabase
    .from(DBname)
    .insert([
      {
        task_name: task,
        sub_tasks: subTasks,
        importance: importance,
        estimated_time: estimated,
        start_date: startDate,
        end_date: endDate,
      },
    ]);

  if (error) {
    console.error('保存失敗:', error);
    throw error;
  }
  onTaskCreated();
  setTask("");
  setSubTasks("");
  setImportance("");
  setEstimated("");
  setStartDate("");
  setEndDate("");
  setWithAI(false);
  setWithState(0);
  alert("タスクを保存しました！");
  return data;
}

const onTaskCreated = () => {
  // AITaskColl から送信されたデータを使用 (data.sta を日付キーとして使用)
  const targetKey = startDate;
  if (!targetKey) return;  // 日付が設定されていない場合は処理しない
  if (typeof setTasks === 'function') {
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      if (!newTasks[targetKey]) newTasks[targetKey] = [];
      // タスクオブジェクトとして保存 (Supabase 形式に合わせる)
      const newTask = {
        task: task,
        sub: subTasks,
        imp: parseInt(importance),
        sta: startDate,
        end: endDate,
      };
      newTasks[targetKey].push(newTask);
      localStorage.setItem('tasks', JSON.stringify({ ...prevTasks, [targetKey]: [...(prevTasks[targetKey] || []), newTask] }));
      return newTasks;
    });
  }
};

  return (
    <Container fluid>
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
            {withAI?"最初からやり直す":"AIとタスクを考える"}
            </Button>
            <Button color="danger" className="px-3 py-1 mb-1 mx-2 rounded-full!" onClick={clearHistory}>
              履歴をクリア
            </Button>
            {withState==1&&(<Button color="success" className="px-3 py-1 mb-1 mx-2 rounded-full!" onClick={saveTask}>
              この内容でタスクを作成
            </Button>)}
            <InputGroup className="mt-1">
              <Input
                placeholder={withState === 0 ? "AIになんでも相談！" : "タスク内容を修正してみましょう！"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (withAI ? estimate(promptGroup[withState]) : sendMessage(general))}
                style={{ backgroundColor: "#f6f6f6"}} // 入力欄も拡大
              />
              
              <Button
                color={withAI ? "info" : "primary"}
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
