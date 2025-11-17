import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from "../components/AI/AITaskColl";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import './App.css';
import NavigationBar from '../components/Function/NavigationBar';
import LoginPage from '../components/Function/Pages/LoginPage';
import CalendarPage from '../components/Function/Pages/CalendarPage';

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

export const NotFound = () =>{
  return(
    <div>
      <h1>404: NOT FOUND</h1>
      <div>お探しのページが見つかりませんでした。<br/><Link to="calendar">ホームへ</Link></div>
    </div>
  )
}

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : {}
  })

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

  return (

    // ルーティング
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/tasks" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/calendar" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/groupwork" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
          <Route path={`/*`} element={NotFound} />
        </Routes>
        <NavigationBar />
      </Router>
    </div>
  );

};

export default App;