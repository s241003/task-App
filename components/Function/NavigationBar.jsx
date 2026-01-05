import { useState } from "react";
import { NavLink,useNavigate } from "react-router-dom";
//import { IconContext } from 'react-icons'
//import { RiChatAiLine } from "react-icons/ri";
import AIChat from "../AI/AIChat";

function NavigationBar({ currentPage, onPageChange }) {
  const [showAI, setShowAI] = useState(false);
  const pages = [
    { id: 'aichat', label: 'チャット' },
    { id: 'tasks', label: 'タスク' },
    { id: 'calendar', label: 'カレンダー' },
    { id: 'groupwork', label: 'グループワーク' },
    { id: 'settings', label: '設定' }
  ]
  const navigate = useNavigate();

  return (
    <div className="navigation-container z-50 no-underline">
      <nav className="navigation-bar bg-gray-500">
        {pages.map(page => (
          <NavLink
            key={page.id}
            to={`/${page.id}`}
            activeClassName="active"
            className="nav-button"
            onClick={() => onPageChange?.(page.id)}
            >
              {page.label}
          </NavLink>
        ))}
        <button className="addtask-button bg-gray-500" onClick={()=>{navigate("/addTask")}}>＋</button>
      </nav>


      <style jsx>{`

        .navigation-container {
          display: flex;
          justify-content: space-around;
          width: 100%;
          position: fixed;
          left: 0;
          bottom: 0;
          background-color: transparent;
        }

        .navigation-bar {
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 100%;
          max-width: 100%; /* ← ページ幅と揃える */
          height: 56px;
          background-color: #ececef;
          border-top: 1.0px solid #d3d3d3;
          margin: 0 auto;
        }

        .nav-button {
          flex: 1;
          text-align: center;
          background: none;
          font-size: 14px;
          color: #59606f;
          font-weight: 500;
          height: 100%;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-button:hover {
          background: #ececef;
          color: #111827;
        }

        .addtask-button {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          padding: 0.5rem 0.75rem 0.5rem 0.75rem;
          margin-right: 0.75rem;
          border-radius: 0.75rem;
        }

        .active {
          color: #3b82f6;
          border-top: 3px solid #3b82f6;
          background: #f4f4f7;
        }

      `}</style>
    </div>
  )
}

export default NavigationBar