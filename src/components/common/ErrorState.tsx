import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Terjadi kendala saat memuat data katalog.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-900/30 bg-red-950/20 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/40 text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-medium text-red-200">Gagal Memuat Produk</h3>
      <p className="mt-1 max-w-sm text-xs text-red-300/80">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-900/40 px-3.5 py-2 text-xs font-medium text-red-100 hover:bg-red-800/50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Coba Muat Ulang</span>
        </button>
      )}
    </div>
  );
};
