import { useState, useRef, useEffect } from 'react'
import './SettingsPage.css';
import '../../../src/App.css';
import { formatDate, formatDateDisplay } from '../../../src/App';
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? "app dark" : "app light"}>
      <div className="buttons">
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

      <p>これはテキストです</p>
    </div>
  );
}

export default SettingsPage;

