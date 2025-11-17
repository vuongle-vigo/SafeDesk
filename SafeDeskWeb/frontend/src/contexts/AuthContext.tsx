import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mockAPI } from '../utils/api'; // added import

type User = {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const res = await mockAPI.getMe(token);
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          // invalid token -> remove
          try { localStorage.removeItem('token'); } catch {}
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await mockAPI.login(email, password);
      if (res.success) {
        if (res.user) setUser(res.user);
        if (res.token) {
          try { localStorage.setItem('token', res.token); } catch {}
        }
        return { error: null };
      } else {
        return { error: res.error ?? 'Đăng nhập thất bại' };
      }
    } catch (err: any) {
      return { error: err?.message ?? 'Lỗi mạng' };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const res = await mockAPI.signUp(email, password, name);
      if (res.success) {
        if (res.user) setUser(res.user);
        if (res.token) {
          try { localStorage.setItem('token', res.token); } catch {}
        }
        return { error: null };
      }
      return { error: res.error ?? 'Đăng ký thất bại' };
    } catch (err: any) {
      return { error: err?.message ?? 'Lỗi mạng' };
    }
  };

  const signOut = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    await mockAPI.logout(token);
    try { localStorage.removeItem('token'); } catch {}
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
