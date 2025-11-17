// import { useState } from "react";
// import '../../../src/App.css';
// import AITaskColl from "../../AI/AITaskColl";
// import { formatDate,formatDateDisplay } from '../../../src/App';

// function CalendarPage({tasks, setTasks})
// {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [taskInput, setTaskInput] = useState('');

//   const key = selectedDate ? formatDate(selectedDate) : null;
//   // 生データ（文字列またはオブジェクト）が入る可能性があるため正規化する
//   const selectedTasksRaw = key && tasks[key] ? tasks[key] : [];
//   let selectedTasks = selectedTasksRaw.map((t) => {
//     if (typeof t === 'string') return { task: t, imp: 0 };
//     // t がオブジェクトの場合、task フィールドが文字列でない可能性に対応
//     const rawTask = t.task;
//     const safeTask =
//       typeof rawTask === 'string'
//         ? rawTask
//         : // try common nested fields or fallback to JSON
//           (rawTask && (rawTask.text || rawTask.title)) || JSON.stringify(rawTask || '');
//     return {
//       task: safeTask || '',
//       imp: typeof t.imp === 'number' ? t.imp : 0,
//       sta: t.sta,
//       end: t.end,
//       // preserve other fields if needed
//       ...t,
//     };
//   });

//   // ★ 重要度が高い順にソート
//   selectedTasks = [...selectedTasks].sort((a, b) => (b.imp || 0) - (a.imp || 0))

//   // ★ 重要度に応じた色（TaskPageと統一）
//   const getPriorityColor = (level) => {
//     switch (level) {
//       case 1: return '#60a5fa' // 青（低）
//       case 2: return '#34d399' // 緑（やや低）
//       case 3: return '#facc15' // 黄（普通）
//       case 4: return '#fb923c' // オレンジ（高）
//       case 5: return '#ef4444' // 赤（最重要）
//       default: return '#d1d5db' // グレー（未設定）
//     }
//   }



//   // --- 祝日関連ユーティリティ: 年単位で祝日マップを生成（振替・国民の休日を含む） ---
//   const pad = (v) => String(v).padStart(2, '0');
//   const toKey = (date) => {
//     return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
//   };

//   const getNthWeekdayOfMonth = (year, month, weekday, nth) => {
//     // month: 0-11, weekday: 0(Sun)-6(Sat)
//     const first = new Date(year, month, 1);
//     const firstWeekday = first.getDay();
//     const diff = (7 + weekday - firstWeekday) % 7;
//     return 1 + diff + (nth - 1) * 7;
//   };

//   const vernalEquinoxDay = (year) => {
//     return Math.floor(20.8431 + 0.242194 * (year - 2000) - Math.floor((year - 2000) / 4));
//   };

//   const autumnalEquinoxDay = (year) => {
//     return Math.floor(23.2488 + 0.242194 * (year - 2000) - Math.floor((year - 2000) / 4));
//   };

//   const getHolidaysForYear = (year) => {
//     const map = {}; // key: 'YYYY-MM-DD' -> name

//     // 固定日（主なもの）
//     const fixed = {
//       '1-1': "元日",
//       '2-11': "建国記念の日",
//       '2-23': "天皇誕生日",
//       '4-29': "昭和の日",
//       '5-3': "憲法記念日",
//       '5-4': "みどりの日",
//       '5-5': "こどもの日",
//       '11-3': "文化の日",
//       '11-23': "勤労感謝の日"
//     };

//     for (const k in fixed) {
//       const [m, d] = k.split('-').map(Number);
//       const dt = new Date(year, m - 1, d);
//       map[toKey(dt)] = fixed[k];
//     }

//     // ハッピーマンデー等（第n月曜）
//     const add = (m, dayOfMonth, name) => { map[toKey(new Date(year, m - 1, dayOfMonth))] = name; };
//     add(1, getNthWeekdayOfMonth(year, 0, 1, 2), "成人の日"); // 1月第2月曜
//     add(7, getNthWeekdayOfMonth(year, 6, 1, 3), "海の日"); // 7月第3月曜
//     add(9, getNthWeekdayOfMonth(year, 8, 1, 3), "敬老の日"); // 9月第3月曜
//     add(10, getNthWeekdayOfMonth(year, 9, 1, 2), "スポーツの日"); // 10月第2月曜

