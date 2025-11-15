import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  'https://zcbubwuhbkbjoxpneemg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjYnVid3VoYmtiam94cG5lZW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NTM5NzEsImV4cCI6MjA3NjQyOTk3MX0.1pRZrkCSqD97qRjZBYNM2sd4t1ZFkd-HQP2kUJQMA28'
);

import React, { useState, useEffect } from 'react';

async function saveTaskToSupabase(taskData) {
  const { data, error } = await supabase.from('tasks').insert([
    {
      input_text: taskData.tex,
      task_name: taskData.data.taskName,
      sub_tasks: taskData.data.subTasks,
      importance: taskData.imp,
      start_date: taskData.sta,
      end_date: taskData.end,
    },
  ]);

  if (error) {
    console.error('保存失敗:', error);
    throw error;
  }
  return data;
}

function AITaskColl({ onTaskCreated }) {

  //配列
  const [schedules, setSchedules] = useState([]);

  //文字型
  const [text, setText] = useState('');
  const [subTasks,setSubTasks] = useState('')
  const [importance, setImportance] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  //bool
  const [taskData, setTaskData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadAI, setIsLoadAI] = useState(false);
  const [error, setError] = useState(null);
  const [needsMoreDetail, setNeedsMoreDetail] = useState(false);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setSchedules(data);
    } catch (error) {
      console.error('fetchでエラーが発生しました', error);
    } finally {
      setIsLoading(false);
    }
  };


  {/* AI呼び出し */}

  const AIColl = async (e) => {
    e.preventDefault();

    // 初期化
    setError(null);
    setNeedsMoreDetail(false);
    setTaskData(null);

    // バリデーション
    if (!text.trim()) {
      setError('タスク名を入力してください');
      return false;
    }

    if (text.trim().length < 2) {
      setError('タスク名が短すぎます。もう少し具体的に入力してください');
      return false;
    }

    setIsLoadAI(true);

    try {
      // API呼び出し
      const response = await fetch('/api/generateTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      // エラーレスポンスの処理
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      // Concrete判定の処理
      if (data.needsMoreDetail || data.Concrete === false) {
        setNeedsMoreDetail(true);
        setError(
          data.suggestion ||
          data.reason ||
          'もう少し具体的なタスク名を入力してください。\n例: 「勉強する」→「英検2級に合格する」'
        );
        setTaskData(null);
        return; // ここで処理を終了
      }

      // 成功時の処理
      setTaskData(data);
      setSubTasks(data.subTasks.join(' '));
      console.log('AI Response:', data);

      // 成功時ログ
      console.log('AIタスクが正常に生成されました');

    } catch (error) {
      console.error('Error:', error);
      // エラーメッセージの設定
      if (error.message.includes('503')) {
        setError('AIサービスが混雑しています。しばらく待ってから再試行してください。');
      } else if (error.message.includes('429')) {
        setError('リクエスト制限に達しました。しばらく待ってから再試行してください。');
      } else {
        setError(error.message || 'エラーが発生しました。もう一度お試しください。');
      }
      setTaskData(null);
    } finally {
      setIsLoadAI(false);
    }
  };


  {/* タスク送信処理 */}
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 初期化
    setError(null);
    setNeedsMoreDetail(false);
    setTaskData(null);

    // バリデーション
    if (importance && (importance < 1 || importance > 5)) {
      setError('重要度は1〜5の範囲で設定してください');
      return false;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('開始日は期日より前に設定してください');
      return false;
    }

    setIsLoading(true);

      // 成功時の処理
      setTaskData(data);
      console.log('AI Response:', data);

      // データベースに保存
      const dataSet = {
        data: data,
        imp: importance || null,
        sta: startDate || null,
        end: endDate || null,
        tex: text,
      };

      await saveTaskToSupabase(dataSet);

      // 親コンポーネントに結果を渡す
      if (onTaskCreated) {
        onTaskCreated(data);
      }

      // スケジュールリストを更新
      await fetchScheduleData();

      // 入力欄をクリア
      setText('');
      setSubTasks('');
      setImportance('');
      setStartDate('');
      setEndDate('');

      // 成功メッセージ（オプション）
      console.log('タスクが正常に保存されました');

      // 終了処理
      setTaskData(null);
      setIsLoading(false);
  };

  const handleReset = () => {
    setText('');
    setSubTasks('');
    setImportance('');
    setStartDate('');
    setEndDate('');
    setTaskData(null);
    setError(null);
    setNeedsMoreDetail(false);
  };

  // 追加: 共通スタイルをまとめる（UI整理のみ、機能変更なし）
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      marginBottom: '15px',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    },
    row: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
    input: {
      width: '40%',
      color: '#0f0f0f',
      background: '#f0f0f0',
      padding: '12px',
      borderRadius: '9px',
      border: '1px solid #ddd',
      caretColor: '#0f0f0f',
      fontSize: '16px',
    },
    fullInput: {
      width: '100%',
      color: '#0f0f0f',
      background: '#f0f0f0',
      padding: '12px',
      borderRadius: '9px',
      border: '1px solid #ddd',
      caretColor: '#0f0f0f',
      fontSize: '16px',
    },
    aiButton: (disabled) => ({
      marginLeft: '10px',
      flex: '1',
      padding: '12px 20px',
      background: disabled ? '#ccc' : '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '9px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
    }),
    select: {
      flex: '1',
      minWidth: '120px',
      color: '#0f0f0f',
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '9px',
      border: '1px solid #ddd',
      caretColor: '#0f0f0f',
    },
    dateInput: {
      flex: '1',
      minWidth: '140px',
      color: '#0f0f0f',
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '9px',
      border: '1px solid #ddd',
      caretColor: '#0f0f0f',
    },
    resetButton: {
      padding: '12px 20px',
      background: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '9px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    alertBase: {
      marginTop: '20px',
      padding: '15px',
      borderRadius: '8px',
    },
    alertError: {
      background: '#fee2e2',
      border: '2px solid #ef4444',
      color: '#7f1d1d',
    },
    alertWarn: {
      background: '#fef3c7',
      border: '2px solid #f59e0b',
      color: '#78350f',
    },
    successBox: {
      marginTop: '20px',
      background: '#f0fdf4',
      border: '2px solid #10b981',
      padding: '15px',
      borderRadius: '8px',
    },
    debugPre: {
      background: '#ecfdf5',
      padding: '10px',
      borderRadius: '6px',
      fontSize: '12px',
      overflow: 'auto',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit}>
        {/* タスク入力 */}
        <label htmlFor="task">タスク
          <input
            isLoading="task"
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null); // 入力時にエラーをクリア
            }}
            placeholder="タスクを入力（具体的に: 例「英検2級に合格する」）"
            disabled={isLoadAI || isLoading}
            style={
              error && needsMoreDetail
                ? { ...styles.input, border: '2px solid #f59e0b' }
                : styles.input
            }
          />
        </label>

        {/* AIに送るボタン */}
        <button
          onClick={AIColl}
          type="button"
          disabled={isLoadAI || isLoading || !text.trim()}
          style={styles.aiButton(isLoadAI || isLoading || !text.trim())}
        >
          {isLoadAI || isLoading ? '解析中...' : 'AIに送る'}
        </button>

        {/* サブタスク入力 */}
        <div>
          <label htmlFor="subTask">サブタスク
            <input
              id="subTask"
              type="text"
              value={subTasks}
              onChange={(e) => {
                setSubTasks(e.target.value);
                if (error) setError(null);
              }}
              placeholder="タスクを細分化する（スペースで区切ってください）"
              disabled={isLoadAI || isLoading}
              style={ error && needsMoreDetail ? { ...styles.fullInput, border: '2px solid #f59e0b' } : styles.fullInput }
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <label htmlFor="importance">重要度&nbsp;
            <div>
                <select
                  id="importance"
                  value={importance}
                  onChange={(e) =>
                    setImportance(e.target.value)
                  }
                  disabled={isLoading}
                  style={styles.select}
                >
                  <option value="1">🟦 　低　 </option>
                  <option value="2">🟩 やや低 </option>
                  <option value="3">🟨 　中　 </option>
                  <option value="4">🟧 やや高 </option>
                  <option value="5">🟥 　高 </option>
                </select>
              </div>
          </label>


            {/* 期間 */}
          <div>
            <label htmlFor="turm">期間
              <input
                id="turm"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="開始日"
                disabled={isLoading}
                style={styles.dateInput}
              />

              &emsp;～&emsp;

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="期日"
                disabled={isLoading}
                style={styles.dateInput}
              />
            </label>
          </div>
        </div>
      </form>
        {/* 以上 タスク生成ウィンドウ */}


        {/* 以下 AI結果ウィンドウ */}
        <div style={{ display: 'flex', gap: '10px' }}>

          {(taskData || error) && (
            <button
              type="button"
              onClick={handleReset}
              style={styles.resetButton}
            >
              リセット
            </button>
          )}
        </div>

      {/* エラーメッセージ表示 */}
      {error && (
        <div
          style={
            needsMoreDetail
              ? { ...styles.alertBase, ...styles.alertWarn }
              : { ...styles.alertBase, ...styles.alertError }
          }
        >
          <h4 style={{ 
            margin: '0 0 10px 0', 
            color: needsMoreDetail ? '#92400e' : '#991b1b',
            fontSize: '16px'
          }}>
            {needsMoreDetail ? 'より具体的な情報が必要です' : 'エラー'}
          </h4>
          <p style={{ 
            margin: '0', 
            color: needsMoreDetail ? '#78350f' : '#7f1d1d',
            whiteSpace: 'pre-line',
            lineHeight: '1.6'
          }}>
            {error}
          </p>
          {needsMoreDetail && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              background: '#fff',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#78350f'
            }}>
              <strong>ヒント:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>「何を」達成したいのか明確にする</li>
                <li>「いつまでに」という期限を含める</li>
                <li>具体的な数値や名称を含める</li>
              </ul>
              <div style={{ marginTop: '8px' }}>
                <strong>例:</strong>
                <br />
                「勉強する」
                <br />
                「英検2級に合格する」
              </div>
            </div>
          )}
        </div>
      )}

      {/* 成功時の結果表示 */}
      {taskData && !error && (
        <div style={styles.successBox}>
          <h4 style={{ margin: '0 0 15px 0', color: '#065f46', fontSize: '18px' }}>
          　AIによる解析結果
          </h4>
          
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#065f46' }}>タスク:</strong>
            <p style={{ 
              margin: '5px 0', 
              fontSize: '16px', 
              color: '#047857',
              fontWeight: 'bold'
            }}>
              {taskData.taskName}
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#065f46' }}>サブタスク一覧:</strong>
            <ul style={{ 
              margin: '5px 0', 
              paddingLeft: '20px',
              color: '#047857'
            }}>
              {taskData.subTasks && taskData.subTasks.map((subTask, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>
                  {subTask}
                </li>
              ))}
            </ul>
          </div>

          {taskData.reason && (
            <div style={{ 
              marginTop: '10px',
              padding: '10px',
              background: '#fff',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#065f46',
              fontStyle: 'italic'
            }}>
              <strong>分析理由:</strong> {taskData.reason}
            </div>
          )}

          <div style={{
            marginTop: '10px',
            fontSize: '14px',
            color: '#047857'
          }}>
            <p style={{ margin: '5px 0' }}>
              <strong>重要度:</strong> {importance || '未設定'}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>期間:</strong> {startDate || '未設定'} 〜 {endDate || '未設定'}
            </p>
          </div>

          {/* デバッグ用（本番環境では削除推奨） */}
          <details style={{ marginTop: '15px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              color: '#059669',
              fontSize: '12px'
            }}>
              詳細データを表示
            </summary>
            <pre style={styles.debugPre}>
              {JSON.stringify(taskData, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* 入力例の表示 */}
      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6b7280',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>
          入力例
        </h4>
        <div style={{ lineHeight: '1.8' }}>
          <p style={{ margin: '5px 0' }}>
            <strong>良い例:</strong> 「英検2級に合格する」「ReactでTodoアプリを作る」「毎日30分ランニングする」
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>悪い例:</strong> 「勉強する」「頑張る」「運動する」
          </p>
        </div>
      </div>
    </div>
  );
}

export default AITaskColl;
