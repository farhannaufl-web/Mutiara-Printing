import React, { useState, useEffect } from 'react';
import { checkLegacyLocalData, migrateLocalDataToSupabase, LocalDataSummary } from '../../lib/migration';
import { Database, AlertTriangle, CheckCircle2, Loader2, ArrowRight, X, RefreshCw } from 'lucide-react';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationSuccess: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({
  isOpen,
  onClose,
  onMigrationSuccess,
}) => {
  const [summary, setSummary] = useState<LocalDataSummary>({
    hasLocalData: false,
    productCount: 0,
    clientCount: 0,
    clickCount: 0,
  });
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [progressText, setProgressText] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<{ message: string; code?: string } | null>(null);
  const [resultCount, setResultCount] = useState<{ products: number; clients: number; clicks: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const data = checkLegacyLocalData();
      setSummary(data);
      setStatus('idle');
      setProgressText('');
      setErrorDetails(null);
      setResultCount(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartMigration = async () => {
    setStatus('running');
    setErrorDetails(null);
    try {
      const res = await migrateLocalDataToSupabase((msg) => {
        setProgressText(msg);
      });
      setResultCount({
        products: res.productsMigrated,
        clients: res.clientsMigrated,
        clicks: res.clicksMigrated,
      });
      setStatus('success');
      // Update summary to reflect cleaned localStorage
      setSummary(checkLegacyLocalData());
      onMigrationSuccess();
    } catch (err: unknown) {
      console.error('Migration failed:', err);
      const message = err instanceof Error ? err.message : 'Terjadi kegagalan saat migrasi data.';
      const code = (err as { code?: string })?.code;
      setErrorDetails({ message, code });
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#111A2D] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-white">
                Migrasi Data Lokal ke Supabase
              </h2>
              <p className="text-[11px] text-slate-400">
                Pindahkan data produk, klien, dan klik WA dari browser ke database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={status === 'running'}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {status === 'idle' && (
            <>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">
                  Status Data di localStorage Browser:
                </span>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/80">
                    <span className="text-lg font-bold text-amber-400 block tabular-nums">
                      {summary.productCount}
                    </span>
                    <span className="text-[10px] text-slate-400">Produk</span>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/80">
                    <span className="text-lg font-bold text-sky-400 block tabular-nums">
                      {summary.clientCount}
                    </span>
                    <span className="text-[10px] text-slate-400">Klien</span>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/80">
                    <span className="text-lg font-bold text-emerald-400 block tabular-nums">
                      {summary.clickCount}
                    </span>
                    <span className="text-[10px] text-slate-400">Klik WA</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Proses ini akan membaca data lama dari key <code className="text-amber-300">mutiara_local_products_v1</code>, <code className="text-sky-300">mutiara_clients_data_v2</code>, dan <code className="text-emerald-300">mutiara_local_wa_clicks_v1</code>. Gambar bertipe Base64 akan otomatis dikonversi dan diunggah ke storage bucket <code className="text-slate-200">product-images</code>, lalu key lokal lama akan dibersihkan.
                </p>
              </div>

              {!summary.hasLocalData ? (
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-slate-800 p-3 text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Tidak ada data lokal yang terdeteksi di browser ini. Seluruh data sudah berada di Supabase.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Pastikan koneksi internet stabil saat proses migrasi mengunggah gambar ke Supabase Storage.
                  </span>
                </div>
              )}
            </>
          )}

          {status === 'running' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="font-medium text-sm text-white">Sedang Menjalankan Migrasi...</p>
                <p className="text-xs text-slate-400 animate-pulse">{progressText || 'Menghubungkan ke Supabase...'}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-5 space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-white">Migrasi Berhasil Selesai!</h3>
                <p className="text-xs text-slate-300">
                  Seluruh data lokal telah tersalin ke tabel Supabase dan penyimpanan localStorage lama telah dibersihkan.
                </p>
              </div>

              {resultCount && (
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
                    <span className="text-base font-bold text-amber-400 block">{resultCount.products}</span>
                    <span className="text-[10px] text-slate-400">Produk Ditambah</span>
                  </div>
                  <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
                    <span className="text-base font-bold text-sky-400 block">{resultCount.clients}</span>
                    <span className="text-[10px] text-slate-400">Klien Ditambah</span>
                  </div>
                  <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
                    <span className="text-base font-bold text-emerald-400 block">{resultCount.clicks}</span>
                    <span className="text-[10px] text-slate-400">Klik WA Tercatat</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-red-300 font-semibold">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>Gagal Melakukan Migrasi</span>
              </div>
              {errorDetails?.code && (
                <div className="font-mono text-[11px] text-red-400">
                  Kode Error: {errorDetails.code}
                </div>
              )}
              <p className="text-slate-300 break-words leading-relaxed">
                {errorDetails?.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
          {status === 'success' ? (
            <button
              onClick={onClose}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-950"
            >
              Selesai &amp; Tutup
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'running'}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleStartMigration}
                disabled={status === 'running' || !summary.hasLocalData}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C9A227] hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 transition-colors disabled:opacity-40"
              >
                {status === 'running' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Mulai Migrasi ke Supabase</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