//     // 春分・秋分
//     map[toKey(new Date(year, 2, vernalEquinoxDay(year)))] = "春分の日";
//     map[toKey(new Date(year, 8, autumnalEquinoxDay(year)))] = "秋分の日";

//     // 山の日
//     map[toKey(new Date(year, 7, 11))] = "山の日";

//     // --- 振替休日 ---
//     // 元の祝日が日曜の場合、その次の平日を振替休日にする（既に祝日の場合はさらに次の日へ）
//     const keys = Object.keys(map).sort();
//     keys.forEach((k) => {
//       const parts = k.split('-').map(Number);
//       const dt = new Date(parts[0], parts[1] - 1, parts[2]);
//       if (dt.getDay() === 0) {
//         // 次の日から探す
//         let next = new Date(dt);
//         next.setDate(next.getDate() + 1);
//         // ループで次の平日でかつ祝日ではない日を見つける
//         while (map[toKey(next)]) {
//           next.setDate(next.getDate() + 1);
//         }
//         map[toKey(next)] = "振替休日";
//       }
//     });

//     // --- 国民の休日 ---
//     // 2つの祝日に挟まれた平日を国民の休日にする
//     // 年内の日を走査
//     const start = new Date(year, 0, 1);
//     const end = new Date(year, 11, 31);
//     for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//       const key = toKey(d);
//       if (map[key]) continue;
//       const prev = new Date(d); prev.setDate(d.getDate() - 1);
//       const next = new Date(d); next.setDate(d.getDate() + 1);
//       if (map[toKey(prev)] && map[toKey(next)]) {
//         map[key] = "国民の休日";
//       }
//     }

//     return map;
//   };

//   const isJapaneseHoliday = (date) => {
//     const y = date.getFullYear();
//     const holidays = getHolidaysForYear(y);
//     return holidays[toKey(date)] || null;
//   };

//   // --- 既存: AI追加処理 ---
//   const handleAddTaskFromAI = (data) => {
//     // targetDate を Date に正規化
//     const targetDate = data.dueDate
//       ? (data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate))
//       : selectedDate;
//     const taskText = data.taskName;

//     if (!taskText) return;

//     const targetKey = formatDate(targetDate);

//     // 親から setTasks が渡されていれば呼ぶ（なければ変更しない）
//     if (typeof setTasks === 'function') {
//       setTasks((prevTasks) => {
//         const newTasks = { ...prevTasks };
//         if (!newTasks[targetKey]) {
//           newTasks[targetKey] = [];
//         }
//         newTasks[targetKey].push(taskText);

//         if (data.subTasks && data.subTasks.length > 0) {
//           data.subTasks.forEach((sub) => newTasks[targetKey].push(`- ${sub}`));
//         }
//         return newTasks;
//       });
//     }

//     if (data.dueDate) {
//       setSelectedDate(targetDate);
//     }
//   };

//   // --- カレンダー描画（週末と祝日で色付け） ---
//   const renderCalendar = () => {
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const firstDayOfMonth = new Date(year, month, 1);
//     const lastDayOfMonth = new Date(year, month + 1, 0);

//     const daysInMonth = [];

//     // 月の初日まで空白を埋める
//     for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
//       // 空セルは見た目を合わせて表示（枠線／丸みを保持）
//       daysInMonth.push(
//         <div key={`empty-${i}`} style={{ ...styles.day, ...styles.emptyDay }} />
//       );
//     }

//     // 日付を生成
//     for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
//       const date = new Date(year, month, day);
//       const dateString = formatDate(date);
//       // selectedDate は Date 型に統一 -> 比較はフォーマットした文字列同士で行う
//       const isSelected = dateString === formatDate(selectedDate);
//       // カレンダー表示用は文字列／オブジェクト両方を許容する（表示時に正規化しない）
//       const dayTasks = tasks[dateString] || [];
//       const hasTask = dayTasks.length > 0;

