import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  fetchProducts,
  fetchAdminStats,
  createProduct,
  updateProduct,
  deleteProduct,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { Product, AdminStats } from '../../types';
import { SITE_CONFIG } from '../../config/site';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { AdminHeader } from '../../components/admin/AdminHeader';

import {
  Package,
  Eye,
  EyeOff,
  MessageCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  LogOut,
  ExternalLink,
  Sparkles,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isAuthenticated, userEmail, logout, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [prodsRes, statsRes] = await Promise.all([
        fetchProducts({ includeInactive: true, limit: 200 }),
        fetchAdminStats(),
      ]);
      setProducts(prodsRes.data);
      setStats(statsRes);
    } catch (err: unknown) {
      console.error('Failed to load admin data', err);
      showToast('Gagal menyinkronkan data katalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleToggleActive = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { is_active: !product.is_active });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showToast(
        `Produk "${product.title}" berhasil di-${updated.is_active ? 'aktifkan' : 'sembunyikan'}.`
      );
      // Refresh stats
      fetchAdminStats().then(setStats);
    } catch {
      showToast('Gagal mengubah status aktif produk.', 'error');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { is_featured: !product.is_featured });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showToast(`Status unggulan "${product.title}" diperbarui.`);
    } catch {
      showToast('Gagal mengubah status unggulan.', 'error');
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, productData);
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      showToast(`Perubahan produk "${updated.title}" berhasil disimpan.`);
    } else {
      const created = await createProduct(productData as Omit<Product, 'id' | 'created_at'>);
      setProducts((prev) => [created, ...prev]);
      showToast(`Produk baru "${created.title}" berhasil ditambahkan.`);
    }
    fetchAdminStats().then(setStats);
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast(`Produk "${productToDelete.title}" telah dihapus.`);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      fetchAdminStats().then(setStats);
    } catch {
      showToast('Gagal menghapus produk.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>Dashboard Admin – {SITE_CONFIG.name}</title>
      </Helmet>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs shadow-2xl text-white">
          {toast.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="min-h-screen bg-[#090E1A] pb-24 text-slate-100">
        <AdminHeader />

        <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-8">

          
          {/* Dashboard Summary Statistics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-[#111A2D] p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Produk</span>
                <Package className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {stats?.totalProducts ?? products.length}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-semibold">{stats?.activeProducts ?? 0} Aktif</span>
                <span>·</span>
                <span className="text-slate-500">{stats?.hiddenProducts ?? 0} Sembunyi</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#111A2D] p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>WhatsApp Clicks (7 Hari)</span>
                <MessageCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {stats?.clicksLast7Days ?? 0}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Trafik leads seminggu terakhir
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#111A2D] p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>WhatsApp Clicks (30 Hari)</span>
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {stats?.clicksLast30Days ?? 0}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Akumulasi leads 1 bulan
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#111A2D] p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Produk Unggulan</span>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {products.filter((p) => p.is_featured).length}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Ditampilkan di homepage hero
              </p>
            </div>
          </div>

          {/* Top 5 Most Clicked Products Strip */}
          {stats?.topProducts && stats.topProducts.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-[#111A2D] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-400">
                  Top 5 Produk Paling Banyak Ditanyakan via WhatsApp
                </h3>
                <span className="text-[11px] text-slate-500">Tracking Realtime</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {stats.topProducts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-xs"
                  >
                    <span className="font-medium text-slate-200 line-clamp-2">
                      {item.productTitle}
                    </span>
                    <div className="mt-2 flex items-center justify-between text-amber-400 font-bold tabular-nums">
                      <span className="text-[10px] text-slate-500">Ranking #{idx + 1}</span>
                      <span>{item.clickCount} klik</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catalog Management Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-white">
                  Daftar Katalog Plakat &amp; Trophy
                </h2>
                <p className="text-xs text-slate-400">
                  Tambah foto baru, atur urutan tampilan, atau nonaktifkan produk.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadAllData}
                  title="Muat Ulang"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1.5 rounded-xl bg-[#C9A227] px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari berdasarkan judul, material, atau slug..."
                  className="w-full rounded-xl border border-slate-800 bg-[#111A2D] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-[#111A2D] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="all">Semua Kategori ({products.length})</option>
                {SITE_CONFIG.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table View (Desktop & Responsive Scroll) */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111A2D] shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/80 font-semibold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Produk</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Urutan</th>
                      <th className="px-4 py-3">Unggulan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Memuat data produk...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Tidak ada produk yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const cover = p.image_urls?.[0];
                        return (
                          <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                            {/* Product Info with Thumbnail */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-14 shrink-0 overflow-hidden rounded bg-slate-900 border border-slate-800">
                                  {cover ? (
                                    <img
                                      src={cover}
                                      alt={p.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-600">
                                      No pic
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <a
                                    href={`/produk/${p.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-serif font-bold text-slate-100 hover:text-amber-400 truncate block max-w-xs"
                                  >
                                    {p.title}
                                  </a>
                                  <span className="text-[11px] text-slate-500 block truncate">
                                    MOQ: {p.min_order}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-3 capitalize text-slate-300">
                              {p.category}
                            </td>

                            {/* Sort Order */}
                            <td className="px-4 py-3 tabular-nums text-slate-400">
                              {p.sort_order}
                            </td>

                            {/* Featured Toggle */}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleFeatured(p)}
                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                  p.is_featured
                                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                <Sparkles className="h-3 w-3" />
                                <span>{p.is_featured ? 'Ya' : 'Tidak'}</span>
                              </button>
                            </td>

                            {/* Active Toggle */}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleActive(p)}
                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                  p.is_active
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {p.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                <span>{p.is_active ? 'Tampil' : 'Sembunyi'}</span>
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  title="Edit Produk"
                                  className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(p)}
                                  title="Hapus Produk"
                                  className="rounded p-1.5 text-slate-400 hover:bg-red-950/60 hover:text-red-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>

        {/* Product Add/Edit Modal */}
        <ProductFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSaveProduct}
          productToEdit={editingProduct}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          productTitle={productToDelete?.title || ''}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }}
        />

      </div>
    </>
  );
};
