import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from "react-modal";

Modal.setAppElement("#root");

function TaskDetailPage({ tasks, onBack ,del ,update ,onUpdateTask }) {
  const [ task, setTask ] = useState({});
  const { taskId } = useParams();
  const [currentTask, setCurrentTask] = useState("")
  const [elapsedTime, setElapsedTime] = useState(task?.loggedTime || 0)
  const [isRunning, setIsRunning] = useState(false)
  const [ isOpen , setIsOpen ] = useState(false);
  const timerRef = useRef(null);


  useEffect(()=>{
    const flatArray = Object.values(tasks).flat();
    const matched =
      flatArray.find( t =>
      {
        return t.id === taskId;
      })
      setTask(matched);
      console.log({task, matched});
  },[taskId]);

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
    alert("タスクを削除しました!");
    navigate(-1);
  }

  const handleUpdate = ()=>{
    update()
  }




  // ⚠ --- currentTaskがまだ読み込まれていない場合 ---
  if (!currentTask) {
    return <div className="page-content">読み込み中...</div>
  }

  return (
    <div className="page-content">
      <div className="buttons">
        <button className="back-btn" onClick={handleBackClick}>← 戻る</button>
        <button className="delete-btn" >🗑️</button>
        <button className="edit-btn" onClick={()=>setIsOpen(true)}>📝</button>
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
                padding: "24px",
                borderRadius: "12px",
                border: "none",
                width: "400px",
                background: "#fff", 
              },
            }}
           isOpen={isOpen}
           onRequestClose={() => setIsOpen(false)}
           contentLabel="Example Modal"
            onAfterOpen={() => { document.getElementsByClassName("modalClose")[0].focus(); }}
        >
          <h2 style={{color:"red", fontWeight:"500",marginBottom: "1rem"}}>タスク『{task.task}』を削除しますか？</h2>
          <div classname="right-0 w-full flex justify-end!">
            <button className="bg-red-500 rounded-xl!  left-0! bottom-0! p-3! opacity-90" onClick={handleDelete}>はい</button>
            <button className="modalClose rounded-xl! bg-gray-400 ml-1! left-0! bottom-0! p-3! opacity-90" onClick={() => setIsOpen(false)}>いいえ</button>
          </div>
        </Modal>

      <div className="task-detail-container">
        <h1 className="task-title">{currentTask.task}</h1>

        <div className="task-info-section">
          <div className="info-item">
            <span className="info-label"> 期間:</span>
            <span className="info-value">{currentTask.sta} 〜 {currentTask.end}</span>
          </div>

          {currentTask.estimatedTime && (
            <div className="info-item">
              <span className="info-label"> 予想時間:</span>
              <span className="info-value">{currentTask.estimatedTime}分</span>
            </div>
          )}
        </div>

        {currentTask.sub}

        {/* --- ストップウォッチ --- */}
        <div className="stopwatch-section">
          <h3> 作業時間を記録</h3>
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
        .buttons{
          width:100%;
          position:relative;
          margin: 0;
          font-size: 1.1rem;
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
          position:absolute;
          display:flex;
          right: 6vw; top:0;
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
          position:absolute;
          display:flex;
          border-radius: 0.75rem;
          right:0; top:0;
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
