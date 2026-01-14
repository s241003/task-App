import React,{ useContext } from 'react';
import { useAuth } from '../AuthProvider';
import {  Button,  TextField,  Container,  Paper,  Box,  Typography,  Stack,  Alert,} from "@mui/material";
import { signOut } from './LoginPage';

function Settings({ theme,setTheme }) {
    const { user } = useAuth();

  return (
    <div className="page-content">
      <Typography variant="h4" fontWeight="bold" textAlign="center">アカウント設定</Typography>
      <Button variant="outlined" color="error" onClick={() => {signOut()}}>
        ログアウト
      </Button>

      <div>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mt={3}>ユーザー情報</Typography>
           <Typography variant="h6" textAlign="center" m={2}>{user ? `ログイン中: ${user?.email}`:"ログインしていません。" }</Typography>
        <Typography variant="h6" textAlign="center" m={2}>{user ? `ユーザID: ${user?.id}`:"ログインしていません。" }</Typography>
        



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
    </div>
  )
}

export default Settings
