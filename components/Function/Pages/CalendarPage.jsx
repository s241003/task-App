import { useState ,useEffect } from "react";
import '../../../src/App.css';
import "./CalendarPage.css";
import AITaskColl from "../../AI/AITaskColl";
import { formatDate ,parseDate ,formatDateDisplay } from '../../../src/App';
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";


function CalendarPage({ tasks, setTasks,onTaskClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [today, setToday] = useState(new Date());
  const [expandedTasks, setExpandedTasks] = useState({});
  const [taskInput, setTaskInput] = useState('');

  const selectedTasksRaw = expandedTasks[formatDate(selectedDate)] || [];
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
  // todayの取得(1分毎)
  // ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== today.getDate()) {
        setToday(now);
      }
    }, 60000); // 1分ごと

    return () => clearInterval(timer);
  }, [today]);

  const navigate= useNavigate();

  // ─────────────────────────────────────────────
  // 期間タスクの展開
  // ─────────────────────────────────────────────
  useEffect(() => {
    const newExpandedTasks = {};

    // すべてのタスクを期間展開
    Object.values(tasks).flat().forEach(task => {
      if (task.sta && task.end) {
        // 期間タスクの場合
        const startDate = parseDate(task.sta);
        const endDate = parseDate(task.end);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateKey = formatDate(d);
          if (!newExpandedTasks[dateKey]) newExpandedTasks[dateKey] = [];
          newExpandedTasks[dateKey].push(task);
        }
      } else {
        // 単日タスクの場合
        const dateKey = task.sta || formatDate(new Date());
        if (!newExpandedTasks[dateKey]) newExpandedTasks[dateKey] = [];
        newExpandedTasks[dateKey].push(task);
      }
    });

    setExpandedTasks(newExpandedTasks);
  }, [tasks]);

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
      daysInMonth.push(<div key={`empty-start-${i}`} className="emptyDay" />);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const isSelected = dateString === formatDate(selectedDate);
      const isToday = dateString === formatDate(today);
      const dayTasks = expandedTasks[dateString] || [];
      const hasTask = dayTasks.length > 0;
      const hasStartTask = dayTasks.some(task => task.sta === dateString);
      const hasEndTask = dayTasks.some(task => task.end === dateString);
      const hasMiddleTask = dayTasks.some(task => task.sta < dateString && dateString < task.end && dateString !== task.sta && dateString !==task.end);
      const weekday = date.getDay();
      const holidayName = isJapaneseHoliday(date);
      const isHoliday = Boolean(holidayName);
      let numberColor = '#0f172a';
      if (isHoliday || weekday === 0) numberColor = '#dc2626';
      else if (weekday === 6) numberColor = '#2563eb';

      daysInMonth.push(
        <div
          key={day}
          className={`day ${isSelected ? 'selected' : ''} ${hasTask ? 'hasTaskAccent' : ''} `}
          onClick={() => setSelectedDate(date)}
          title={holidayName ? holidayName : undefined}
        >
          <div className="holiNumberContainer">
            <span className={`dayNumber ${isToday ? "today" :""}`} style={{ color: isToday ? "#f5f5f7" : numberColor} }>{day}</span>
          {isHoliday && (
            <span className="holiday">
              {holidayName}
            </span>
          )}
          </div>
          
          <div className="dayTasks">
            {dayTasks.slice(0, 2).map((t, idx) => {
              const raw = typeof t === 'string' ? t : t.task;
              const text = typeof raw === 'string' ? raw : (raw && (raw.text || raw.title)) || JSON.stringify(raw || '');
              const isStart = t.sta === dateString;
              const isEnd = t.end === dateString;
              const isMiddle = t.sta < dateString && dateString < t.end;
              const isSingle = isStart && isEnd;
              return (
                <div key={idx} onClick={()=>onTaskClick(t)}
                style={{
                  ...styles.taskBadge(t.imp),
                  ...(isSingle ? styles.taskSingle : {}),
                  ...(isStart && !isSingle ? styles.taskStart : {}),
                  ...(isEnd && !isSingle ? styles.taskEnd : {}),
                  ...(isMiddle ? styles.taskBetween(t.imp) : {}),

                }} className="taskBadge" title={text}>
                  {text}
                </div>
              );
            })}
            {dayTasks.length > 2 && (
              <div className="moreBadge">＋{dayTasks.length - 2} 件</div>
            )}
          </div>
        </div>
      );
    }
    const totalCells = firstDayOfMonth.getDay() + lastDayOfMonth.getDate();
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
      daysInMonth.push(<div key={`empty-end-${i}`} className="emptyDay" />);
    }

    return daysInMonth;
  };

  // ─────────────────────────────────────────────
  // スタイル
  // ─────────────────────────────────────────────
  // スマートフォンでの表示判定
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;
  const isTablet = typeof window !== 'undefined' && window.innerWidth <= 768;

  const styles = {
    taskBadge: (imp) => ({
      fontWeight: "500",
      backgroundColor: getPriorityColor(imp),
      color: '#ffffff',
      whiteSpace: 'normal',
      overflow: 'hidden',
      maxWidth: '100%',
      lineHeight: '1.1',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      fontSize: "0.8rem",
      padding: "0.3rem 0.5rem",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
    }),
    taskStart: {
      borderTopLeftRadius: "0.65rem",
      borderBottomLeftRadius: "0.65rem",
    },
    taskEnd: {
      borderTopRightRadius: "0.65rem",
      borderBottomRightRadius: "0.65rem",
    },
    taskSingle: {
      borderRadius: "0.65rem",
    },
    taskBetween:(imp)=> ({
      borderWidth: "2px 0",
      borderColor: getPriorityColor(imp),
      opacity: "0.75",
    }),
  };

  return (
    <div>
      <div className=" calendarContainer">
        <div className=" header">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
          <h2>{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
        </div>
        <div className="weekRow">
          <div className="weekday sunday">日</div>
          <div className="weekday">月</div>
          <div className="weekday">火</div>
          <div className="weekday">水</div>
          <div className="weekday">木</div>
          <div className="weekday">金</div>
          <div className="weekday saturday">土</div>
        </div>
        <div className="grid">
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
                <li key={index} className="task-item" onClick={()=>onTaskClick(task)}>
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
    </div>
  );
}

export default CalendarPage;
