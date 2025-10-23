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


function NavigationBar({ currentPage, onPageChange }) {
  const pages = [
    { id: 'tasks', label: 'タスク' },
    { id: 'chat', label: 'チャット' },
    { id: 'calendar', label: 'カレンダー' },
    { id: 'groupwork', label: 'グループワーク' },
    { id: 'settings', label: '設定' }
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
            src={`../../../public/icons/${page.id}_${currentPage === page.id ? 'blue' : 'black'}.png`}
            alt={page.label}
          />
        </button>
      ))}
    </nav>
  );
}

export default NavigationBar;
