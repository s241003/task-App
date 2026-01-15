import { useState } from 'react'
import './SettingsPage.css';
import '../../../src/App.css';

const SettingsPage = () => {
  // 1. 状態管理はここで行う
  const [isDark, setIsDark] = useState(false);

  // 2. SettingsPageとしてJSXを直接返す
  return (
    <div className={`settings-wrapper ${isDark ? "dark" : "light"}`} style={{ padding: '20px' }}>
      <h1>設定</h1>
      
      <div className="theme-buttons">
        <button
          className="darkModeButton"
          onClick={() => setIsDark(true)}
        >
          ダークモード
        </button>

        <button
          className="lightModeButton"
          onClick={() => setIsDark(false)}
        >
          ライトモード
        </button>
      </div>

      <p style={{ marginTop: '20px' }}>
        現在のモード: <strong>{isDark ? "ダーク" : "ライト"}</strong>
      </p>
      <p>これはテキストです</p>
    </div>
  );
}

export default SettingsPage;
