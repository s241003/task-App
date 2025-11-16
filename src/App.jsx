import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';
import NavigationBar from '../components/Function/NavigationBar';
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


const App = () => {
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('lastPage') || 'calendar')
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


  {/* ナビゲーションバー切り換え */}
  const renderPage = () => {
    switch (currentPage) {
      case 'tasks':
        return <p>タスク</p>
      case 'task-detail':
        return <p>タスク詳細</p>
      case 'calendar':
        return <CalendarPage tasks={tasks} />
      case 'groupwork':
        return <p>グループワーク</p>
      case 'settings':
        return <p>設定</p>
      default:
        return <CalendarPage />
    }
  }

  return (
    <div className="app-container">
      {renderPage()}
      <NavigationBar currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );

};

export default App;