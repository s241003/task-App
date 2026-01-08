import { DBname } from "../../src/App";
import Modal from "react-modal";
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_API_KEY
);

  // import.meta.env.SUPABASE_URL
  // import.meta.env.SUPABASE_API_KEY

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import '../../src/dateInput.css';

{/* supabase保存 */}
async function saveTaskToSupabase(taskData) {
  const { data, error } = await supabase.from(DBname).insert([
    {
      task_name: taskData.tas,
      sub_tasks: taskData.sub,
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
  const [isOpen ,setIsOpen ] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      const { data, error } = await supabase
        .from(DBname)
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

  const pressEsc = useCallback((event) => {
    if (event.keyCode === 27) {
      navigate(-1);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", pressEsc, false);
  }, [pressEsc]);

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
          'もう少しタスクを具体的にしてください。\n例: 「勉強する」→「英検2級に合格する」'
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

    // バリデーション
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('開始日は期日より前に設定してください');
      return false;
    }

    setIsLoading(true);

    try {
      // データベースに保存
      const dataSet = {
        tas: text||null,
        sub: subTasks.split(' ')||null,
        imp: importance || null,
        sta: startDate || null,
        end: endDate || null,
      };

      await saveTaskToSupabase(dataSet);

      // 親コンポーネントに結果を渡す
      if (onTaskCreated) {
        onTaskCreated(dataSet);
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

      // モーダルを閉じる
      navigate(-1);
    } catch (error) {
      console.error('タスク保存中にエラーが発生しました:', error);
      setError('タスクの保存に失敗。もう一度試してください。');
      setIsLoading(false);
    }
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
  const AMBER = {
    light: '#ffedd5', // 背景や薄い強調
    base: '#f59e0b',  // メインアンバー
    deep: '#92400e',  // 見出しや強調文字
    dark: '#7c2d12'   // ボタンの影など
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    },
    modal: {
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px 20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      position: 'relative'
    },
    container: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    },
    // 追加: フォーム全体をグリッド化して整列
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '12px',
      alignItems: 'start',
    },
    // 追加: 各入力グループのスタイル
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    labelStyle: {
      fontSize: '14px',
      color: '#374151',
      fontWeight: '600',
    },
    row: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    input: {
      width: '100%', // タスク入力を幅いっぱいにして、AIボタンは右に寄せるので内部調整
      color: '#0f0f0f',
      background: '#f8fafc',
      padding: '12px',
      borderRadius: '9px',
      border: '1px solid #e6edf3',
      caretColor: '#0f0f0f',
      fontSize: '16px',
    },
    fullInput: {
      width: '100%',
      color: '#0f0f0f',
      background: '#f8fafc',
      padding: '12px',
      borderRadius: '9px',
      border: '1px solid #e6edf3',
      caretColor: '#0f0f0f',
      fontSize: '16px',
    },
    // AIボタンは右寄せの小さめボタンに調整（琥珀色）
    aiButton: (disabled) => ({
      marginLeft: '10px',
      padding: '10px 16px',
      background: disabled ? '#fde9d0' : AMBER.base,
      color: 'white',
      border: 'none',
      borderRadius: '9px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '700',
      alignSelf: 'center'
    }),
    actionRow: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    select: {
      flex: '1',
      minWidth: '120px',
      color: '#0f0f0f',
      background: '#f8fafc',
      padding: '10px',
      borderRadius: '9px',
      border: '1px solid #e6edf3',
      caretColor: '#0f0f0f',
    },
    dateInput: {
      flex: '1',
      minWidth: '140px',
      color: '#0f0f0f',
      background: '#f8fafc',
      padding: '10px',
      borderRadius: '9px',
      border: '1px solid #e6edf3',
      caretColor: '#0f0f0f',
    },
    resetButton: {
      padding: '12px 20px',
      background: AMBER.deep,
      color: 'white',
      border: 'none',
      borderRadius: '9px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    closeButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      border: 'none',
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: '700',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none' // NavLink 用に追加
    },
    submitButton: (disabled) => ({
      padding: '12px 20px',
      background: disabled ? '#fde9d0' : AMBER.base,
      color: 'white',
      border: 'none',
      borderRadius: '9px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '16px',
    }),
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
      background: AMBER.light,
      border: `2px solid ${AMBER.base}`,
      color: AMBER.deep,
    },
    successBox: {
      marginTop: '20px',
      background: '#fff7ed',
      border: `2px solid ${AMBER.base}`,
      padding: '15px',
      borderRadius: '8px',
    },
    debugPre: {
      background: '#fff7ed',
      padding: '10px',
      borderRadius: '6px',
      fontSize: '12px',
      overflow: 'auto',
      marginTop: '10px'
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      onAfterOpen={() => { document.getElementsByClassName("modalClose")[0].focus(); }}
      style={{
        overlay:{...styles.overlay},content:{...styles.modal}
      }}>
      <div onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} style={{ display: 'block' }}>
          <div style={styles.formGrid}>

            {/* キャンセルボタン */}
            <button
              onClick={() => {navigate(-1)}}
              className="modalClose text-lg font-bold absolute top-1 py-3 right-4 bg-white text-gray-700"
            >x</button>

          {/* タスク入力グループ（ラベル上） */}
          <div style={styles.formGroup}>
            <label style={styles.labelStyle} htmlFor="task">タスク</label>
            <div style={styles.actionRow}>

              {/* タスク入力 */}
              <input
                isLoading="task"
                type="text"
                id="task"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError(null); // 入力時にエラーをクリア
                }}
                placeholder="具体的に：例「英検2級に合格する」"
                disabled={isLoadAI || isLoading}
                style={
                  error && needsMoreDetail
                    ? { ...styles.input, border: '2px solid #f59e0b', flex: 1 }
                    : { ...styles.input, flex: 1 }
                }
              />

              {/* Aiボタン */}
              <button
                onClick={AIColl}
                type="button"
                disabled={isLoadAI || isLoading || !text.trim()}
                style={styles.aiButton(isLoadAI || isLoading || !text.trim())}
              >
                {isLoadAI || isLoading ? '解析中…' : 'AIに送る'}
              </button>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.labelStyle} htmlFor="subTask">サブタスク</label>

            {/* サブタスク */}
            <input
              id="subTask"
              type="text"
              value={subTasks}
              onChange={(e) => {
                setSubTasks(e.target.value);
                if (error) setError(null);
              }}
              placeholder="スペースで区切って入力（例: リスニング リーディング ライティング）"
              disabled={isLoadAI || isLoading}
              style={ error && needsMoreDetail ? { ...styles.fullInput, border: '2px solid #f59e0b' } : styles.fullInput }
            />
          </div>


          <div style={{ display: 'flex', gap: '12px 12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ ...styles.formGroup, flex: '0 0 100px' }}>
              <label style={styles.labelStyle} htmlFor="importance">重要度</label>

              {/* 重要度 */}
              <select
                id="importance"
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                disabled={isLoading}
                style={styles.select}
              >
                <option value="">未選択</option>
                <option value="1">🟦 低</option>
                <option value="2">🟩 やや低</option>
                <option value="3">🟨 中</option>
                <option value="4">🟧 やや高</option>
                <option value="5">🟥 高</option>
              </select>
            </div>

            <div style={{ ...styles.formGroup, flex: 1 ,margin: "0 0 0 4rem" }}>
              <label style={styles.labelStyle} htmlFor="turm">期間</label>
              {/* 期間 */}
              <div style={{ display: 'flex', gap: '1rem'}}>
                <input
                  id="turm"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="開始日"
                  disabled={isLoading}
                  style={styles.dateInput}
                  className="date-input"
                />
                <span style={{ alignSelf: 'center', color: '#495060' }}>から</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="期日"
                  disabled={isLoading}
                  style={styles.dateInput}
                  className="date-input"
                />
                <span style={{ alignSelf: 'center', color: '#495060' }}>まで</span>
              </div>
            </div>
          </div><br />
           {/* タスク送信ボタン */}
           <button
              type="submit"
              disabled={isLoadAI || isLoading || !text.trim() || !importance.trim() || !startDate.trim() || !endDate.trim()}
              style={styles.submitButton(isLoadAI || isLoading || !text.trim() || !importance.trim() || !startDate.trim() || !endDate.trim())}
            >
              タスクを作成
            </button>
        </div>
      </form>
        {/* 以上 タスク生成ウィンドウ */}


        {/* 以下 AI結果ウィンドウ */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>

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
          <h4 style={{ margin: '0 0 15px 0', color: AMBER.deep, fontSize: '18px' }}>
          　AIによる解析結果
          </h4>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: AMBER.deep }}>タスク:</strong>
            <p style={{ 
              margin: '5px 0', 
              fontSize: '16px', 
              color: AMBER.base,
              fontWeight: 'bold'
            }}>
              {taskData.taskName}
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: AMBER.deep }}>サブタスク一覧:</strong>
            <ul style={{ 
              margin: '5px 0', 
              paddingLeft: '20px',
              color: AMBER.base
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
              color: AMBER.deep,
              fontStyle: 'italic'
            }}>
              <strong>分析理由:</strong> {taskData.reason}
            </div>
          )}

          <div style={{
            marginTop: '10px',
            fontSize: '14px',
            color: AMBER.deep
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
              color: AMBER.deep,
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
      </div>
    </Modal>
  );
}

export default AITaskColl;
