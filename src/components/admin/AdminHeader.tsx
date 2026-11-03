import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { isSupabaseConfigured, supabaseDiagnostics } from '../../lib/supabase';
import { SITE_CONFIG } from '../../config/site';
import { Package, Users, ExternalLink, LogOut, Database } from 'lucide-react';
import { MigrationModal } from './MigrationModal';
import { checkLegacyLocalData } from '../../lib/migration';

interface AdminHeaderProps {
  onRefreshData?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onRefreshData }) => {
  const { userEmail, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [hasLegacyData, setHasLegacyData] = useState(false);

  useEffect(() => {
    const checkData = () => {
      const summary = checkLegacyLocalData();
      setHasLegacyData(summary.hasLocalData);
    };
    checkData();
  }, []);

  const handleMigrationDone = () => {
    setHasLegacyData(false);
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const isProducts = location.pathname === '/admin/dashboard' || location.pathname === '/admin';
  const isClients = location.pathname === '/admin/klien';

  return (
    <>
      <header className="border-b border-slate-800 bg-[#0E1626]">
        {/* Top action row */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="flex items-center gap-2 group">
              <img
                src="/assets/aistudio/Logo_45caa060.png"
                alt="Logo Mutiara"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <img
                src="/assets/aistudio/Tulisan_a6e36dee.png"
                alt="Mutiara Printing"
                className="h-5 sm:h-6 w-auto object-contain"
              />
              <span className="text-amber-400 font-sans text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                Admin
              </span>
            </Link>
            {isSupabaseConfigured ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Supabase Live ({supabaseDiagnostics.urlSource})</span>
              </span>
            ) : (
              <span
                title={`Kendala Konfigurasi:\n${supabaseDiagnostics.configErrors.join('\n')}`}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-medium text-red-300 cursor-help"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span>Supabase Belum Dikonfigurasi ({supabaseDiagnostics.configErrors.length} kendala)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="hidden md:inline text-slate-400">{userEmail}</span>

            {/* Migration Button */}
            <button
              onClick={() => setMigrationModalOpen(true)}
              className={`relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium transition-colors ${
                hasLegacyData
                  ? 'border-amber-500/60 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
              title="Migrasikan data lokal browser ke database Supabase"
            >
              <Database className="h-3.5 w-3.5 text-amber-400" />
              <span>Migrasi Data Lokal</span>
              {hasLegacyData && (
                <span className="flex h-2 w-2 rounded-full bg-amber-400 absolute -top-1 -right-1" />
              )}
            </button>

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

      {/* Migration Modal */}
      <MigrationModal
        isOpen={migrationModalOpen}
        onClose={() => setMigrationModalOpen(false)}
        onMigrationSuccess={handleMigrationDone}
      />
    </>
  );
};
