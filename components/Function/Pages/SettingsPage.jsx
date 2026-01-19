import React from 'react';
import './SettingsPage.css';

const SettingsPage = ({ isDark, setIsDark }) => {

  // 設定の選択肢
  const themeOptions = [
    {
      id: 'light',
      label: 'ライト',
      value: false,
      className: 'lightModeButton'
    },
    {
      id: 'dark',
      label: 'ダーク',
      value: true,
      className: 'darkModeButton'
    }
  ];

  return (
    <div className="settings-wrapper" style={{ padding: '20px' }}>
      <h1 className="settings-title">設定</h1>
      
      {/* ラベルとボタンを横並びにするコンテナ */}
      <div className="theme-setting-container">
        <span className="theme-label-large">theme</span>
        
        <div className="theme-buttons-row">
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

      <div className="settings-info">
        <p>現在のモード: <strong>{isDark ? "ダーク" : "ライト"}</strong></p>
      </div>
    </div>
  );
}

export default SettingsPage;
