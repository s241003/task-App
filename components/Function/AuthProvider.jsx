import { useState, useEffect,createContext, useContext, } from 'react';
import { supabase } from "../AI/AITaskColl";
import { Navigate } from "react-router-dom";


export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>読み込み中...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}


const AuthContext = createContext();
// supabase 認証
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 初回アクセス時にセッション確認
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // ログイン・ログアウトの変化を監視
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);