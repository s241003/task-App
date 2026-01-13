import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AITaskColl, { supabase } from "../components/AI/AITaskColl";
import { Router, Route, Routes, Link, Navigate, useNavigate } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import NavigationBar from '../components/Function/NavigationBar';
import CalendarPage from '../components/Function/Pages/CalendarPage';
import AIChat from '../components/AI/AIChat';
import TaskPage from '../components/Function/Pages/TaskPage';
import TaskDetailPage from '../components/Function/Pages/TaskDetailPage';
import GroupWorkPage from "../components/Function/Pages/GroupWorkPage";
import Settings from "../components/Function/Pages/SettingsPage"
import Login from "../components/Function/Pages/LoginPage"


export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const calcDays = (sta, end) => {
  const startDate = new Date(sta);
  const endDate = new Date(end);
  const oneDay = 1000 * 60 * 60 * 24;
  const diff = Math.floor((endDate - startDate) / oneDay);
  return diff + 1;
};


export const formatDateDisplay = (date) => {
  if (!date) return "日付未選択";
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

export const NotFound = ({ setIsNotFound }) =>{
  useEffect(() => {
    setIsNotFound(true);
    return () => setIsNotFound(false);
  },[setIsNotFound])

  return(
    <div>
      <h1>404: NOT FOUND</h1>
      <div>お探しのページは見つかりませんでした。<br/><Link to="/">ホームへ</Link></div>
    </div>
  )
};

export const PopUp = ({text})=>{
  const [showPopUp ,setShowPopUp ] = useState(false);

      useEffect(()=>{
        text===``?null:setShowPopUp(true);
      },[text]);

      useEffect(()=>{
        const timer = setTimeout(() => {
          setShowPopUp(false);
        }, 2500);
      return () => clearTimeout(timer);
      },[showPopUp]);

    return(
      showPopUp&&text!==`` ? <div className="popup">{text}</div>:null
    )
};

export const DBname = "tasks";

{/* タスク追加関数 */}
export const onTaskCreated = (data) => {
  // AITaskColl から送信されたデータを使用 (data.sta を日付キーとして使用)
  const targetKey = data.sta;
  if (!targetKey) return;  // 日付が設定されていない場合は処理しない
  if (typeof setTasks === 'function') {
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      if (!newTasks[targetKey]) newTasks[targetKey] = [];
      // タスクオブジェクトとして保存 (Supabase 形式に合わせる)
      const newTask = {
        task: data.tas,
        sub: data.sub,
        imp: parseInt(data.imp),
        sta: data.sta,
        end: data.end,
      };
      newTasks[targetKey].push(newTask);
      localStorage.setItem('tasks', JSON.stringify({ ...prevTasks, [targetKey]: [...(prevTasks[targetKey] || []), newTask] }));
      return newTasks;
    });
  }
};

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks")
    return saved ? JSON.parse(saved) : {}
  })
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [theme, setTheme] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [isOpen ,setIsOpen] = useState(false);
  const [popUpText ,setPopUpText ] = useState(``);

  {/* _init_ supabase読み込み */}
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } =
        await supabase
          .from(DBname)
          .select('*')

        if (error) throw error
        const loadedTasks = {}
        data.forEach((row) => {
          const task = {
            task: row.task_name,
            sub: row.sub_tasks,
            imp: row.importance,
            est: row.estimated_time,
            doing: row.doing_time,
            sta: row.start_date,
            end: row.end_date,
            state: row.state,
            id: row.id,
          }
          const key = formatDate(new Date(task.sta))
          if (!loadedTasks[key]) loadedTasks[key] = []
          loadedTasks[key].push(task)
        })
          setTasks(loadedTasks)
          localStorage.setItem('tasks', JSON.stringify(loadedTasks))
          console.log({tasks});
        } catch (err) {
          console.warn('Supabase読み込み失敗:', err.message)
        }
      }
      fetchTasks()
  }, [])

  const navigate = useNavigate();

  // タスククリック時のハンドラー
  const handleTaskClick = (task) => {
    const normalizedTask = {
      taskId: task.id,
      title: task.task,
      startDate: task.sta,
      endDate: task.end,
      detail: task.sub,
      imp: task.imp,
      estimated: task.est,
      doing: task.doing,
      state: task.state,
    };
    setSelectedTask(normalizedTask);
    navigate(`/taskdetail/${normalizedTask.taskId}`);
    console.log({task, normalizedTask});
  };

  // タスク更新時のハンドラー (作業時間更新)
  const handleUpdateTask = (task, loggedTime) => {
    const dateKey = formatDate(new Date(task.startDate));
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      if (updatedTasks[dateKey]) {
        updatedTasks[dateKey] = updatedTasks[dateKey].map(existingTask => {
          const tTitle = existingTask.task || existingTask.title;
          const tStart = existingTask.sta || existingTask.startDate;
          const tEnd = existingTask.end || existingTask.endDate;
          if (tTitle === task.title && tStart === task.startDate && tEnd === task.endDate) {
            return { ...existingTask, loggedTime };
          }
          return existingTask;
        });
      }
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  // 戻るハンドラー
  const handleBack = () => {
    setSelectedTask(null);
    navigate(-1);
  };

  const deleteTask = async (id) => {
    try {
      const { error } =
        await supabase.
          from(DBname)
          .delete()
          .eq('id', id)

      } catch (err) {
        console.warn('[エラー] Supabase 削除 failed:', err.message)
      }
  };

  const updateTask = async (object, id) => {
    try{
      const { error } = await supabase
       .from(DBname)
        .update(object)
        .eq('id', id)
    }catch(err){
      console.warn('[エラー] Supabase 更新 failed:', err.message)
      
    }
    console.log(object);
  }

  return (

    // ルーティング
    <div className="flex flex-col gap-5">
      <div className="app-container">
        <PopUp text={popUpText}  />
        <AITaskColl isOpen={isOpen} setIsOpen={setIsOpen}/>
        <Routes>
          <Route path="/" element={<Navigate to={`/calendar/${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`} replace/>} />
          <Route path="/calendar/:current" element={<CalendarPage tasks={tasks} setTasks={setTasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} currentDate={currentDate} setCurrentDate={setCurrentDate} onTaskClick={handleTaskClick} isOpen={isOpen} setIsOpen={setIsOpen} />} />
          <Route path="/tasks" element={<TaskPage tasks={tasks} onTaskClick={handleTaskClick} />} />
          <Route path="/addTask" element={<AITaskColl />} />
          <Route path="/taskdetail/:taskId" element={<TaskDetailPage tasks={tasks} onBack={handleBack} del={deleteTask} update={updateTask} onUpdateTask={handleUpdateTask} setPopUpText={setPopUpText} />} />
          <Route path="/aichat" element={<AIChat setTasks={setTasks} setPopUpText={setPopUpText} />} />
          <Route path="/groupwork" element={<GroupWorkPage />} />
          <Route path="/settings" element={<Settings theme={theme} setTheme={setTheme}/>} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound setIsNotFound={setIsNotFound} />} />
        </Routes>
      </div>
        {(!isNotFound) ? <NavigationBar selectedDate={selectedDate} currentDate={currentDate} isOpen={isOpen} setIsOpen={setIsOpen}/>: null}
    </div>
  );

};

export default App;
