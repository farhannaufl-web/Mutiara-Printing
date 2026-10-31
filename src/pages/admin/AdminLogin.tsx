import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SITE_CONFIG } from '../../config/site';
import { Award, Lock, Mail, Key, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMsg(res.error || 'Autentikasi gagal.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@mutiaraprinting.com');
    setPassword('admin123');
  };

  return (
    <>
      <Helmet>
        <title>Login Pengelola Katalog – {SITE_CONFIG.name}</title>
      </Helmet>

      <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111A2C] p-6 sm:p-8 shadow-2xl">
          
          {/* Logo & Header */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-md">
              <Award className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-serif text-xl sm:text-2xl font-bold text-white">
              Portal Admin Workshop
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Kelola katalog plakat, foto produk, dan pantau klik WhatsApp
            </p>
          </div>

          {/* Supabase status notice */}
          <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Status Database:</span>
              <span className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                {isSupabaseConfigured ? 'Supabase Terhubung' : 'Demo Mode (Lokal Aktif)'}
              </span>
            </div>
            {!isSupabaseConfigured && (
              <p className="mt-1 text-[11px] text-slate-400">
                Gunakan kredensial demo untuk mencoba panel admin tanpa konfigurasi Supabase awal.
              </p>
            )}
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Email Akun Admin
              </label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mutiaraprinting.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Key className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C9A227] py-2.5 px-4 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick autofill for demo testing */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Isi Otomatis Akun Demo (admin@mutiaraprinting.com)
            </button>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Kembali ke Beranda Publik</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
