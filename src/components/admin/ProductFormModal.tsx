import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { SITE_CONFIG } from '../../config/site';
import { uploadProductImage } from '../../lib/supabase';
import {
  X,
  Upload,
  Trash2,
  MoveLeft,
  MoveRight,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const isEditing = Boolean(productToEdit);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('resin');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [sizeInfo, setSizeInfo] = useState('');
  const [minOrder, setMinOrder] = useState('1 pcs');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(true);

  // Auto generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setSlug(productToEdit.slug);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description);
      setMaterial(productToEdit.material);
      setSizeInfo(productToEdit.size_info);
      setMinOrder(productToEdit.min_order);
      setImageUrls(productToEdit.image_urls || []);
      setIsFeatured(productToEdit.is_featured);
      setIsActive(productToEdit.is_active);
      setSortOrder(productToEdit.sort_order || 0);
      setAutoSlug(false);
    } else {
      setTitle('');
      setSlug('');
      setCategory('resin');
      setDescription('');
      setMaterial('');
      setSizeInfo('');
      setMinOrder('1 pcs');
      setImageUrls([]);
      setIsFeatured(false);
      setIsActive(true);
      setSortOrder(0);
      setAutoSlug(true);
    }
    setErrorMsg(null);
  }, [productToEdit, isOpen]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug && !isEditing) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const uploadPromises = Array.from(files).map((file) => uploadProductImage(file));
      const newUrls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...newUrls]);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setImageUrls((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul produk wajib diisi.');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Slug URL produk wajib diisi.');
      return;
    }
    if (imageUrls.length === 0) {
      setErrorMsg('Minimal sertakan 1 foto produk.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        category,
        description: description.trim(),
        material: material.trim(),
        size_info: sizeInfo.trim(),
        min_order: minOrder.trim(),
        image_urls: imageUrls,
        is_featured: isFeatured,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#111A2D] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="font-serif text-lg font-bold text-white">
            {isEditing ? 'Edit Data Produk' : 'Tambah Produk Plakat Baru'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-6 space-y-5">
          
          {/* Title & Slug */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Nama / Judul Produk *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Contoh: Plakat Resin Crystal Emblem Gold 3D"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  URL Slug (Unik) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(true);
                    setSlug(generateSlug(title));
                  }}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Generate dari Judul
                </button>
              </div>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(e.target.value);
                }}
                placeholder="plakat-resin-crystal-emblem-gold-3d"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Min Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Kategori Produk *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                {SITE_CONFIG.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Minimal Pemesanan (MOQ)
              </label>
              <input
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="1 pcs"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Deskripsi Detail Produk
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan keunggulan plakat, finishing, kelengkapan kotak beludru, dll..."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Material & Size Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Bahan Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Contoh: Resin Kristal Bening + Tatakan Kayu Solid"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Dimensi Ukuran
              </label>
              <input
                type="text"
                value={sizeInfo}
                onChange={(e) => setSizeInfo(e.target.value)}
                placeholder="Contoh: 20 x 14 x 4 cm"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Image Upload Area with Compression */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Foto Produk (Multi-upload &amp; auto-compress ke WebP/JPEG) *
              </label>
              <span className="text-[11px] text-slate-400">
                {imageUrls.length} foto terunggah
              </span>
            </div>

            {/* Upload Drag/Drop Box */}
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-5 text-center cursor-pointer hover:border-amber-400/60 transition-colors">
              <Upload className="h-6 w-6 text-amber-400 mb-1" />
              <span className="text-xs font-semibold text-slate-200">
                Pilih atau Tarik File Foto ke Sini
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Otomatis dioptimalkan (max 1600px) sebelum disimpan ke storage
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-400 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sedang mengompresi dan mengunggah foto...</span>
              </div>
            )}

            {/* Preview & Reorder Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] rounded-lg border border-slate-700 bg-slate-900 overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">
                        Cover Utama
                      </span>
                    )}

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'left')}
                          title="Geser ke kiri"
                          className="rounded p-1 bg-slate-800 text-slate-200 hover:text-white"
                        >
                          <MoveLeft className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        title="Hapus foto"
                        className="rounded p-1 bg-red-900/80 text-red-200 hover:bg-red-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {idx < imageUrls.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'right')}
                          title="Geser ke kanan"
                          className="rounded p-1 bg-slate-800 text-slate-200 hover:text-white"
                        >
                          <MoveRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggles: Featured & Active + Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Produk Unggulan
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs font-semibold text-slate-200">
                Tampilkan di Katalog (Aktif)
              </span>
            </label>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400">
                Urutan Tampil (Sort Order)
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
              />
            </div>
          </div>

          {/* Modal Actions */}
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
              disabled={saving}
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
                  <span>Simpan Produk</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
