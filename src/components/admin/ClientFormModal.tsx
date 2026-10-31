import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { uploadClientLogo } from '../../lib/supabase';
import { X, Upload, Trash2, Loader2, Check, AlertCircle } from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: { name: string; logo_url: string | null; sort_order: number; is_active: boolean }) => Promise<void>;
  clientToEdit?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const isEditing = Boolean(clientToEdit);

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setLogoUrl(clientToEdit.logo_url || null);
      setSortOrder(clientToEdit.sort_order ?? 0);
      setIsActive(clientToEdit.is_active ?? true);
    } else {
      setName('');
      setLogoUrl(null);
      setSortOrder(0);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [clientToEdit, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const url = await uploadClientLogo(file);
      setLogoUrl(url);
      // If name is empty, auto-fill from filename
      if (!name.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]+/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setName(cleanName);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengunggah logo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama klien wajib diisi.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await onSave({
        name: name.trim(),
        logo_url: logoUrl,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan data klien');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#111A2D] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="font-serif text-lg font-bold text-white">
            {isEditing ? 'Edit Data Klien' : 'Tambah Klien Baru'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Nama Klien / Perusahaan / Instansi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: PT Pertamina (Persero), PNM, Infobank"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Logo Upload with Drag & Drop & Transparent Checkerboard Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Logo Klien (PNG / WebP / SVG)
            </label>

            {logoUrl ? (
              <div className="relative flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 p-4">
                <div className="flex h-16 w-full items-center justify-center p-2 rounded bg-slate-950/60 border border-slate-800">
                  <img
                    src={logoUrl}
                    alt={name || 'Logo preview'}
                    className="max-h-12 max-w-[180px] object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <label className="cursor-pointer text-amber-400 hover:underline font-medium">
                    <span>Ganti Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Logo (Jadikan Teks)</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-5 text-center cursor-pointer hover:border-amber-400/60 transition-colors">
                <Upload className="h-6 w-6 text-amber-400 mb-1" />
                <span className="text-xs font-semibold text-slate-200">
                  Unggah Logo (Maks. Lebar 600px)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Mendukung PNG &amp; WebP transparan (opsional, jika kosong tampil sebagai teks)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-400 py-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mengompresi dan mengunggah logo...</span>
              </div>
            )}
          </div>

          {/* Sort Order & Active Toggle */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400">
                Urutan (Sort Order)
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Status Aktif (Tampil)
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center gap-1.5 rounded-lg bg-[#C9A227] px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Simpan Klien</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
