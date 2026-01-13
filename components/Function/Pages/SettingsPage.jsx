import { useState } from "react";

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

export default ThemeToggle;

