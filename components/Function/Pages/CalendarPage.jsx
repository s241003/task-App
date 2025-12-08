
import { useState } from "react";
import '../../../src/App.css';
import AITaskColl from "../../AI/AITaskColl";
import { formatDate, formatDateDisplay } from '../../../src/App';
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

function CalendarPage({ tasks, setTasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskInput, setTaskInput] = useState('');

  const key = selectedDate ? formatDate(selectedDate) : null;
  const selectedTasksRaw = key && tasks[key] ? tasks[key] : [];
  let selectedTasks = selectedTasksRaw.map((t) => {
    if (typeof t === 'string') return { task: t, imp: 0 };
    const rawTask = t.task;
    const safeTask = typeof rawTask === 'string' ? rawTask : (rawTask && (rawTask.text || rawTask.title)) || JSON.stringify(rawTask || '');
    return {
      task: safeTask || '',
      imp: typeof t.imp === 'number' ? t.imp : 0,
      sta: t.sta,
      end: t.end,
      ...t,
    };
  });
  selectedTasks = [...selectedTasks].sort((a, b) => (b.imp || 0) - (a.imp || 0));

  const getPriorityColor = (level) => {
    switch (level) {
      case 1: return '#60a5fa';
      case 2: return '#34d399';
      case 3: return '#facc15';
      case 4: return '#fb923c';
      case 5: return '#ef4444';
      default: return '#d1d5db';
    }
  };

  const pad = (v) => String(v).padStart(2, '0');
  const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  // ─────────────────────────────────────────────
  // 祝日判定
  // ─────────────────────────────────────────────
  const getNthWeekdayOfMonth = (year, month, weekday, nth) => {
    const first = new Date(year, month, 1);
    const firstWeekday = first.getDay();
    const diff = (7 + weekday - firstWeekday) % 7;
    return 1 + diff + (nth - 1) * 7;
  };

  const vernalEquinoxDay = (year) => Math.floor(20.8431 + 0.242194 * (year - 2000) - Math.floor((year - 2000) / 4));
  const autumnalEquinoxDay = (year) => Math.floor(23.2488 + 0.242194 * (year - 2000) - Math.floor((year - 2000) / 4));

  const getHolidaysForYear = (year) => {
    const map = {};
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
    for (const k in fixed) {
      const [m, d] = k.split('-').map(Number);
      const dt = new Date(year, m - 1, d);
      map[toKey(dt)] = fixed[k];
    }
    const add = (m, dayOfMonth, name) => {
      map[toKey(new Date(year, m - 1, dayOfMonth))] = name;
    };
    add(1, getNthWeekdayOfMonth(year, 0, 1, 2), "成人の日");
    add(7, getNthWeekdayOfMonth(year, 6, 1, 3), "海の日");
    add(9, getNthWeekdayOfMonth(year, 8, 1, 3), "敬老の日");
    add(10, getNthWeekdayOfMonth(year, 9, 1, 2), "スポーツの日");
    map[toKey(new Date(year, 2, vernalEquinoxDay(year)))] = "春分の日";
    map[toKey(new Date(year, 8, autumnalEquinoxDay(year)))] = "秋分の日";
    map[toKey(new Date(year, 7, 11))] = "山の日";
    return map;
  };

  const isJapaneseHoliday = (date) => {
    const y = date.getFullYear();
    const holidays = getHolidaysForYear(y);
    return holidays[toKey(date)] || null;
  };

  // ─────────────────────────────────────────────
  // タスク追加
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // カレンダー描画
  // ─────────────────────────────────────────────
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = [];

    // 空白セル
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      daysInMonth.push(<div key={`empty-${i}`} style={{ ...styles.day, ...styles.emptyDay }} />);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const isSelected = dateString === formatDate(selectedDate);
      const dayTasks = tasks[dateString] || [];
      const sorted = [...dayTasks].sort((a, b) => b.priority - a.priority)//追加
      const hasTask = dayTasks.length > 0;
      const weekday = date.getDay();
      const holidayName = isJapaneseHoliday(date);
      const isHoliday = Boolean(holidayName);
      let numberColor = '#0f172a';
      if (isHoliday || weekday === 0) numberColor = '#dc2626';
      else if (weekday === 6) numberColor = '#2563eb';

      daysInMonth.push(
        <div
          key={day}
          style={{ ...styles.day, ...(isSelected ? styles.selected : {}), ...(hasTask ? styles.hasTaskAccent : {}) }}
          onClick={() => setSelectedDate(date)}
          title={holidayName ? holidayName : undefined}
        >
          <div style={{ ...styles.dayNumber, color: numberColor }}>
            <span>{day}</span>
          </div>
          {isHoliday && (
            <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '6px' }}>
              {holidayName}
            </div>
          )}
          <div style={styles.dayTasks}>
            {dayTasks.slice(0, 3).map((t, idx) => { 
              const raw = typeof t === 'string' ? t : t.task;
              const text = typeof raw === 'string' ? raw : (raw && (raw.text || raw.title)) || JSON.stringify(raw || '');
              return (
                <div key={idx} style={styles.taskBadge(t.imp)} title={text}>
                  {text}
                </div>
              );
            })}
            {dayTasks.length > 3 && (
              <div style={styles.moreBadge}>＋{dayTasks.length - 3} 件</div>
            )}
          </div>
        </div>
      );
    }
    return daysInMonth;
  };
  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // スタイル
  // ─────────────────────────────────────────────
  const styles = {
    calendarContainer: {
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
      marginTop: '1rem',
      width: '100%',      // ← 画面いっぱい
      maxWidth: '100%',
      boxSizing: 'border-box',
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
      gap: '3px',
      padding: '6px',
      justifyContent: 'stretch', // ←列を画面いっぱいに広げる
      width: '100%',
      boxSizing: 'border-box',
      gridAutoRows: 'minmax(80px, auto)',
    },
    day: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '0.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.15s, transform 0.08s',
      width: '100%',
      aspectRatio: '1 / 1', // 正方形統一
      overflow: 'hidden',
      boxSizing: 'border-box',
      background: '#ffffff',
      border: '1px solid #e6edf3',
      boxShadow: '0 1px 1px rgba(15,23,42,0.04)',
    },
    emptyDay: {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      cursor: 'default',
      width: '100%',
      aspectRatio: '1 / 1',
    },
    dayNumber: {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.2',
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    dayTasks: {
      marginTop: '6px',
      width: '90%',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      margin: '0 auto',
    },
    taskBadge: (imp) => ({
      fontWeight: "bold",
      backgroundColor: getPriorityColor(imp),
      color: '#ffffff',
      padding: '0.15rem 0.5rem',
      borderRadius: '999px',
      fontSize: '0.8rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%'
    }),
    moreBadge: {
      fontSize: '1rem',
      color: '#f5f5f5',
      textAlign: 'center',
    },
    selected: {
      background: '#eef2ff',
      border: '1px solid #c7d2fe',
      boxShadow: '0 3px 12px rgba(37,99,235,0.06)',
    },
    hasTaskAccent: {
      boxShadow: 'inset 0 0 0 2px rgba(16,185,129,0.06)',
    },
  };

  return (
    <div className="page-content" style={{ width: '100%', padding: '0 1rem', boxSizing: 'border-box' }}>
      <h1>カレンダー</h1>
      <div className="calendar-container" style={styles.calendarContainer}>
        <div className="calendar-header" style={styles.header}>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
          <h2>{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
        </div>
        <div className="calendar-weekdays" style={styles.weekRow}>
          <div style={{ color: '#dc2626' }}>日</div>
          <div>月</div>
          <div>火</div>
          <div>水</div>
          <div>木</div>
          <div>金</div>
          <div style={{ color: '#2563eb' }}>土</div>
        </div>
        <div className="calendar-grid" style={styles.grid}>
          {renderCalendar()}
        </div>
      </div>

      <div className="task-container">
        <Button  onClick={ ()=> navigate("/addtask")} >タスク作成</Button>
        <div className="task-list-section">
          <h3 style={{ marginTop: '2rem' }}>{formatDate(selectedDate)} のタスク</h3>
          {selectedTasks.length === 0 ? (
            <p>タスクはありません</p>
          ) : (
            <ul className="task-list">
              {selectedTasks.map((task, index) => (
                <li key={index} className="task-item">
                  <div className="priority-bar" style={{ backgroundColor: getPriorityColor(task.imp) }} />
                  <div className="task-content">
                    <strong>{String(task.task)}</strong>
                    <div className="task-meta">
                      {task.sta && task.end && (<span>{task.sta}〜{task.end}</span>)}
                      <span>重要度: {task.imp || 0}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style jsx>{`
        .task-list-section { margin-top: 20px; }
        .task-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
        .task-item { position: relative; display: flex; align-items: stretch; border: 1.5px solid #e5e7eb; border-radius: 6px; background: white; transition: all 0.2s; overflow: hidden; }
        .priority-bar { position: absolute; left: -1.5px; top: -1.5px; bottom: -1.5px; width: 8px; border-radius: 6px 0 0 6px; }
        .task-item:hover { border-color: #3b82f6; background: #f9fafb; transform: translateY(-1px); }
        .task-content { display: flex; flex-direction: column; padding: 6px 10px; color: #111; font-size: 0.9rem; }
        .task-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.8rem; color: #6b7280; }
      `}</style>
    </div>
  );
}

export default CalendarPage;
