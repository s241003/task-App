function NavigationBar({ currentPage, onPageChange }) {
  const pages = [
    {
      id: "tasks",
      label: "タスク",
      icon: "/task_black.png",
      activeIcon: "/task_blue.png",
    },
    {
      id: "chat",
      label: "チャット",
      icon: "/chat_black.png",
      activeIcon: "/chat_blue.png",
    },
    {
      id: "calendar",
      label: "カレンダー",
      icon: "/calendar_black.png",
      activeIcon: "/calendar_blue.png",
    },
    {
      id: "groupwork",
      label: "グループワーク",
      icon: "/groupwork_black.png",
      activeIcon: "/groupwork_blue.png",
    },
    {
      id: "settings",
      label: "設定",
      icon: "/setting_black.png",
      activeIcon: "/setting_blue.png",
    },
  ];

  return (
    <nav className="navigation-bar">
      {pages.map((page) => (
        <button
          key={page.id}
          className={`nav-button ${currentPage === page.id ? "active" : ""}`}
          onClick={() => onPageChange(page.id)}
        >
          <img
            src={currentPage === page.id ? page.activeIcon : page.icon}
            alt={page.label}
          />
          <span>{page.label}</span>
        </button>
      ))}
    </nav>
  );
}
<img src="/vite.svg" alt="test" />
export default NavigationBar;