//       const weekday = date.getDay(); // 0:Sun ... 6:Sat
//       const holidayName = isJapaneseHoliday(date);
//       const isHoliday = Boolean(holidayName);
//       // 日付色
//       let numberColor = '#0f172a';
//       if (isHoliday || weekday === 0) numberColor = '#dc2626'; // 赤
//       else if (weekday === 6) numberColor = '#2563eb'; // 青

//       daysInMonth.push(
//         <div
//           key={day}
//           style={{
//             ...styles.day,
//             ...(isSelected ? styles.selected : {}),
//             ...(hasTask ? styles.hasTaskAccent : {})
//           }}
//           // selectedDate を Date 型で保持するため、クリックでは Date を渡す
//           onClick={() => setSelectedDate(date)}
//           title={holidayName ? holidayName : undefined}
//         >
//           <div style={{ ...styles.dayNumber, color: numberColor }}>
//             <span>{day}</span>
//           </div>

//           {/* 祝日名を小ラベルで表示（ある場合） */}
//           {isHoliday && (
//             <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '6px' }}>
//               {holidayName}
//             </div>
//           )}

//           <div style={styles.dayTasks}>
//             {dayTasks.slice(0, 3).map((t, idx) => {
//               // 日セルのタスク表示でもオブジェクトを直接描画しないよう安全に文字列化
//               const raw = typeof t === 'string' ? t : t.task;
//               const text =
//                 typeof raw === 'string'
//                   ? raw
//                   : (raw && (raw.text || raw.title)) || JSON.stringify(raw || '');
//               return (
//                 <div key={idx} style={styles.taskBadge} title={text}>
//                   {text}
//                 </div>
//               );
//             })}

//             {dayTasks.length > 3 && (
//               <div style={styles.moreBadge}>＋{dayTasks.length - 3} 件</div>
//             )}
//           </div>
//         </div>
//       );
//     }

//     return daysInMonth;
//   };

//   // --- 既存: 月移動処理 ---
//   const goToPreviousMonth = () => {
//     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//   };

//   const goToNextMonth = () => {
//     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
//   };

//   const styles = {
//     calendarContainer: {
//       borderRadius: '12px',
//       overflow: 'hidden',
//       border: '1px solid #e5e7eb',
//       boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
//       marginTop: '1rem',
//     },
//     header: {
//       background: '#f9fafb',
//       padding: '12px 16px',
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       borderBottom: '1px solid #e5e7eb',
//     },
//     weekRow: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(7, 1fr)',
//       background: '#f3f4f6',
//       padding: '10px 0',
//       fontWeight: '500',
//       color: '#374151',
//     },
//     grid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(7, 1fr)',
//       gap: '10px',
//       padding: '12px',
//     },
//     // 日セル（共通の枠・丸み・影で区切りを明確化）
//     day: {
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'flex-start',
//       padding: '10px',
//       borderRadius: '12px',
//       cursor: 'pointer',
//       position: 'relative',
//       transition: 'background 0.15s, transform 0.08s',
//       minHeight: '96px',
//       boxSizing: 'border-box',
//       background: '#ffffff',
//       border: '1px solid #e6edf3',
//       boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
//     },
//     // 空セルを日セルと同等の寸法で表示（境界は薄く保つ）
//     emptyDay: {
//       background: 'transparent',
//       borderStyle: 'dashed',
//       borderColor: 'transparent',
//       boxShadow: 'none',
//     },
//     dayNumber: {
//       fontSize: '16px',
//       fontWeight: '600',
//       lineHeight: '1.2',
//       width: '100%',
//       display: 'flex',
//       justifyContent: 'flex-start',
//       alignItems: 'center'
//     },
//     dayTasks: {
//       marginTop: '8px',
//       width: '100%',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '6px',
//     },
//     taskBadge: {
//       background: '#ecfdf5',
//       color: '#065f46',
//       padding: '6px 10px',
//       borderRadius: '999px',
//       fontSize: '12px',
//       whiteSpace: 'nowrap',
//       overflow: 'hidden',
//       textOverflow: 'ellipsis',
//       maxWidth: '100%'
//     },
//     moreBadge: {
//       fontSize: '12px',
//       color: '#6b7280',
//       textAlign: 'center',
//     },
//     selected: {
//       background: '#eef2ff',
//       border: '1px solid #c7d2fe',
//       boxShadow: '0 6px 12px rgba(37,99,235,0.06)',
//     },
//     hasTaskAccent: {
//       boxShadow: 'inset 0 0 0 2px rgba(16,185,129,0.06)',
//     },
//     // 追加: カレンダー全体のスタイル
//     calendarWrapper: {
//       maxWidth: '900px',
//       margin: '0 auto',
//       padding: '0 16px',
//     },
//     // 追加: タスク入力部分のスタイル
//     taskContainer: {
//       marginTop: '1rem',
//       padding: '16px',
//       borderRadius: '8px',
//       background: '#fff',
//       border: '1px solid #e5e7eb',
//       boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//     },
//     taskList: {
//       listStyleType: 'none',
//       padding: 0,
//       margin: '0.5rem 0 0 0',
//     },
//     taskItem: {
//       padding: '8px 0',
//       borderBottom: '1px solid #e5e7eb',
//     },
//     taskInputWrapper: {
//       display: 'flex',
//       gap: '8px',
//       marginBottom: '12px',
//     },
//     taskInput: {
//       flex: 1,
//       padding: '10px',
//       borderRadius: '8px',
//       border: '1px solid #e5e7eb',
//       fontSize: '16px',
//       color: '#111827',
//     },
//     addButton: {
//       padding: '10px 16px',
//       background: '#2563eb',
//       color: 'white',
//       border: 'none',
//       borderRadius: '8px',
//       cursor: 'pointer',
//       fontSize: '16px',
//       fontWeight: '500',
//       transition: 'background 0.2s',
//     },
//     addButtonDisabled: {
//       background: '#e5e7eb',
//       color: '#9ca3af',
//       cursor: 'not-allowed',
//     },
//   };

