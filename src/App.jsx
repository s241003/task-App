import React, { useState, useEffect } from 'react';
import { supabase } from "../components/AI/AITaskColl"; // AITaskCollからインポート
import AITaskColl from "../components/AI/AITaskColl";
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import NavigationBar from '../components/Function/NavigationBar';
import CalendarPage from '../components/Function/Pages/CalendarPage';
import AIChat from '../components/AI/AIChat';
import TaskPage from '../components/Function/Pages/TaskPage';
import SettingsPage from '../components/Function/Pages/SettingsPage';

// --- ヘルパー関数 ---
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

// --- 404 コンポーネント ---
export const NotFound = ({ setIsNotFound }) => {
  useEffect(() => {
    setIsNotFound(true);
    return () => setIsNotFound(false);
  }, [setIsNotFound])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404: NOT FOUND</h1>
      <div>お探しのページが見つかりませんでした。<br /><Link to="/calendar">ホームへ</Link></div>
    </div>
  )
}

// --- メイン App コンポーネント ---
const App = () => {
  const navigate = useNavigate();

  // 1. タスクの状態管理
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : {}
  });

  // 2. テーマ（ダークモード）の状態管理
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark'; // 保存されていればそれを使い、なければfalse
  });

  const [isNotFound, setIsNotFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // テーマ変更時にLocalStorageへ保存
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // タスク追加関数
  const handleAddTaskFromAI = (data) => {
    const targetDate = data.dueDate ? (data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate)) : selectedDate;
    const taskText = data.taskName;
    if (!taskText) return;
    const targetKey = formatDate(targetDate);

    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      if (!newTasks[targetKey]) newTasks[targetKey] = [];
      
      // オブジェクト形式で保存するように調整（Supabaseの形式に合わせる）
      const newTaskObj = {
        task: taskText,
        sub: data.subTasks || [],
        imp: data.importance || 1,
        sta: targetDate,
        end: targetDate,
        state: false
      };

      newTasks[targetKey].push(newTaskObj);
      return newTasks;
    });

    if (data.dueDate) setSelectedDate(targetDate);
  };

  // Supabaseから初期データ取得
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
    // テーマによってクラス名を切り替え
    <div className={`app-container ${isDark ? 'is-dark' : 'is-light'}`}>
      <Routes>
        <Route path="/" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
        <Route path="/tasks" element={<TaskPage tasks={tasks} onTaskClicked={() => navigate("/")} />} />
        <Route path="/calendar" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
        <Route path="/addTask" element={<AITaskColl onTaskCreated={handleAddTaskFromAI} />} />
        <Route path="/aichat" element={<AIChat />} />
        <Route path="/groupwork" element={<CalendarPage tasks={tasks} setTasks={setTasks} />} />
        
        {/* SettingsPageにPropsを渡す */}
        <Route path="/settings" element={<SettingsPage isDark={isDark} setIsDark={setIsDark} />} />
        
        <Route path="*" element={<NotFound setIsNotFound={setIsNotFound} />} />
      </Routes>

      {!isNotFound && <NavigationBar />}
    </div>
  );
};

export default App;
