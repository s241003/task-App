import { useState } from 'react'
import { formatDate } from '../../../src/App'
import AITaskColl from '../../AI/AITaskColl'

function TaskPage({ tasks, onTaskClick }) {
  const [showModal, setShowModal] = useState(false)

  const today = formatDate(new Date())
  const todayTasks = (tasks[today] || []).sort((a, b) => b.priority - a.priority)

  const handleAddClick = () => setShowModal(true)

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

  return (
    <>
      <div className="page-content">
        <h1 className="text-red-500">タスク管理</h1>

        <button className="add-task-btn" onClick={handleAddClick}>
          ＋ タスクを追加
        </button>

        <div className="task-list-section">
          <h3>📅 今日のタスク</h3>
          {todayTasks.length === 0 ? (
            <p className="empty-message">今日のタスクはありません</p>
          ) : (
            <div className="task-buttons">
              {todayTasks.map((task, index) => (
                <button
                  key={index}
                  className="task-item-btn"
                  onClick={() => onTaskClick(task)}
                >
                  <div
                    className="priority-bar"
                    style={{ backgroundColor: getPriorityColor(task.imp) }}
                  ></div>
                  <div className="task-btn-content">
                    <strong>{task.task}</strong>
                    <div className="task-btn-meta">
                      <span>重要度: {task.imp}</span>
                      {task.sta && task.end && (
                        <div><br />📆 {task.sta}〜{task.end}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* モーダル */}
        {showModal && (
          <div className="modal-overlay">
            <AITaskColl />
          </div>
        )}
      </div>

      {/* CSS */}
      <style jsx>{`
        .add-task-btn {
          margin-bottom: 10px;
          padding: 8px 16px;
          border: none;
          background: var(--accent);
          color: white;
          border-radius: 8px;
          cursor: pointer;
        }

        .task-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .task-item-btn {
          background: var(--card-bg);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: stretch;
          transition: 0.2s;
          color: var(--text-color);
          text-align: left;
        }

        .task-item-btn:hover {
          border-color: var(--accent);
          background: rgba(59,130,246,0.1);
        }

        .priority-bar {
          width: 8px;
          flex-shrink: 0;
          border-radius: 4px 0 0 4px;
          margin-right: 12px;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--card-bg);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: 10px;
          width: 90%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .modal-content input,
        .modal-content textarea,
        .modal-content select {
          background: var(--bg-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          padding: 8px;
          border-radius: 6px;
        }

        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .modal-buttons button {
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
        }

        .modal-buttons button:first-child {
          background: #9ca3af;
        }
      `}</style>
    </>
  )
}

export default TaskPage