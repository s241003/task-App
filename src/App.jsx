import React, { useState } from 'react';
import './App.css';
import AITaskInput from '../components/AI/AITaskColl';

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

  // --- 追加: 日本の祝日判定ヘルパー（主な祝日をカバー、春分/秋分は近似式） ---
  const getNthWeekdayOfMonth = (year, month, weekday, nth) => {
    // month: 0-11, weekday: 0(Sun)-6(Sat)
    const first = new Date(year, month, 1);
    const firstWeekday = first.getDay();
    const diff = (7 + weekday - firstWeekday) % 7;
    return 1 + diff + (nth - 1) * 7;
  };

  const vernalEquinoxDay = (year) => {
    return Math.floor(20.8431 + 0.242194 * (year - 2000) - Math.floor((year - 2000) / 4));
  };

  const autumnalEquinoxDay = (year) => {
    return Math.floor(23.2488 + 0.242194 * (year - 2000) - Math.floor((year - 2000) / 4));
  };

  const isJapaneseHoliday = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1; // 1-12
    const d = date.getDate();

    // 固定日
    const fixed = {
      '1-1': "元日",
      '2-11': "建国記念の日",
      '2-23': "天皇誕生日",
      '4-29': "昭和の日",
      '5-3': "憲法記念日",
      '5-4': "みどりの日",
      '5-5': "こどもの日",
      '11-3': "文化の日",
      '11-23': "勤労感謝の日"
    };
    const key = `${m}-${d}`;
    if (fixed[key]) return fixed[key];

    // ハッピーマンデー（第n月曜）
    // 成人の日: 1月第2月曜
    if (m === 1 && d === getNthWeekdayOfMonth(y, 0, 1, 2)) return "成人の日";
    // 海の日: 7月第3月曜
    if (m === 7 && d === getNthWeekdayOfMonth(y, 6, 1, 3)) return "海の日";
    // 敬老の日: 9月第3月曜
    if (m === 9 && d === getNthWeekdayOfMonth(y, 8, 1, 3)) return "敬老の日";
    // 体育の日（スポーツの日）: 10月第2月曜
    if (m === 10 && d === getNthWeekdayOfMonth(y, 9, 1, 2)) return "スポーツの日";

    // 春分・秋分（近似）
    if (m === 3 && d === vernalEquinoxDay(y)) return "春分の日";
    if (m === 9 && d === autumnalEquinoxDay(y)) return "秋分の日";

    // 山の日: 8月11日（稀に移動だが固定で扱う）
    if (m === 8 && d === 11) return "山の日";

    // その他（移動祝日は簡易対応）
    return null;
  };

  // --- 既存: AI追加処理 ---
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

  // --- カレンダー描画（週末と祝日で色付け） ---
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

      const weekday = date.getDay(); // 0:Sun ... 6:Sat
      const holidayName = isJapaneseHoliday(date);
      const isHoliday = Boolean(holidayName);
      // 日付色
      let numberColor = '#0f172a';
      if (isHoliday || weekday === 0) numberColor = '#dc2626'; // 赤
      else if (weekday === 6) numberColor = '#2563eb'; // 青

      daysInMonth.push(
        <div
          key={day}
          style={{
            ...styles.day,
            ...(isSelected ? styles.selected : {}),
            ...(hasTask ? styles.hasTaskAccent : {})
          }}
          onClick={() => setSelectedDate(dateString)}
          title={holidayName ? holidayName : undefined}
        >
          <div style={{ ...styles.dayNumber, color: numberColor }}>
            <span>{day}</span>
          </div>

          {/* 祝日名を小ラベルで表示（ある場合） */}
          {isHoliday && (
            <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '6px' }}>
              {holidayName}
            </div>
          )}

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

  // --- 既存: 月移動処理 ---
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const styles = {
    calendarContainer: {
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginTop: '1rem',
    },
    header: {
      background: '#f9fafb',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e5e7eb',
    },
    weekRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      background: '#f3f4f6',
      padding: '10px 0',
      fontWeight: '500',
      color: '#374151',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
      padding: '10px',
    },
    day: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.2s',
    },
    dayNumber: {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.2',
    },
    dayTasks: {
      marginTop: '4px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    taskBadge: {
      background: '#2563eb',
      color: 'white',
      padding: '6px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    moreBadge: {
      fontSize: '12px',
      color: '#6b7280',
      textAlign: 'center',
    },
    empty: {
      height: '80px',
    },
    selected: {
      background: '#2563eb',
      color: 'white',
    },
    hasTaskAccent: {
      border: '2px solid #4ade80',
    },
    // 追加: カレンダー全体のスタイル
    calendarWrapper: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 16px',
    },
    // 追加: タスク入力部分のスタイル
    taskContainer: {
      marginTop: '1rem',
      padding: '16px',
      borderRadius: '8px',
      background: '#fff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    taskList: {
      listStyleType: 'none',
      padding: 0,
      margin: '0.5rem 0 0 0',
    },
    taskItem: {
      padding: '8px 0',
      borderBottom: '1px solid #e5e7eb',
    },
    taskInputWrapper: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
    },
    taskInput: {
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '16px',
      color: '#111827',
    },
    addButton: {
      padding: '10px 16px',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'background 0.2s',
    },
    addButtonDisabled: {
      background: '#e5e7eb',
      color: '#9ca3af',
      cursor: 'not-allowed',
    },
  };

  return (
    <div className="app-container">
      <h1>シンプルタスクカレンダー</h1>

      <div className="calendar-container" style={styles.calendarContainer}>
        <div className="calendar-header" style={styles.header}>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
          <h2>{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
        </div>

        <div className="calendar-weekdays" style={styles.weekRow}>
          <div style={{color:'#dc2626'}}>日</div>
          <div>月</div>
          <div>火</div>
          <div>水</div>
          <div>木</div>
          <div>金</div>
          <div style={{color:'#2563eb'}}>土</div>
        </div>

        <div className="calendar-grid" style={styles.grid}>{renderCalendar()}</div>
      </div>

      <div className="task-container" style={styles.taskContainer}>
        <AITaskInput onTaskCreated={handleAddTaskFromAI} />

        <h3 style={{ marginTop: '2rem' }}>{selectedDate} のタスク</h3>

        <ul className="task-list" style={styles.taskList}>
          {tasks[selectedDate] && tasks[selectedDate].length > 0 ? (
            tasks[selectedDate].map((task, index) => <li key={index} style={styles.taskItem}>{task}</li>)
          ) : (
            <p>この日のタスクはありません。</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default App;