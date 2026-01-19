import React from 'react';
import './SettingsPage.css';

const SettingsPage = ({ isDark, setIsDark }) => {

  // 設定の選択肢をオブジェクトの配列で定義
  const themeOptions = [
    {
      id: 'light',
      label: 'ライトモード',
      value: false,
      className: 'lightModeButton'
    },
    {
      id: 'dark',
      label: 'ダークモード',
      value: true,
      className: 'darkModeButton'
    }
  ];

  return (
    <div className="settings-wrapper" style={{ padding: '20px' }}>
      <h1>設定</h1>
      
      <div className="settings-section">
        <p className="settings-label">テーマ設定 (Theme)</p>
        
        <div className="theme-buttons">
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

      <div className="settings-info" style={{ marginTop: '20px' }}>
        <p>現在のモード: <strong>{isDark ? "ダーク" : "ライト"}</strong></p>
      </div>
    </div>
  );
}

export default SettingsPage;
