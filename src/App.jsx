import React, { useState } from 'react';
import './App.css';
import AITaskInput from '../components/AI/AITaskColl';

// 日付を 'YYYY-MM-DD' 形式の文字列に変換する関数
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [tasks, setTasks] = useState({});
  const [taskInput, setTaskInput] = useState('');

  // スタイル（インラインで簡潔に）
  const styles = {
    calendarContainer: {
      background: '#f8fafc',
      padding: '16px',
      borderRadius: '14px',
      boxShadow: '0 2px 6px rgba(14,30,37,0.06)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px'
    },
    weekRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      textAlign: 'center',
      color: '#6b7280',
      fontWeight: 600,
      marginBottom: '8px',
      gap: '6px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
    },
    day: {
      minHeight: '88px',
      padding: '8px',
      border: '1px solid #e6edf3',
      borderRadius: '12px',
      background: '#ffffff',
      boxSizing: 'border-box',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      transition: 'transform 0.08s ease, box-shadow 0.08s ease'
    },
    dayHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(16,24,40,0.04)'
    },
    dayNumber: {
      fontSize: '14px',
      color: '#0f172a',
      fontWeight: 700,
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    dayTasks: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      marginTop: '4px'
    },
    taskBadge: {
      background: '#ecfdf5',
      color: '#065f46',
      padding: '6px 8px',
      borderRadius: '999px',
      fontSize: '12px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%'
    },
    moreBadge: {
      fontSize: '12px',
      color: '#6b7280'
    },
    selected: {
      background: '#eef2ff',
      border: '1px solid #c7d2fe'
    },
    hasTaskAccent: {
      boxShadow: 'inset 0 0 0 2px rgba(16,185,129,0.06)'
    },
    empty: {
      minHeight: '88px',
      padding: '8px',
      border: '1px dashed transparent',
      borderRadius: '12px',
      background: 'transparent'
    }
  };

  // ★★★ AIからのデータでタスクを追加 ★★★
  const handleAddTaskFromAI = (data) => {
    const targetDate = data.dueDate || selectedDate;
    const taskText = data.taskName;

    if (!taskText) return;

    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      if (!newTasks[targetDate]) {
        newTasks[targetDate] = [];
      }
      newTasks[targetDate].push(taskText);

      if (data.subTasks && data.subTasks.length > 0) {
        data.subTasks.forEach((sub) => newTasks[targetDate].push(`- ${sub}`));
      }
      return newTasks;
    });

    if (data.dueDate) {
      setSelectedDate(data.dueDate);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = [];

    // 月の初日まで空白を埋める
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      daysInMonth.push(
        <div key={`empty-${i}`} style={styles.empty} />
      );
    }

    // 日付を生成
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const isSelected = dateString === selectedDate;
      const dayTasks = tasks[dateString] || [];
      const hasTask = dayTasks.length > 0;

      daysInMonth.push(
        <div
          key={day}
          style={{
            ...styles.day,
            ...(isSelected ? styles.selected : {}),
            ...(hasTask ? styles.hasTaskAccent : {})
          }}
          onClick={() => setSelectedDate(dateString)}
        >
          <div style={styles.dayNumber}>
            <span>{day}</span>
          </div>

          <div style={styles.dayTasks}>
            {dayTasks.slice(0, 3).map((t, idx) => (
              <div key={idx} style={styles.taskBadge} title={t}>
                {t}
              </div>
            ))}

            {dayTasks.length > 3 && (
              <div style={styles.moreBadge}>＋{dayTasks.length - 3} 件</div>
            )}
          </div>
        </div>
      );
    }

    return daysInMonth;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="app-container">
      <h1>シンプルタスクカレンダー</h1>

      {/* カレンダー本体 */}
      <div className="calendar-container" style={styles.calendarContainer}>
        <div className="calendar-header" style={styles.header}>
          <button onClick={goToPreviousMonth}>&lt;</button>
          <h2>{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</h2>
          <button onClick={goToNextMonth}>&gt;</button>
        </div>

        <div className="calendar-weekdays" style={styles.weekRow}>
          <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div>
        </div>

        <div className="calendar-grid" style={styles.grid}>{renderCalendar()}</div>
      </div>

      <div className="task-container">
        <AITaskInput onTaskCreated={handleAddTaskFromAI} />

        <h3 style={{ marginTop: '2rem' }}>{selectedDate} のタスク</h3>

        <ul className="task-list">
          {tasks[selectedDate] && tasks[selectedDate].length > 0 ? (
            tasks[selectedDate].map((task, index) => <li key={index}>{task}</li>)
          ) : (
            <p>この日のタスクはありません。</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default App;
