import React, { useState } from 'react';

function AITaskColl({ onTaskCreated }) {
  const [text, setText] = useState('');
  const [taskData, setTaskData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTaskData(null);

    try {
      const response = await fetch('/api/generateTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setTaskData(data);
      console.log('AI Response:', data);

      // 親コンポーネントに結果を渡す
      onTaskCreated(data);

      // 入力欄をクリア
      setText('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="タスクを入力"
          disabled={isLoading}
          style={{
            background: "#f0f0f0",
            margin: "10px",
            padding : "10px",
            borderRadius: '9px',
            caretColor: "#0f0f0f",
          }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '解析中...' : 'AIカモン'}
        </button>
      </form>

      {taskData && (
        <div
          style={{
            marginTop: '20px',
            background: '#f0f0f0',
            padding: '10px',
            borderRadius: '8px',
          }}
        >
          <h4>AIによる解析結果</h4>
          <p>json:{taskData}</p>
          <p><strong>タスク:</strong> {taskData.taskName}</p>
          <p><strong>サブタスク一覧:</strong> {taskData.subTasks}</p>
          <p>
            <strong>期限日:</strong> {taskData.endDate || '未設定'}
          </p>
        </div>
      )}
    </div>
  );
}

export default AITaskColl;
