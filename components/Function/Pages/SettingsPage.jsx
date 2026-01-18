import React,{ useState,useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import {  Button,  TextField,  Container,  Paper,  Box,  Typography,  Stack,  Alert,Switch,FormControlLabel } from "@mui/material";
import { signOut } from './LoginPage';

function Settings({ theme,setTheme }) {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [allowSub, setAllowSub] = useState(false);
    const [daysPerWork, setDaysPerWork] = useState("");


  return (
    <Container maxWidth="sm" sx={{ my: 4, bgcolor: '#f5f5f5', padding: 3, borderRadius: 4 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center">アカウント設定</Typography>
      <Button variant="outlined" color="error" onClick={() => {signOut()}}>
        ログアウト
      </Button>

      <div>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mt={3}>ユーザー情報</Typography>
           <Typography variant="h6" textAlign="center" m={1}>{user ? `ログイン中: ${user?.email}`:"ログインしていません。" }</Typography>

        <Typography variant="h5" fontWeight="bold" textAlign="center" my={3}>カスタマイズ</Typography>

        <TextField
          label="あなたの名前"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
         <FormControlLabel
         control={<Switch value={allowSub} onChange={(e) => setAllowSub(!allowSub)} defaultChecked />}
          label={`サブタスクを${allowSub ?'有':'無'}効にする`}
        />



        {/* 🌙 テーマ設定 */}
        {/*<div className="setting-item">
          <h3>テーマ設定</h3>
          <p>現在のテーマ: {theme === 'light' ? '🌞 ライトモード' : '🌙 ダークモード'}</p>
          <button className="theme-toggle-btn" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            テーマを切り替える
          </button>
        </div>


        <div className="setting-item">
          <h3>アプリケーション情報</h3>
          <p>バージョン: 1.0.0</p>
          <p>React + Vite で構築されたカレンダーアプリ</p>
        </div>

        <div className="setting-item">
          <h3>今後追加予定の設定:</h3>
          <ul>
            <li>通知設定</li>
            <li>テーマカラー変更</li>
            <li>言語設定</li>
            <li>データのエクスポート・インポート</li>
          </ul>
        </div>
        */}
      </div>
    </Container>
  )
}

export default Settings
