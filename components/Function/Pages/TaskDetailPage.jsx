import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PopUp, { calcDays } from "../../../src/App"
import { Container,Modal,Typography,Button,ButtonGroup,Box,FormControl,InputLabel,MenuItem,Select,TextField } from "@mui/material";
import { supabase } from '../../AI/AITaskColl';
import dayjs from "dayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';



function TaskDetailPage({ tasks, onBack ,del ,update ,onUpdateTask ,setPopUpText }) {
  const [ task, setTask ] = useState({});
  const { taskId } = useParams();
  const [currentTask, setCurrentTask] = useState("");
  const [elapsedTime, setElapsedTime] = useState(task?.loggedTime || 0);
  const [isRunning, setIsRunning] = useState(false)
  const [ isOpen , setIsOpen ] = useState(false);
  const [ isUpdate , setIsUpdate ] = useState(false);
  const timerRef = useRef(null);
  const today = dayjs().format("YYYY-MM-DD");


  /* タスク更新関連 */
  const [ newTitle,setNewTitle ] = useState("");
  const [ newStart,setNewStart ] = useState("");
  const [ newImp,setNewImp ] = useState("");
  const [ newEnd,setNewEnd ] = useState("");
  const [newHours, setNewHours] = useState(0);
  const [newMins, setNewMins] = useState(0);
  const [newEst, setNewEst] = useState("");
  const [newDoing, setNewDoing] = useState(0);

  const fetchTasks = async () => {
    let sum=0;
    try {
      const { data, error } =
      await supabase
        .from("doingTime")
        .select('*')

      if (error) throw error
      const loadedTasks = {}
      data.map((row) => {
        const task = {
          id: row.taskid,
          date: row.date,
          doing: row.workedTime,
        }
        if (task.id != currentTask.id||task.date!=today) return; // ユーザーIDが一致しない場合はスキップ
        sum+=parseInt(task.doing);
      })
      } catch (err) {
        console.warn('Supabase読み込み失敗:', err.message)
      }
      console.log({sum});
      return sum;
    }

  const [todayWork,setTodayWork] = useState(() => fetchTasks());

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

  const saveTimeSupabase = async (taskId, time) => {
  // ① doingTime テーブルに記録
  const { data: insertData, error: insertError } = await supabase
    .from('doingTime')
    .insert([
      {
        taskid: taskId,
        date: today,
        workedTime: time,
      },
    ]);

  if (insertError) {
    console.error('Insert Error:', insertError);
    return;
  }
  console.log('Insert success:', insertData);

  // ② 現在の doing_time を取得
  const { data: taskData, error: selectError } = await supabase
    .from("tasks")
    .select("doing_time")
    .eq("id", taskId)
    .single();

  if (selectError) {
    console.error("Select Error:", selectError);
    return;
  }

  const currentDoing = taskData.doing_time || 0;

  // ③ doing_time に加算して更新
  const { error: updateError } = await supabase
    .from("tasks")
    .update({
      doing_time: currentDoing + time
    })
    .eq("id", taskId);

  if (updateError) {
    console.error("Update Error:", updateError);
  } else {
    console.log("Update success");
  }
};


  // 💾 --- 時間を記録する処理 ---
  const handleSaveTime = async () => {
    const updated = { ...currentTask, loggedTime: elapsedTime }
    localStorage.setItem('selectedTask', JSON.stringify(updated))
    await saveTimeSupabase(currentTask.id, Math.floor(elapsedTime/60));

    alert('作業時間を記録しました！')

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
    
    <Container sx={{my: 4, bgcolor: '#f5f5f5', padding: 3, borderRadius: 4}} className="relative">
      <div className="buttons">
        <button className="back-btn" onClick={handleBackClick}>← 戻る</button>
        <div className="flex flex-row gap-2 absolute right-0 top-0">
          <Button className="delete-btn" onClick={()=>setIsOpen(true)}><DeleteIcon /></Button>
          <Button className="edit-btn" onClick={()=>setIsUpdate(true)}><EditIcon /></Button>
        </div>
      </div>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Container maxWidth="sm">
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 350,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: "center",
              fontSize: 16
            }}
          >
              <Typography variant="h6" mb={2} fontWeight={500}>タスク<b>『{task.task}』</b>を削除しますか？</Typography>
                <Button variant="contained" color="error" mr={2} onClick={handleDelete}>はい</Button>
                <Button variant="text" color="secondary" ml={2} onClick={() => setIsOpen(false)}>いいえ</Button>
          </Box>
        </Container>
      </Modal>

      <Modal open={isUpdate} onClose={() => setIsUpdate(false)}>
        <Container maxWidth="sm">
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 360,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: "center",
              fontSize: 16
            }}
          >
            <Typography variant="h6" mb={2} fontWeight={500}>『{task.task}』の内容を編集</Typography>
            <div className="inputForm flex flex-col gap-3">
              <div className="flex flex-col"><TextField label="タスク名" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}  /></div>

                <FormControl width="40%" mt={2}>
                  <InputLabel id="importance">重要度</InputLabel>
                  <Select
                    labelId="importance"
                    id="demo-simple-select"
                    value={newImp}
                    label="重要度"
                    onChange={(e) => setNewImp(e.target.value)}
                  >
                    <MenuItem value={1}>🟦 低</MenuItem>
                    <MenuItem value={2}>🟩 やや低</MenuItem>
                    <MenuItem value={3}>🟨 中</MenuItem>
                    <MenuItem value={4}>🟧 やや高</MenuItem>
                    <MenuItem value={5}>🟥 高</MenuItem>
                  </Select>
                </FormControl>
                  <div className="flex flex-row items-center w-full gap-2">

                    <TextField
                      label="見込み時間"
                      type="number"
                      size="small"
                      value={newHours}
                      onChange={(e) => setNewHours(e.target.value)}
                    />
                    <Typography p={0.5} style={{whiteSpace:"nowrap"}}>時間</Typography>
                    <TextField
                      label=""
                      type="number"
                      size="small"
                      value={newMins}
                      onChange={(e) => setNewMins(e.target.value)}
                    />
                    <Typography p={0.5}>分</Typography>
                  </div>

              <div className="ml-1">
                <div className="flex flex-row w-full mb-4 items-center">
                  <TextField label="開始日" type="date" value={newStart} inputProps={{ className: "date-input p-2.5" }} onChange={(e) => setNewStart(e.target.value)} />
                    <Typography style={{whiteSpace:"nowrap"}}>から</Typography>
                  <TextField label="締切日" type="date" value={newEnd} inputProps={{ className: "date-input p-2.5" }} onChange={(e) => setNewEnd(e.target.value)} />
                </div>
              </div>
            </div>
            <Button color="primary" variant="contained" size="large"
              disabled={newTitle==task.task&&newImp==task.imp&&newStart==task.sta&&newEnd==task.end&&newEst==task.est}
              onClick={(handleUpdate)}>
                更新する
              </Button>
            <Button variant="text" color="secondary" size="large" onClick={() => setIsUpdate(false)}>キャンセル</Button>
          </Box>
        </Container>
      </Modal>

      <div  className="task-detail-container">
        <h1 className="task-title">{currentTask.task}</h1>

        <div className="task-info-section">
          <div className="info-item">
            <span className="info-label"> 期間:</span>
            <span className="info-value">{currentTask.sta} 〜 {currentTask.end}</span>
          </div>
        </div>


        {currentTask.sub}

      
        重要度:{["🟦低","🟩やや低","🟨中","🟧やや高","🟥高"][currentTask.imp-1]}<br/>
        必要な時間:{currentTask.est}分<br/>
        取り組んだ時間:{currentTask.doing}分<br/>
        残り日数:{calcDays(currentTask.sta,currentTask.end)}日<br/>
        1日あたり約:{Math.floor((currentTask.est-currentTask.doing)/calcDays(currentTask.sta,currentTask.end))}分 取り組む必要がある<br/>


        {/* --- ストップウォッチ --- */}
        <div className="stopwatch-section">
          <p> 作業時間を記録</p>
          <h3>{Math.floor((currentTask.est-todayWork)/calcDays(currentTask.sta,currentTask.end))>0
          ?`今日はあと${Math.floor((currentTask.est-todayWork)/calcDays(currentTask.sta,currentTask.end))}分取り組もう！`
          :"おっ！目標時間達成だ！やるなあ！"
          }</h3>
          <div className="time-display">{formatTime(elapsedTime)}</div>
          <div className="stopwatch-buttons">
          <ButtonGroup variant="contained" aria-label="outlined primary button group" style={{whiteSpace:"nowrap"}}>
            <Button onClick={() => setIsRunning(true)} disabled={isRunning}>▶開始</Button>
            <Button onClick={() => setIsRunning(false)} disabled={!isRunning}>⏸停止</Button>
            <Button onClick={() => setElapsedTime(0)}>⏹リセット</Button>
            <Button onClick={handleSaveTime}>記録</Button>
          </ButtonGroup>
          </div>
        </div>
      </div>

      <style jsx>{`

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
          color: #bb0000;
          background: rgba(255,30,30,0.7);
          padding: 0.5rem 0.2rem;
          transition: 0.3s ease;
        }
        .delete-btn:hover {
          opacity: 0.75;
        }
        .edit-btn {
          border-radius: 0.75rem;
          color: #000000;
          background: rgba(40,40,235,0.7);
          padding: 0.5rem 0.2rem;
          transition: 0.3s ease;
        }
        .edit-btn:hover {
          background: rgba(50,50,235,0.6);
        }

        /* モーダル関連 */

        
        


        /* ストップウォッチ関連 */

        .stopwatch-section {
          margin-top: 30px;
          background: rgba(220,220,220,0.6);
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
    </Container>
  )
}

export default TaskDetailPage
