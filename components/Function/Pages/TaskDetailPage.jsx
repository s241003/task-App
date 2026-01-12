import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from "react-modal";

import PopUp, { calcDays } from "../../../src/App"
/*import "../../../src/App.css";*/

Modal.setAppElement("#root");

function TaskDetailPage({ tasks, onBack ,del ,update ,onUpdateTask ,setPopUpText }) {
  const [ task, setTask ] = useState({});
  const { taskId } = useParams();
  const [currentTask, setCurrentTask] = useState("")
  const [elapsedTime, setElapsedTime] = useState(task?.loggedTime || 0);
  const [isRunning, setIsRunning] = useState(false)
  const [ isOpen , setIsOpen ] = useState(false);
  const [ isUpdate , setIsUpdate ] = useState(false);
  const timerRef = useRef(null);

  /* タスク更新関連 */
  const [ newTitle,setNewTitle ] = useState("");
  const [ newStart,setNewStart ] = useState("");
  const [ newImp,setNewImp ] = useState("");
  const [ newEnd,setNewEnd ] = useState("");
  const [newHours, setNewHours] = useState(0);
  const [newMins, setNewMins] = useState(0);
  const [newEst, setNewEst] = useState("");
  const [newDoing, setNewDoing] = useState(0);

  useEffect(()=>{
    const flatArray = Object.values(tasks).flat();
    const matched =
      flatArray.find( t =>
      {
        return t.id === taskId;
      })
      setTask(matched);
      console.log({task});

  },[taskId]);

  useEffect(()=>{
    setNewEst(`${newHours*60+parseInt(newMins)}`);
  },[newMins,newHours])

  useEffect(()=>{
    setNewTitle(task.task);
    setNewImp(task.imp);
    setNewStart(task.sta);
    setNewEnd(task.end);
    setNewEst(task.est);
    setNewHours(Math.floor(parseInt(task.est)/60));
    setNewMins(parseInt(task.est)%60);
  },[isUpdate]);

  useEffect(() => {
    setCurrentTask(task);
  }, [task])

  // ⏱ --- タイマー動作 ---
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning])

  // 🕒 --- 時間フォーマット ---
  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  // 💾 --- 時間を記録する処理 ---
  const handleSaveTime = () => {
    if (onUpdateTask && currentTask) {
      onUpdateTask(currentTask, elapsedTime)
      // 保存した状態も更新しておく
      const updated = { ...currentTask, loggedTime: elapsedTime }
      localStorage.setItem('selectedTask', JSON.stringify(updated))
      alert('作業時間を記録しました！')
    }
  }

  // ⬅ --- 戻るときにlocalStorage削除 ---
  const handleBackClick = () => {
    localStorage.removeItem('selectedTask')
    onBack()
  }

  const navigate = useNavigate();

  const handleDelete = () => {
    setIsOpen(false);
    del(taskId);
    setPopUpText("タスクの削除できました！\n※少し遅れて反映されることがあります");
    navigate(-1);
  }

  const handleUpdate = ()=>{
    const newContent=[
        {
          task_name: newTitle,
          importance: newImp,
          estimated_time: newEst,
          start_date: newStart,
          end_date: newEnd
        }
      ];
    update(newContent,taskId);
    setIsUpdate(false);
    setPopUpText("タスクの更新できました！\n※少し遅れて反映されます");
  }





  // ⚠ --- currentTaskがまだ読み込まれていない場合 ---
  if (!currentTask) {
    return <div className="page-content">読み込み中...</div>
  }

  return (
    
    <div className="relative">
      <div className="buttons">
        <button className="back-btn" onClick={handleBackClick}>← 戻る</button>
        <div className="flex flex-row gap-2 absolute right-0 top-0">
          <button className="delete-btn" onClick={()=>setIsOpen(true)}>🗑️</button>
          <button className="edit-btn" onClick={()=>setIsUpdate(true)}>📝</button>
        </div>
      </div>

        <Modal
          style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              },
              content: {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                padding: "3rem",
                borderRadius: "0.8rem",
                border: "none",
                height:"35vh",
                background: "#fff",
                overflow:"hidden",
                boxShadow: "0 3px 14px -1px #faaaaa",
              },
            }}
           isOpen={isOpen}
           onRequestClose={() => setIsOpen(false)}
           contentLabel="Example Modal"
            onAfterOpen={() => { document.getElementsByClassName("modalClose")[0].focus(); }}
        >
          <div classname="modalContent">
            <h2 style={{color:"red", fontWeight:"500",marginBottom: "2rem" }}>タスク<b>『{task.task}』</b>を削除しますか？</h2>
            <div className="modalBtns">
              <button className="modalBtn bg-red-500 right-0 bottom-0" onClick={handleDelete}>はい</button>
              <button className="modalClose modalBtn bg-gray-400 right-0 bottom-0" onClick={() => setIsOpen(false)}>いいえ</button>
            </div>
          </div>
        </Modal>

        <Modal
          style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              },
              content: {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                padding: "3vh 3vw 3vh 3vw",
                borderRadius: "0.8rem",
                border: "none",
                width: "60vw",
                height:"70vh",
                background: "#fff",
                overflow:"hidden",
                boxShadow: "0 3px 14px -1px #aaaafa",
              },
            }}
           isOpen={isUpdate}
           onRequestClose={() => setIsUpdate(false)}
            onAfterOpen={() => { document.getElementsByClassName("modalCloseU")[0].focus(); }}
        >
          <div classname="modalContent">
            <h2>『{task.task}』の内容を編集</h2>
            <div className="inputForm flex flex-col gap-2">
              <div className="flex flex-col"><span>タスク名</span><input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}  /></div>

              <div className="flex flex-row gap-4 w-full">
                <div className="flex flex-col w-3/8">
                  <span>重要度</span>
                  <select
                    className="select"
                    value={newImp}
                    onChange={(e) => setNewImp(e.target.value)}
                  >
                    <option value="1">🟦 低</option>
                    <option value="2">🟩 やや低</option>
                    <option value="3">🟨 中</option>
                    <option value="4">🟧 やや高</option>
                    <option value="5">🟥 高</option>
                  </select>
                </div>
                <div className="flex flex-col w-1/2">
                  <span className="white-nowrap">達成までに必要な時間</span>
                  <div className="flex flex-row items-center w-full gap-2">
                    <input
                      id="hours"
                      type="number"
                      min="0"
                      value={newHours}
                      onChange={(e) => setNewHours(e.target.value)}
                      className="w-15 py-2 px-2 border rounded-md text-center"
                    />
                    <label htmlFor="hours" className="text-base text-gray-600 whitespace-nowrap">時間</label>

                    <input
                      id="minutes"
                      type="number"
                      min={-1}
                      max={60}
                      value={newMins}
                      onChange={(e) =>
                        {const v = Number(e.target.value);
                          if (v < 0) setNewMins(59);
                          else if (v > 59) setNewMins(0);
                          else setNewMins(v);
                        }}
                      className="w-15 py-2 px-2 border rounded-md text-center"
                    />
                    <label htmlFor="minutes" className="text-base text-gray-600">分</label>
                  </div>
                </div>
              </div>

              <div className="ml-1">
                <div className="flex flex-col w-full">
                  <span>期間</span>
                  <div>
                    <input className="w-2/5! date-input mr-2!" type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} />から
                    <input className="w-2/5! date-input mr-2! ml-2!" type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <button
              style={{ transition:"0.3s ease",background: (newTitle==task.task&&newImp==task.imp&&newStart==task.sta&&newEnd==task.end&&newEst==task.est)?"#fde9d0": "rgba(122,122,255,0.9)"}}
              className="modalBtn top-0 right-0"
              disabled={newTitle==task.task&&newImp==task.imp&&newStart==task.sta&&newEnd==task.end&&newEst==task.est}
              onClick={(handleUpdate)}>
                更新する
              </button>
            <button className="modalCloseU modalBtn top-0 right-0 bg-gray-400" onClick={() => setIsUpdate(false)}>キャンセル</button>
              

          </div>
        </Modal>

      <div className="task-detail-container">
        <h1 className="task-title">{currentTask.task}</h1>

        <div className="task-info-section">
          <div className="info-item">
            <span className="info-label"> 期間:</span>
            <span className="info-value">{currentTask.sta} 〜 {currentTask.end}</span>
          </div>
        </div>

        {currentTask.sub}<br/>
        重要度:{["🟦低","🟩やや低","🟨中","🟧やや高","🟥高"][currentTask.imp-1]}<br/>
        必要な時間:{currentTask.est}分<br/>
        取り組んだ時間:{currentTask.doing}分<br/>
        残り日数:{calcDays(currentTask.sta,currentTask.end)}日<br/>
        1日あたり約:{Math.floor((currentTask.est-currentTask.doing)/calcDays(currentTask.sta,currentTask.end))}分 取り組む必要がある<br/>


        {/* --- ストップウォッチ --- */}
        <div className="stopwatch-section">
          <p> 作業時間を記録</p>
          <h3>{Math.floor((currentTask.est-currentTask.doing)/calcDays(currentTask.sta,currentTask.end))>0
          ?`今日はあと${Math.floor((currentTask.est-currentTask.doing)/calcDays(currentTask.sta,currentTask.end))}分取り組もう！`
          :"おっ！目標時間達成だ！やるなあ！"
          }</h3>
          <div className="time-display">{formatTime(elapsedTime)}</div>
          <div className="stopwatch-buttons">
            <button onClick={() => setIsRunning(true)} disabled={isRunning}>▶ 開始</button>
            <button onClick={() => setIsRunning(false)} disabled={!isRunning}>⏸ 停止</button>
            <button onClick={() => setElapsedTime(0)}>⏹ リセット</button>
            <button onClick={handleSaveTime}> 記録する</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .inputForm{
          margin:1rem;
          display: 
        }
        .inputForm span{
          font-weight:700;
          font-size:0.9rem;
        }
        .inputForm input,select{
          width: 100%;
          color: #0f0f0f;
          background: #f8fafc;
          padding: 12px;
          margin-top:0.3rem;
          margin-bottom:0.4rem;
          border-radius: 9px;
          border: 1px solid #e6edf3;
          font-size: 16px;
        }
        .select{
          width: 100%;
          font-size: 0.9rem;
          align-items:left;
        }

        .buttons{
          width:100%;
          position:relative;
          border-radius:0.75rem;
          font-size: 1.1rem;
          margin-bottom: 7vh;
          top:0;
          left:0;
          padding: 0.5rem;
        }
        .back-btn {
          position:absolute;
          display:flex;
          left:0; top:0;
          border-radius: 0.75rem;
          background: rgba(175,175,175,0.7);
          padding: 0.5rem 0.8rem;
          transition: 0.3s ease;
        }
        .back-btn:hover {
          background: rgba(175,175,175,0.5);
        }
        .delete-btn {
          border-radius: 0.75rem;
          color: rgba(255,40,40,0.9);
          background: rgba(255,30,30,0.7);
          padding: 0.5rem 0.8rem;
          transition: 0.3s ease;
        }
        .delete-btn:hover {
          opacity: 0.75;
        }
        .edit-btn {
          border-radius: 0.75rem;
          color: #000000;
          background: rgba(40,40,235,0.7);
          padding: 0.5rem 0.8rem;
          transition: 0.3s ease;
        }
        .edit-btn:hover {
          background: rgba(50,50,235,0.6);
        }

        /* モーダル関連 */

        
        


        /* ストップウォッチ関連 */

        .stopwatch-section {
          margin-top: 30px;
          background: #f3f4f6;
          padding: 16px;
          border-radius: 10px;
          text-align: center;
        }

        .time-display {
          font-size: 2rem;
          margin: 12px 0;
          color: #111827;
          font-weight: bold;
        }

        .stopwatch-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .stopwatch-buttons button {
          padding: 6px 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .stopwatch-buttons button:nth-child(1) {
          background: #10b981;
          color: white;
        }

        .stopwatch-buttons button:nth-child(2) {
          background: #f59e0b;
          color: white;
        }

        .stopwatch-buttons button:nth-child(3) {
          background: #ef4444;
          color: white;
        }

        .stopwatch-buttons button:nth-child(4) {
          background: #3b82f6;
          color: white;
        }

        .stopwatch-buttons button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

export default TaskDetailPage
