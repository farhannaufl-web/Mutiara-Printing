import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SITE_CONFIG } from '../../config/site';
import { Package, Users, ExternalLink, LogOut } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { userEmail, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isProducts = location.pathname === '/admin/dashboard' || location.pathname === '/admin';
  const isClients = location.pathname === '/admin/klien';

  return (
    <header className="border-b border-slate-800 bg-[#0E1626]">
      {/* Top action row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="font-serif text-lg font-bold text-white tracking-tight">
            {SITE_CONFIG.name} <span className="text-amber-400 font-sans text-xs">/ Admin</span>
          </Link>
          <span className="hidden sm:inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
            {isSupabaseConfigured ? 'Supabase Live' : 'Local Sandbox Mode'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <span className="hidden md:inline text-slate-400">{userEmail}</span>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-slate-200 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lihat Website</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-lg border border-red-900/40 bg-red-950/40 px-2.5 py-1.5 text-red-300 hover:bg-red-900/60"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-800/60 pt-2 pb-0">
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
              isProducts
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Katalog Produk</span>
          </Link>

          <Link
            to="/admin/klien"
            className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
              isClients
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Klien Kami (Running Logo)</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
