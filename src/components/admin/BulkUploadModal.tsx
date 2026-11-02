import React, { useState } from 'react';
import { uploadClientLogo, bulkCreateClients } from '../../lib/supabase';
import { X, Upload, Trash2, Loader2, Check, AlertCircle, Layers } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentCount: number;
}

interface StagedClient {
  id: string;
  file: File;
  name: string;
  sort_order: number;
  previewUrl: string;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentCount,
}) => {
  const [stagedFiles, setStagedFiles] = useState<StagedClient[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clean filename to human readable title (e.g. "logo-pertamina_bumn.png" -> "Pertamina Bumn")
  const formatNameFromFile = (filename: string) => {
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/^(logo|icon|brand)[-_]/i, '')
      .replace(/[-_]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    const newStaged: StagedClient[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random()}`,
      file,
      name: formatNameFromFile(file.name),
      sort_order: currentCount + stagedFiles.length + idx + 1,
      previewUrl: URL.createObjectURL(file),
    }));

    setStagedFiles((prev) => [...prev, ...newStaged]);
    e.target.value = '';
  };

  const handleRemoveStaged = (id: string) => {
    setStagedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleUpdateName = (id: string, name: string) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleUpdateSort = (id: string, sort_order: number) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, sort_order } : item))
    );
  };

  const handleProcessUploadAll = async () => {
    if (stagedFiles.length === 0) return;

    setProcessing(true);
    setErrorMsg(null);

    try {
      const uploadResults: Array<{ name: string; logo_url: string; sort_order: number; is_active: boolean }> = [];

      for (let i = 0; i < stagedFiles.length; i++) {
        const item = stagedFiles[i];
        setProgressMsg(`Mengunggah logo ${i + 1} dari ${stagedFiles.length}: "${item.name}"...`);
        
        // Upload & compress logo
        const logoUrl = await uploadClientLogo(item.file);
        uploadResults.push({
          name: item.name.trim() || 'Klien',
          logo_url: logoUrl,
          sort_order: item.sort_order,
          is_active: true,
        });
      }

      setProgressMsg('Menyimpan seluruh data ke database...');
      await bulkCreateClients(uploadResults);

      // Clean preview URLs
      stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setStagedFiles([]);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ? `[Kode: ${(err as { code?: string }).code}] ` : '';
      setErrorMsg(`${code}${err instanceof Error ? err.message : 'Gagal memproses bulk upload.'}`);
    } finally {
      setProcessing(false);
      setProgressMsg('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#111A2D] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-white">
              Bulk Upload Logo Klien Sekaligus
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Pilih beberapa file logo (PNG / WebP / SVG) sekaligus. Nama klien otomatis diambil dari nama file dan bisa Anda koreksi di bawah sebelum disimpan.
          </p>

          {/* Upload Dropzone */}
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-6 text-center cursor-pointer hover:border-amber-400/60 transition-colors">
            <Upload className="h-7 w-7 text-amber-400 mb-2" />
            <span className="text-xs font-semibold text-slate-200">
              Pilih Banyak File Logo Sekaligus
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Klik untuk memilih atau seret beberapa file gambar logo
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelected}
              disabled={processing}
              className="hidden"
            />
          </label>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Staged Items List */}
          {stagedFiles.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Daftar Logo Siap Diunggah ({stagedFiles.length} file)</span>
                <button
                  type="button"
                  onClick={() => {
                    stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                    setStagedFiles([]);
                  }}
                  className="text-red-400 hover:underline"
                >
                  Hapus Semua
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {stagedFiles.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-2.5"
                  >
                    <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded bg-slate-950 p-1 border border-slate-800">
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="max-h-10 max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-slate-400">Nama Klien</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateName(item.id, e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="w-16 shrink-0">
                      <label className="block text-[10px] text-slate-400">Urutan</label>
                      <input
                        type="number"
                        value={item.sort_order}
                        onChange={(e) => handleUpdateSort(item.id, Number(e.target.value))}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStaged(item.id)}
                      className="rounded p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {processing && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs text-amber-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{progressMsg || 'Sedang memproses...'}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleProcessUploadAll}
            disabled={processing || stagedFiles.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-[#C9A227] px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>Simpan Semua ({stagedFiles.length})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
