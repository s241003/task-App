import React from 'react';
import './SettingsPage.css';

const SettingsPage = ({ isDark, setIsDark }) => {

  // 設定項目をオブジェクトの配列で管理
  const themeOptions = [
    { id: 'light', label: 'ライトモード', value: false, className: 'lightModeButton' },
    { id: 'dark', label: 'ダークモード', value: true, className: 'darkModeButton' }
  ];

  return (
    <div className="settings-wrapper">
      <h1 className="settings-title">設定</h1>
      
      {/* この div が「theme」と「ボタン群」を横並びにします */}
      <div className="setting-row">
        <span className="setting-label">theme</span>
        
        <div className="theme-button-group">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              className={`${option.className} ${isDark === option.value ? 'active' : ''}`}
              onClick={() => setIsDark(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="current-status">
        現在のモード: <strong>{isDark ? "ダーク" : "ライト"}</strong>
      </p>
    </div>
  );
}

export default SettingsPage;
