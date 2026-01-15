import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
//import { IconContext } from 'react-icons'
//import { RiChatAiLine } from "react-icons/ri";
import AIChat from "../AI/AIChat";
import AITaskColl from "../AI/AITaskColl";
import { Box,BottomNavigation,BottomNavigationAction,Fab,Container } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import ListIcon from "@mui/icons-material/List";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";



function NavigationBar({ selectedDate, currentDate, isOpen, setIsOpen }) {
  const [value, setValue] = useState(0);

  const pages = [
    { id: 'tasks', label: 'タスク' },
    { id: 'aichat', label: 'チャット' },
    {id:"addtask", label:"タスク追加"},
    { id: `calendar/${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`, label: 'カレンダー' },
    { id: 'settings', label: '設定' },
    //{ id: 'settings', label: '設定' },
  ]
  const navigate = useNavigate();

  return (
    <div>
      <Box sx={{height:"auto", width: "100%", position: "fixed", bottom: 0, left: 0,whiteSpace:"nowrap", zIndex:800}}>
        <BottomNavigation
          sx={{ bgcolor: '#ececef', padding:"" }}
          value={value}
          onChange={(e, newValue) => {
            setValue(newValue);
            if (newValue === 0) {
              navigate("/tasks");
            } else if (newValue === 1) {
              navigate("/aichat");
            } else if (newValue === 2) {
              setIsOpen(true);
            } else if (newValue === 3) {
              navigate(`/calendar/${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`);
            } else if (newValue === 4) {
              navigate("/settings");
            }
          }}
        >
          <BottomNavigationAction label="タスク" icon={<ListIcon />}/>
          <BottomNavigationAction label="チャット" icon={<ChatIcon />}/>
          <BottomNavigationAction icon={<Fab color="primary"><AddIcon /></Fab>}/>
          <BottomNavigationAction label="カレンダー" icon={<CalendarMonthIcon />}/>
          <BottomNavigationAction label="設定" icon={<SettingsIcon />}/>
        </BottomNavigation>
      </Box>

        {/*<nav className="navigation-bar bg-gray-500">
            {pages.flatMap((page, index) => {
              const navLink = (

                <NavLink
                  key={page.id}
                  to={`/${page.id}`}
                  activeClassName="active"
                  className="nav-button"
                >
                  {page.label}
                </NavLink>
              );
              if (index === 1) {
                return [
                  navLink,
                  <button key="addtask" className="addtask-button " onClick={() => setIsOpen(true)}>＋</button>
                ];
              }
              return [navLink];
            })}
        </nav>*/}


        <style jsx>{`

          .navigation-container {
            display: flex;
            justify-content: space-around;
            width: 100%;
            position: fixed;
            left: 0;
            bottom: 0;
            background-color: transparent;
            z-index: 800;
          }

          .navigation-bar {
            display: flex;
            justify-content: space-around;
            align-items: center;
            width: 100%;
            max-width: 100%; /* ← ページ幅と揃える */
            height: 10vh;
            background-color: #ececef;
            border-top: 1.0px solid #d3d3d3;
            margin: 0 auto;
          }

          .nav-button {
            flex: 1;
            text-align: center;
            background: none;
            font-size: 2vh;
            white-space: nowrap;
            color: #59606f;
            font-weight: 600;
            height: 100%;
            cursor: pointer;
            transition: all 0.2s;
          }

          .nav-button:hover {
            background: #ececef;
            color: #111827;
          }

          .addtask-button {
            position: relative;
            bottom: 1vh;
            font-size: 4vh;
            margin: 0 1vw;
            width: 0.1vw;
            height: 0.1vw;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            border: none;
            font-weight: 900;
            color: #ffffff;
            border-radius: 100%;
            transition: all 0.3s;
          }
          .addtask-button:hover{
            background: #2563eb;
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
          }

          .active {
            color: #3b82f6;
            border-top:  solid #3b82f6;
            background: #f4f4f7;
          }

        `}</style>
      </div>
  )
}

export default NavigationBar