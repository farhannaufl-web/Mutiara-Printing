import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LOCAL_ADMIN_SESSION_KEY = 'mutiara_admin_session_active';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial session
    async function checkSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setIsAuthenticated(true);
            setUserEmail(data.session.user.email || 'Admin');
            setLoading(false);
            return;
          }
        }

        // Check local test session
        const localActive = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
        if (localActive) {
          setIsAuthenticated(true);
          setUserEmail(localActive);
        }
      } catch (err) {
        console.error('Session check error', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    // Listen to Supabase auth state if configured
    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || 'Admin');
        } else {
          const localActive = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
          if (!localActive) {
            setIsAuthenticated(false);
            setUserEmail(null);
          }
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // If Supabase is configured, use real Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          setIsAuthenticated(true);
          setUserEmail(data.user.email || email);
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed';
        return { success: false, error: message };
      }
    }

    // Fallback authentication for setup and demo validation
    // Standard credential or demo admin
    if (
      (email === 'admin@mutiaraprinting.com' && pass === 'admin123') ||
      (email.includes('@') && pass.length >= 6)
    ) {
      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, email);
      setIsAuthenticated(true);
      setUserEmail(email);
      return { success: true };
    }

    return {
      success: false,
      error: 'Email atau password salah. Gunakan admin@mutiaraprinting.com / admin123 untuk akses demo.',
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, userEmail, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
