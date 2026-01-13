function lightMode() {
  const lightClick = () => {
    alert("押されました！");
  };

  return (
    <button className="lightModeButton" onClick={lightClick}>
      ライトモード
    </button>
  );
}

function darkMode() {
  const darkClick = () => {
    alert("押されました！");
  };

  return (
    <button className="darkModeButton" onClick={darkClick}>
      ダークモード
    </button>
  );
}

