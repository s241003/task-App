import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import  askQwen ,{ askGroq }  from "../../src/qwen.js";
import {
 Card, CardHeader, CardBody,
  ListGroup, ListGroupItem, Input, Button, InputGroup, Spinner
} from "reactstrap";
import { Container } from "@mui/material";
import { supabase } from "./AITaskColl";
import { DBname } from "../../src/App.jsx"
import { useNavigate } from "react-router-dom";



const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);


export default function AIChat({setTasks,setPopUpText}) {
  const CHAT_HISTORY_KEY = "chatHistory";
  const CHAT_STATE = "chatState";
  const CHAT_WITH="chatWithAI";
  const [messages, setMessages] = useState(() => {
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

  const [withAI, setWithAI] = useState(() => {
    const savedWith = localStorage.getItem(CHAT_WITH);
    return savedWith ? JSON.parse(savedWith) : false;
  });
  const [withState, setWithState] = useState(() => {
    const savedState = localStorage.getItem(CHAT_STATE);
    return savedState ? JSON.parse(savedState) : 0;
  });
  const aDay =new Date();
  const today = `${aDay.getFullYear()}-${aDay.getMonth()+1}-${aDay.getDate()}`;

  const navigate=useNavigate();

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CHAT_STATE, JSON.stringify(withState));
  }, [withState]);

  useEffect(()=>{
    localStorage.setItem(CHAT_WITH, JSON.stringify(withAI));
  },[withAI]);


  //プロンプト群
  const general =`
あなたはタスク設定専門のチャットアシスタントです。
以下のルールに従って返答してください：

- 返答は日本語のみ
- 文量は2行以内、30文字以内
- 最後はユーザーへの質問で終える
- 質問文は一つにする
- 履歴は参考にするが、繰り返さない

【チャット履歴】
${messages.length > 0 ? messages.map(m => `${m.role}:${m.content}`).join("\n") : "なし"}

【ユーザー入力】
${input}

【出力形式】
アシスタントとしての返答のみを書く。

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
  const taskEstimateFirst = `あなたはタスク管理AI「ぷらとん」です。
ユーザーの入力から達成すべきタスクを読み取り、
次の JSON 形式「のみ」で出力してください。

【重要ルール】
- JSON 以外の文章は一切出力しない。
- コードブロックは禁止。
- キー名・構造は以下のテンプレートと完全に一致させる。
- subTasks は文字列の配列（オブジェクト禁止）。配列の中にオブジェクトを入れることも禁止。
- taskName は ユーザ入力から推測したタスク内容を10文字以内に要約する。
- importance はタスクの重要度。1〜5の数値で出力する。
- estimated_time は「タスクの現実的な所要時間」を推測する。
  1日以上かかるタスクは 1440分以上で表す。
  免許取得・資格取得・学習系タスクは数十〜数百時間かかることが多い。
  短時間タスク（30分〜2時間）と誤認しないこと。
- start_date は指定がなければ "${today}"。
- end_date は内容から妥当な日付を推測する。

【出力テンプレート】
{
  "message": "",
  "taskName": "",
  "subTasks": [],
  "importance": 1,
  "estimated_time": 0,
  "start_date": "",
  "end_date": ""
}

【ユーザー入力】
${input}
`
.trim();

  const taskEstimate = `
  あなたはタスク管理AI(ぷらとん)です。
  ユーザとあなたで考えている現在のタスク内容とこれまでの会話履歴を踏まえ、
  ユーザーとチャットをしながらタスク内容を修正して、
  出力形式に従った以下のJSON形式で必ず出力してください。
  また、制約を遵守してください。

    出力形式:
{
  "message": "ユーザの入力への返信メッセージ。具体的に",
  "taskName": 10文字以内のタイトル,
  "subTasks": ["必要なら3〜7個のステップ"],
  "importance": 数値1〜5 (5が最重要),
  "estimated_time": 数値（そのタスクを達成するまでにかかる見込み分数）,
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD"
}

制約:
- JSON以外の文章は一切出力しない。
- importance はタスクの重要度。1〜5の数値で出力する。
- start_date はタスク開始日。
- end_date は期日。
- estimated_time はタスク名からそのタスクを始めてから完了するまでにかかる妥当な分数。
- message はユーザーへの返信メッセージ。
　タスクの修正があった場合は具体的な修正内容を含めること。

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
これまでの会話履歴:
${messages!=[]?messages.map(m => `${m.role === "user" ? "ユーザ" : "アシスタント"}:${m.content}\n`).join("\n"):"なし"}

JSONのみを出力してください。
`.trim();



const promptGroup = [taskEstimateFirst,taskEstimate];


  const clearHistory = () => {
    setPopUpText("履歴をクリアしました！");
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
  修正したいことがあれば、なんでも言ってください！
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
  ${response.message}
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
    alert("タスク情報が足りません。");
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
    ])
    .select();;

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
  const taskId = data?.[0]?.id;
  setPopUpText(/*() => (<button onClick={()=>navigate(`/taskdetail/${taskId}`)}>作ったタスクを見に行く</button>)*/"タスクが正常に作られました！");
  return data;
}

const onTaskCreated = () => {
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
    <Container maxWidth="sm" minWidth="sm" maxHeight="sm" sx={{my: 2, bgcolor: '#f5f5f5', padding: 2, borderRadius: 4 }}>
      <Card style={{ fontSize: "2vw" }}> {/* 全体フォントサイズ拡大 */}
        <CardHeader style={{fontSize:"3.3vh"}} className="text-bg-secondary px-3 py-2">
          <>AI Chat</>
          <Button color="danger" style={{fontSize:"2vh"}} className="px-3 py-1.5 ml-5! mx-2 rounded-full!" onClick={clearHistory}>
                履歴をクリア
              </Button>
        </CardHeader>
        <CardBody >
          <ListGroup style={{ overflowY: "auto", }} className="chat">
            {messages.map((m, i) => (
              <ListGroupItem
                key={i}
                className="border-0"
                style={{ listStyleType: "none", paddingLeft: 0 }}
              >
                <div
                  className="d-flex"
                  style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      backgroundColor: m.role === "user" ? "#cce5ff" : "#dadada",
                      color: "#000",
                      borderRadius: "0.6rem", // 丸みを強調
                      padding: "1.2vh 1.5vw 1.2vh 2.1vw", // 吹き出しを大きく
                      fontSize: "1rem",   // 吹き出し内の文字サイズ拡大
                      textAlign: "left",
                      
                    }}
                  >
                    <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "0" }}>
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
          <div className="bg-gray-300 p-3 mt-2 rounded-lg">
            <InputGroup className="flex flex-row">
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
              {withAI?"最初から":"AIとタスクを考える"}
              </Button>
              
              {withState==1&&(<Button color="success" className="px-3 py-1 mb-1 mx-2 rounded-full!" onClick={saveTask}>
                この内容でタスクを作成
              </Button>)}
            </InputGroup>
            <InputGroup className="mt-1">
              <Input
                placeholder={withState === 0 ? "AIになんでも相談！" : "AIとタスクを理想化しよう！"}
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
