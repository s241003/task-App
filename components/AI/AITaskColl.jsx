import { createClient } from '@supabase/supabase-js';
export const supabase = createClient('https://zcbubwuhbkbjoxpneemg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjYnVid3VoYmtiam94cG5lZW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NTM5NzEsImV4cCI6MjA3NjQyOTk3MX0.1pRZrkCSqD97qRjZBYNM2sd4t1ZFkd-HQP2kUJQMA28');
import React, { useState } from 'react';

async function saveTaskToSupabase(taskData) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      task_name: taskData.data.taskName,
      sub_tasks: taskData.data.subTasks,
      end_date: taskData.data.endDate,
      importance: taskData.importance,
    }]);

  if (error) console.error('保存失敗:', error);
}

function AITaskColl({ onTaskCreated }) {
  const [text, setText] = useState('');
  const [importance, setImportance] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
      const dataSet =
        [
          data,
          importance,
        ];
      await saveTaskToSupabase(dataSet);

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
            color: "#0f0f0f",
            background: "#f0f0f0",
            margin: "10px",
            padding : "10px",
            borderRadius: '9px',
            caretColor: "#0f0f0f",
          }}
        /><br />
        <input
          type="number"
          value={importance}
          onChange={(e) => setImportance(e.target.value)}
          placeholder="重要度を1~5で設定"
          disabled={isLoading}
          max="5"
          min="1"
          style={{
            color: "#0f0f0f",
            background: "#f0f0f0",
            margin: "10px",
            padding : "10px",
            borderRadius: '9px',
            caretColor: "#0f0f0f",
          }}
        />
          <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="開始日"
          disabled={isLoading}
          style={{
            color:"#0f0f0f",
            background: "#f0f0f0",
            margin: "10px",
            padding : "10px",
            borderRadius: '9px',
            caretColor: "#0f0f0f",
          }}
            />
          <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="期日"
          disabled={isLoading}
          style={{
            color:"#0f0f0f",
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
          <p>json:{JSON.stringify(taskData)}</p>
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