//   return (
//     <div className="page-content">
//       <h1>シンプルタスクカレンダー</h1>

//         <div className="calendar-container" style={styles.calendarContainer}>
//           <div className="calendar-header" style={styles.header}>
//             <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
//             <h2>{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</h2>
//             <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
//           </div>

//           <div className="calendar-weekdays" style={styles.weekRow}>
//             <div style={{color:'#dc2626'}}>日</div>
//             <div>月</div>
//             <div>火</div>
//             <div>水</div>
//             <div>木</div>
//             <div>金</div>
//             <div style={{color:'#2563eb'}}>土</div>
//           </div>

//           <div className="calendar-grid" style={styles.grid}>{renderCalendar()}</div>
//         </div>

//         <div className="task-container" style={styles.taskContainer}>
//           <AITaskColl onTaskCreated={handleAddTaskFromAI} />

//           {/* タスク一覧（重要度順） */}
//           <div className="task-list-section">
//             <h3 style={{ marginTop: '2rem' }}> {formatDate(selectedDate)} のタスク</h3>
//             {selectedTasks.length === 0 ? (
//               <p>タスクはありません</p>
//             ) : (
//               <ul className="task-list">
//                 {selectedTasks.map((task, index) => (
//                   <li key={index} className="task-item">
//                     {/* ← 左端に色バー */}
//                     <div
//                       className="priority-bar"
//                       // priority は task.priority ではなく task.imp を参照する（正規化時に imp をセット）
//                       style={{ backgroundColor: getPriorityColor(task.imp) }}
//                     ></div>

//                     {/* タスク内容 */}
//                     <div className="task-content">
//                       {/* task.task は正規化済みで文字列保証 */}
//                       <strong>{String(task.task)}</strong>
//                       <div className="task-meta">
//                         {task.sta && task.end && (
//                           <span> {task.sta}〜{task.end}</span>
//                         )}
//                         <span>重要度: {task.imp || 0}</span>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>


//       <style jsx>{`
//         .task-list-section {
//           margin-top: 20px;
//         }

//         .task-list {
//           list-style: none;
//           padding: 0;
//           margin: 0;
//           display: flex;
//           flex-direction: column;
//           gap: 6px; /* 少し詰める */
//         }

//         .task-item {
//           position: relative;
//           display: flex;
//           align-items: stretch;
//           border: 1.5px solid #e5e7eb;
//           border-radius: 6px;
//           background: white;
//           transition: all 0.2s;
//           overflow: hidden;
//         }
        
