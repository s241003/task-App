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
import SettingsPage from '../components/Function/Pages/SettingsPage';

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
      <div>お探しのページが見つかりませんでした。<br/><Link to="/calendar">ホームへ</Link></div>
    </div>
  )
}

const App = () => {
 // -----------------------------------------------------------------------------------------------
  // モードの状態を App で管理する
  const [isDark, setIsDark] = useState(false);
  // return (
  //   // クラス名を isDark に応じて切り替える
  //   <div className={`app-container ${isDark ? 'dark' : 'light'}`}>
  //     <Routes>
  //       {/* ... 他のルート ... */}
  //       {/* SettingsPage に isDark と setIsDark を渡す */}
  //       <Route path="/setting" element={<SettingsPage isDark={isDark} setIsDark={setIsDark} />} />
  //     </Routes>
  //     <NavigationBar />
  //   </div>
  // );
};
//-------------------------------------------------------------------------------------------------------
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : {}
  })
    const [isNotFound, setIsNotFound] = useState(false);

  {/* タスク追加関数 */}
  const handleAddTaskFromAI = (data) => {
    const targetDate = data.dueDate ? (data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate)) : selectedDate;
    const taskText = data.taskName;
    if (!taskText) return;
    const targetKey = formatDate(targetDate);
    if (typeof setTasks === 'function') {
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        if (!newTasks[targetKey]) newTasks[targetKey] = [];
        newTasks[targetKey].push(taskText);
        if (data.subTasks && data.subTasks.length > 0) {
          data.subTasks.forEach((sub) => newTasks[targetKey].push(`- ${sub}`));
        }
        return newTasks;
      });
    }
    if (data.dueDate) setSelectedDate(targetDate);
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

  return (

    // ルーティング
    <div className="app-container">
        <Routes>
          <Route path="/" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/tasks" element={<TaskPage tasks={tasks} onTaskClicked={() => navigate("/")} />} />
          <Route path="/calendar" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/addTask" element={<AITaskColl onTaskCreated={handleAddTaskFromAI} />} />
          <Route path="/aichat" element={<AIChat />} />
          <Route path="/groupwork" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound setIsNotFound={setIsNotFound} />} />
        </Routes>
        {(!isNotFound) ? <NavigationBar />: null}
    </div>
     // -----------------------------------------------------------------------------------------------
  // モードの状態を App で管理する
  return (
    // クラス名を isDark に応じて切り替える
    <div className={`app-container ${isDark ? 'dark' : 'light'}`}>
      <Routes>
        {/* ... 他のルート ... */}
        {/* SettingsPage に isDark と setIsDark を渡す */}
        <Route path="/setting" element={<SettingsPage isDark={isDark} setIsDark={setIsDark} />} />
      </Routes>
      <NavigationBar />
    </div>
  );
};
//-------------------------------------------------------------------------------------------------------
  );

};

export default App;
