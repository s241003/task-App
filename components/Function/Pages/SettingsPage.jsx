import React from 'react';
import './SettingsPage.css';

const SettingsPage = ({ isDark, setIsDark }) => {
  // スイッチをクリックしたときに true/false を入れ替える
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="settings-wrapper">
      <h1 className="settings-title">設定</h1>
      
      <div className="setting-row">
        <span className="setting-label">theme</span>
        
        {/* トグルスイッチ全体 */}
        <div 
          className={`theme-switch-container ${isDark ? 'is-dark' : 'is-light'}`}
          onClick={toggleTheme}
        >
          {/* スイッチ内の動く丸（ノブ） */}
          <div className="theme-switch-nob">
            {/* アイコンなどを入れたい場合はここに配置できます */}
            {isDark ? '🌙' : '☀️'}
          </div>
        </div>
      </div>

      <p className="current-status">
        現在は <strong>{isDark ? "ダークモード" : "ライトモード"}</strong> です
      </p>
    </div>
  );
}

export default SettingsPage;