//         .priority-bar {
//           position: absolute;
//           left: -1.5px; /* ← border分ずらす */
//           top: -1.5px;  /* 枠線に合わせる */
//           bottom: -1.5px;
//           width: 8px;   /* バー幅＋border分 */
//           border-radius: 6px 0 0 6px;
//         }

//         .task-item:hover {
//           border-color: #3b82f6;
//           background: #f9fafb;
//           transform: translateY(-1px);
//         }

//         .task-content {
//           display: flex;
//           flex-direction: column;
//           padding: 6px 10px; /* 枠線とバーに沿う */
//           color: #111;
//           font-size: 0.9rem;
//         }

//         .task-meta {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 8px;
//           font-size: 0.8rem;
//           color: #6b7280;
//         }

//         .selected-date-info {
//           color: #374151;
//           font-weight: 500;
//           margin-bottom: 10px;
//         }
//       `}</style>
//     </div>
//   )
// }

// export default CalendarPage
import { useState } from "react";
import '../../../src/App.css';
import AITaskColl from "../../AI/AITaskColl";
import { formatDate,formatDateDisplay } from '../../../src/App';

function CalendarPage({tasks, setTasks})
{
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskInput, setTaskInput] = useState('');

  const key = selectedDate ? formatDate(selectedDate) : null;

  const selectedTasksRaw = key && tasks[key] ? tasks[key] : [];
  let selectedTasks = selectedTasksRaw.map((t) => {
    if (typeof t === 'string') return { task: t, imp: 0 };

    const rawTask = t.task;
    const safeTask =
      typeof rawTask === 'string'
        ? rawTask
        : (rawTask && (rawTask.text || rawTask.title)) || JSON.stringify(rawTask || '');

    return {
      task: safeTask || '',
      imp: typeof t.imp === 'number' ? t.imp : 0,
      sta: t.sta,
      end: t.end,
      ...t,
    };
  });

  selectedTasks = [...selectedTasks].sort((a, b) => (b.imp || 0) - (a.imp || 0))

  const getPriorityColor = (level) => {
    switch (level) {
      case 1: return '#60a5fa'
      case 2: return '#34d399'
      case 3: return '#facc15'
      case 4: return '#fb923c'
      case 5: return '#ef4444'
      default: return '#d1d5db'
    }
  }

  const pad = (v) => String(v).padStart(2, '0');
  const toKey = (date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const getNthWeekdayOfMonth = (year, month, weekday, nth) => {
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

    const add = (m, dayOfMonth, name) => { map[toKey(new Date(year, m - 1, dayOfMonth))] = name; };
    add(1, getNthWeekdayOfMonth(year, 0, 1, 2), "成人の日");
    add(7, getNthWeekdayOfMonth(year, 6, 1, 3), "海の日");
    add(9, getNthWeekdayOfMonth(year, 8, 1, 3), "敬老の日");
    add(10, getNthWeekdayOfMonth(year, 9, 1, 2), "スポーツの日");

    map[toKey(new Date(year, 2, vernalEquinoxDay(year)))] = "春分の日";
    map[toKey(new Date(year, 8, autumnalEquinoxDay(year)))] = "秋分の日";

    map[toKey(new Date(year, 7, 11))] = "山の日";

    const keys = Object.keys(map).sort();
    keys.forEach((k) => {
      const parts = k.split('-').map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      if (dt.getDay() === 0) {
        let next = new Date(dt);
        next.setDate(next.getDate() + 1);
        while (map[toKey(next)]) {
          next.setDate(next.getDate() + 1);
        }
        map[toKey(next)] = "振替休日";
      }
    });

    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = toKey(d);
      if (map[key]) continue;
      const prev = new Date(d); prev.setDate(d.getDate() - 1);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      if (map[toKey(prev)] && map[toKey(next)]) {
        map[key] = "国民の休日";
      }
    }

    return map;
  };

  const isJapaneseHoliday = (date) => {
    const y = date.getFullYear();
    const holidays = getHolidaysForYear(y);
    return holidays[toKey(date)] || null;
  };

  const handleAddTaskFromAI = (data) => {
    const targetDate = data.dueDate
      ? (data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate))
      : selectedDate;

    const taskText = data.taskName;

    if (!taskText) return;

    const targetKey = formatDate(targetDate);

    if (typeof setTasks === 'function') {
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        if (!newTasks[targetKey]) {
          newTasks[targetKey] = [];
        }
        newTasks[targetKey].push(taskText);

        if (data.subTasks && data.subTasks.length > 0) {
          data.subTasks.forEach((sub) => newTasks[targetKey].push(`- ${sub}`));
        }
        return newTasks;
      });
    }

    if (data.dueDate) {
      setSelectedDate(targetDate);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = [];

    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      daysInMonth.push(
        <div key={`empty-${i}`} style={{ ...styles.day, ...styles.emptyDay }} />
      );
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const isSelected = dateString === formatDate(selectedDate);

      const dayTasks = tasks[dateString] || [];
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
          style={{
            ...styles.day,
            ...(isSelected ? styles.selected : {}),
            ...(hasTask ? styles.hasTaskAccent : {})
          }}
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
              const text =
                typeof raw === 'string'
                  ? raw
                  : (raw && (raw.text || raw.title)) || JSON.stringify(raw || '');
              return (
                <div key={idx} style={styles.taskBadge} title={text}>
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

  const styles = {
    calendarContainer: {
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
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
      gridAutoRows: '120px',      // ← 各セル高さ固定
      gap: '10px',
      padding: '12px',
    },

    day: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '10px',
      borderRadius: '12px',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.15s, transform 0.08s',
      width: '120px',        // ← 横幅固定
      height: '120px',       // ← 高さ固定
      minHeight: '120px',
      overflow: 'hidden',    // ← 内容で伸びない
      boxSizing: 'border-box',
      background: '#ffffff',
      border: '1px solid #e6edf3',
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    },

    emptyDay: {
      background: 'transparent',
      borderStyle: 'dashed',
      borderColor: 'transparent',
      boxShadow: 'none',
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
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },

    taskBadge: {
      background: '#ecfdf5',
      color: '#065f46',
      padding: '4px 8px',
      borderRadius: '999px',
      fontSize: '11px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%'
    },

    moreBadge: {
      fontSize: '12px',
      color: '#6b7280',
      textAlign: 'center',
    },

    selected: {
      background: '#eef2ff',
      border: '1px solid #c7d2fe',
      boxShadow: '0 6px 12px rgba(37,99,235,0.06)',
    },

    hasTaskAccent: {
      boxShadow: 'inset 0 0 0 2px rgba(16,185,129,0.06)',
    },
  };

  return (
    <div className="page-content">
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

        <div className="calendar-grid" style={styles.grid}>
          {renderCalendar()}
        </div>
      </div>

      <div className="task-container" style={styles.taskContainer}>
        <AITaskColl onTaskCreated={handleAddTaskFromAI} />

        <div className="task-list-section">
          <h3 style={{ marginTop: '2rem' }}> {formatDate(selectedDate)} のタスク</h3>

          {selectedTasks.length === 0 ? (
            <p>タスクはありません</p>
          ) : (
            <ul className="task-list">
              {selectedTasks.map((task, index) => (
                <li key={index} className="task-item">
                  <div
                    className="priority-bar"
                    style={{ backgroundColor: getPriorityColor(task.imp) }}
                  ></div>

                  <div className="task-content">
                    <strong>{String(task.task)}</strong>
                    <div className="task-meta">
                      {task.sta && task.end && (
                        <span> {task.sta}〜{task.end}</span>
                      )}
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
        .task-list-section {
          margin-top: 20px;
        }

        .task-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .task-item {
          position: relative;
          display: flex;
          align-items: stretch;
          border: 1.5px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          transition: all 0.2s;
          overflow: hidden;
        }
        
        .priority-bar {
          position: absolute;
          left: -1.5px;
          top: -1.5px;
          bottom: -1.5px;
          width: 8px;
          border-radius: 6px 0 0 6px;
        }

        .task-item:hover {
          border-color: #3b82f6;
          background: #f9fafb;
          transform: translateY(-1px);
        }

        .task-content {
          display: flex;
          flex-direction: column;
          padding: 6px 10px;
          color: #111;
          font-size: 0.9rem;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.8rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

export default CalendarPage;
