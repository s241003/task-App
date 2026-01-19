import React from 'react';
import './SettingsPage.css';

const SettingsPage = ({ isDark, setIsDark }) => {
  // クリックでモードを反転させる関数
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="settings-wrapper">
      <h1 className="settings-title">設定</h1>
      
      <div className="setting-row">
        <span className="setting-label">theme</span>
        
        {/* スイッチ本体 */}
        <div 
          className={`theme-switch-container ${isDark ? 'state-dark' : 'state-light'}`}
          onClick={toggleTheme}
        >
          {/* 背後で動く白い丸（ノブ） */}
          <div className="theme-switch-nob"></div>

          {/* 前面に固定されたアイコン */}
          <div className="switch-icons">
            <span className="icon">☀️</span>
            <span className="icon">🌙</span>
          </div>
        </div>
      </div>

      <div className="current-status-info">
        <p>現在は <strong>{isDark ? "ダークモード" : "ライトモード"}</strong> です</p>
      </div>
    </div>
  );
}

export default SettingsPage;
