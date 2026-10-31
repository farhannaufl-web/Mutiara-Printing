import React from 'react';
import { PackageOpen, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak Ada Produk Ditemukan',
  description = 'Coba ubah kata kunci pencarian atau pilih kategori plakat lainnya.',
  onReset,
  resetLabel = 'Reset Filter',
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#10192A] px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-amber-400">
        <PackageOpen className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-serif text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{resetLabel}</span>
        </button>
      )}
    </div>
  );
};
