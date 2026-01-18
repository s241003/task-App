import { useState } from 'react'
import './SettingsPage.css';
import '../../../src/App.css';

// SettingsPage.js
// Propsとして渡された isDark と setIsDark を受け取る
const SettingsPage = ({ isDark, setIsDark }) => {
  return (
    <div className="settings-wrapper" style={{ padding: '20px' }}>
      <h1>設定</h1>
      <div className="theme-buttons">
        <button className="lightModeButton" onClick={() => setIsDark(false)}>ライトモード</button>
        <button className="darkModeButton" onClick={() => setIsDark(true)}>ダークモード</button>
      </div>
      <p>現在のモード: <strong>{isDark ? "ダーク" : "ライト"}</strong></p>
    </div>
  );
}

export default SettingsPage;