import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js';
import { supabase } from "../../AI/AITaskColl";


// サインアップ関数
const signUp = async (email, password) => {
  try {
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    
    // 成功した場合の処理
    console.log('サインアップ成功:', user)
    return user
  } catch (error) {
    console.error('サインアップエラー:', error.message)
    return null
  }
}
// サインイン(ログイン)関数
const signIn = async (email, password) => {
  try {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // 成功した場合の処理
    console.log('サインイン成功:', user)
    return user
  } catch (error) {
    console.error('サインインエラー:', error.message)
    return null
  }
}
// サインアウト関数
const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    
    // 成功した場合の処理
    console.log('サインアウト成功')
  } catch (error) {
    console.error('サインアウトエラー:', error.message)
  }
}



export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  return(
    <div>準備中...</div>

  )
}