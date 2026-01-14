import { useState } from 'react';
import { supabase } from "../../AI/AITaskColl";
import {
  Button,
  TextField,
  Container,
  Paper,
  Box,
  Typography,
  Stack,
  Alert,
} from "@mui/material";

// 認証関数
const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    console.log("サインアップ成功:", data.user);
    return data.user;
  } catch (error) {
    console.error("サインアップエラー:", error.message);
    return null;
  }
};

const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({email, password});
    if (error) throw error;
    console.log("サインイン成功:", data.user);
    return data.user;
  } catch (error) {
    console.error("サインインエラー:", error.message);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    
    // 成功した場合の処理
    console.log('サインアウト成功')
  } catch (error) {
    console.error('サインアウトエラー:', error.message)
  }
}

const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://planavi.vercel.app",
      },
    });
    if (error) throw error;
    console.log("Googleサインイン成功:", data);
    return data;
  } catch (error) {
    console.error("Googleサインインエラー:", error.message);
    return null;
  }
};


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    const user = await signUp(email, password);
    setMessage(user ? "サインアップ成功！" : "サインアップ失敗");
  };

  const handleSignIn = async () => {
    const user = await signIn(email, password);
    setMessage(user ? "ログイン成功！" : "ログイン失敗");
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
          ログイン
        </Typography>

        <Stack spacing={2}>

          <TextField
            label="メールアドレス"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="パスワード"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!password.trim()||!email.trim()?(
            <Alert severity="warning">メールアドレスとパスワードを入力してください</Alert>
          ):null}

          <Stack direction="row" spacing={2} justifyContent="center">

            <Button variant="contained" disabled={!password.trim()||!email.trim()} onClick={handleSignIn}>
              ログイン
            </Button>
            <Button variant="outlined" disabled={!password.trim()||!email.trim()} onClick={handleSignUp}>
              新規登録
            </Button>
          </Stack>

          <Box textAlign="center" mt={2} mb={1}>
            <Typography variant="body2" color="text.secondary">
              または
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleGoogleLogin}
            sx={{
              backgroundColor: "#4285F4",
              color: "white",
              "&:hover": { backgroundColor: "#357ae8" },
            }}
          >
            Google でログイン
          </Button>

          {message && (
            <Typography
              textAlign="center"
              color="primary"
              sx={{ mt: 2, fontWeight: "bold" }}
            >
              {message}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}