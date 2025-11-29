import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AITaskColl, { supabase } from "../components/AI/AITaskColl";
import { Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import NavigationBar from '../components/Function/NavigationBar';
import CalendarPage from '../components/Function/Pages/CalendarPage';
import AIChat from '../components/AI/AIChat';
import TaskPage from '../components/Function/Pages/TaskPage';
import TaskDetailPage from '../components/Function/Pages/TaskDetailPage';


export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      <div>お探しのページは見つかりませんでした。<br/><Link to="/calendar">ホームへ</Link></div>
    </div>
  )
}

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : {}
  })
  const [selectedTask, setSelectedTask] = useState(null)
  const [isNotFound, setIsNotFound] = useState(false);

  {/* タスク追加関数 */}
  const handleAddTaskFromAI = (data) => {
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

  {/* _init_ supabase読み込み */}
  useEffect(() => {
      const fetchTasks = async () => {
        try {
          const { data, error } = await supabase.from('tasks').select('*')
          if (error) throw error
          const loadedTasks = {}
          data.forEach((row) => {
            const task = {
              task: row.task_name,
              sub: row.sub_tasks,
              imp: row.importance,
              sta: row.start_date,
              end: row.end_date,
              state: row.state,
            }
            const key = formatDate(new Date(task.sta))
            if (!loadedTasks[key]) loadedTasks[key] = []
            loadedTasks[key].push(task)
          })
          setTasks(loadedTasks)
          localStorage.setItem('tasks', JSON.stringify(loadedTasks))
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
        title: task.task || task.title,
        startDate: task.sta || task.startDate,
        endDate: task.end || task.endDate,
        detail: task.sub || task.detail || '',
        priority: task.imp || task.priority || 0,
        estimatedTime: task.estimatedTime || 60,
        loggedTime: task.loggedTime || 0
      };
      setSelectedTask(normalizedTask);
      navigate('/taskdetail');
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

  return (

    // ルーティング
    <div className="app-container">
        <Routes>
          <Route path="/" element={<CalendarPage tasks={tasks} setTasks={setTasks} onTaskClick={handleTaskClick} />} />
          <Route path="/tasks" element={<TaskPage tasks={tasks} onTaskClick={handleTaskClick} />} />
          <Route path="/calendar" element={<CalendarPage tasks={tasks} setTasks={setTasks} onTaskClick={handleTaskClick} />} />
          <Route path="/addTask" element={<AITaskColl onTaskCreated={handleAddTaskFromAI} />} />
          <Route path="/taskdetail" element={<TaskDetailPage task={selectedTask} onBack={handleBack} onUpdateTask={handleUpdateTask} />} />
          <Route path="/aichat" element={<AIChat />} />
          <Route path="/groupwork" element={<CalendarPage tasks={tasks} setTasks={setTasks} onTaskClick={handleTaskClick} />} />
          <Route path="*" element={<NotFound setIsNotFound={setIsNotFound} />} />
        </Routes>
        {(!isNotFound) ? <NavigationBar />: null}
    </div>
  );

};

export default App;
