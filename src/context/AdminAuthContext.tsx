import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, supabaseDiagnostics } from '../lib/supabase';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        if (!isSupabaseConfigured || !supabase) {
          if (isMounted) {
            setIsAuthenticated(false);
            setUserEmail(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Supabase Auth] Failed to retrieve session:', error.message);
        }

        if (isMounted) {
          if (data?.session?.user) {
            setIsAuthenticated(true);
            setUserEmail(data.session.user.email || 'Admin');
          } else {
            setIsAuthenticated(false);
            setUserEmail(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[Supabase Auth] Session verification error:', err);
        if (isMounted) {
          setIsAuthenticated(false);
          setUserEmail(null);
          setLoading(false);
        }
      }
    }

    checkSession();

    // Listen to Supabase Auth State changes in realtime
    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || 'Admin');
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Real Supabase Auth login using supabase.auth.signInWithPassword
   * Strictly no local fallback or hardcoded passwords.
   */
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      const reason = supabaseDiagnostics.configErrors[0] || 'Koneksi database belum disetel.';
      return {
        success: false,
        error: `Supabase belum terkonfigurasi (${reason}). Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY telah diisi di environment.`,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        // Return exact error message from Supabase Auth
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setIsAuthenticated(true);
        setUserEmail(data.user.email || email);
        return { success: true };
      }

      return { success: false, error: 'User tidak ditemukan atau sesi tidak dapat dibuat.' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kegagalan saat autentikasi ke Supabase.';
      return { success: false, error: message };
    }
  };

  /**
   * Sign out strictly through Supabase Auth
   */
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[Supabase Auth] Sign out error:', err);
      }
    }
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
