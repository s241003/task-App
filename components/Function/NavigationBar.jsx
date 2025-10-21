/*function NavigationBar({ currentPage, onPageChange }) {
  const pages = [
    { id: 'tasks', label: 'タスク' },
    { id: 'chat', label: 'チャット' },
    { id: 'calendar', label: 'カレンダー' },
    { id: 'groupwork', label: 'グループワーク' },
    { id: 'settings', label: '設定' }
  ]

  return (
    <nav className="navigation-bar">
      {pages.map(page => (
        <button
          key={page.id}
          className={`nav-button ${currentPage === page.id ? 'active' : ''}`}
          onClick={() => onPageChange(page.id)}
        >
          {page.label}
        </button>
      ))}
    </nav>
  )
}

export default NavigationBar*/


<img src={task_black} alt="task" />
// NavigationBar.jsx の先頭で画像を import
import tasks_black from './icons/task_black.png';
import tasks_blue from './icons/task_blue.png';
import chat_black from './icons/chat_black.png';
import chat_blue from './icons/chat_blue.png';
import calendar_black from './icons/calendar_black.png';
import calendar_blue from './icons/calendar_blue.png';
import groupwork_black from './icons/groupwork_black.png';
import groupwork_blue from './icons/groupwork_blue.png';
import settings_black from './icons/setting_black.png';
import settings_blue from './icons/setting_blue.png';

function NavigationBar({ currentPage, onPageChange }) {
  const pages = [
    { id: 'tasks', label: 'タスク', black: tasks_black, blue: tasks_blue },
    { id: 'chat', label: 'チャット', black: chat_black, blue: chat_blue },
    { id: 'calendar', label: 'カレンダー', black: calendar_black, blue: calendar_blue },
    { id: 'groupwork', label: 'グループワーク', black: groupwork_black, blue: groupwork_blue },
    { id: 'settings', label: '設定', black: settings_black, blue: settings_blue }
  ];

  return (
    <nav className="navigation-bar">
      {pages.map(page => (
        <button
          key={page.id}
          className={`nav-button ${page.id} ${currentPage === page.id ? 'active' : ''}`}
          onClick={() => onPageChange(page.id)}
        >
          <img
            src={currentPage === page.id ? page.blue : page.black}
            alt={page.label}
          />
        </button>
      ))}
    </nav>
  )
}

export default NavigationBar;
