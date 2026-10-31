import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  importInitialClients,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { Client } from '../../types';
import { SITE_CONFIG } from '../../config/site';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { ClientFormModal } from '../../components/admin/ClientFormModal';
import { BulkUploadModal } from '../../components/admin/BulkUploadModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  DownloadCloud,
  Image as ImageIcon,
  Search,
} from 'lucide-react';

export const AdminClients: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchClients(true); // include inactive
      setClients(data);
    } catch {
      showToast('Gagal memuat data klien.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleToggleActive = async (client: Client) => {
    try {
      const updated = await updateClient(client.id, { is_active: !client.is_active });
      setClients((prev) => prev.map((c) => (c.id === client.id ? updated : c)));
      showToast(
        `Klien "${client.name}" ${updated.is_active ? 'diaktifkan di marquee' : 'disembunyikan'}.`
      );
    } catch {
      showToast('Gagal mengubah status aktif.', 'error');
    }
  };

  const handleUpdateSortOrder = async (client: Client, newOrder: number) => {
    try {
      const updated = await updateClient(client.id, { sort_order: newOrder });
      setClients((prev) =>
        prev
          .map((c) => (c.id === client.id ? updated : c))
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      );
      showToast(`Urutan "${client.name}" diperbarui.`);
    } catch {
      showToast('Gagal memperbarui urutan.', 'error');
    }
  };

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormModalOpen(true);
  };

  const handleSaveClient = async (clientData: {
    name: string;
    logo_url: string | null;
    sort_order: number;
    is_active: boolean;
  }) => {
    if (editingClient) {
      const updated = await updateClient(editingClient.id, clientData);
      setClients((prev) => prev.map((c) => (c.id === editingClient.id ? updated : c)));
      showToast(`Data klien "${updated.name}" berhasil diperbarui.`);
    } else {
      const created = await createClient(clientData);
      setClients((prev) => [...prev, created].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
      showToast(`Klien baru "${created.name}" berhasil ditambahkan.`);
    }
  };

  const handleOpenDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await deleteClient(clientToDelete.id, clientToDelete.logo_url);
      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
      showToast(`Klien "${clientToDelete.name}" beserta logonya berhasil dihapus.`);
      setDeleteModalOpen(false);
      setClientToDelete(null);
    } catch {
      showToast('Gagal menghapus klien.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportInitial = async () => {
    setIsImporting(true);
    try {
      const imported = await importInitialClients();
      setClients((prev) => [...prev, ...imported]);
      showToast('Klien awal (Infobank, PNM, Pertamina) berhasil diimpor!');
    } catch {
      showToast('Gagal mengimpor klien awal.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Kelola Klien Kami – {SITE_CONFIG.name} Admin</title>
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

        <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top Bar: Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
                Manajemen Klien &amp; Running Logo
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola daftar korporasi/instansi yang tampil di pita logo bergerak (marquee) pada halaman utama.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadData}
                title="Muat Ulang"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {clients.length === 0 && (
                <button
                  onClick={handleImportInitial}
                  disabled={isImporting}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                >
                  <DownloadCloud className="h-4 w-4" />
                  <span>{isImporting ? 'Mengimpor...' : 'Import Klien Awal (Infobank, PNM, Pertamina)'}</span>
                </button>
              )}

              <button
                onClick={() => setBulkModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <Layers className="h-4 w-4 text-amber-400" />
                <span>Bulk Upload Logo</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 rounded-xl bg-[#C9A227] px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Klien</span>
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="rounded-xl border border-slate-800/80 bg-[#111A2D] p-4 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-amber-400">Tips Logo:</span>{' '}
              Gunakan logo berformat PNG atau WebP dengan background transparan. Logo akan otomatis ditampilkan dalam mode grayscale di marquee publik dan berubah menjadi berwarna penuh saat disentuh/diarahkan cursor.
            </div>
            <div className="text-[11px] text-slate-400 shrink-0">
              Total: <strong className="text-white">{clients.length}</strong> Klien ({clients.filter((c) => c.is_active).length} Aktif)
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama klien..."
              className="w-full rounded-xl border border-slate-800 bg-[#111A2D] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>

          {/* Clients List Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111A2D] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/80 font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Logo Klien</th>
                    <th className="px-4 py-3">Nama Klien / Instansi</th>
                    <th className="px-4 py-3">Urutan</th>
                    <th className="px-4 py-3">Tampil di Marquee</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Memuat data klien...
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Belum ada klien terdaftar.{' '}
                        <button
                          onClick={handleImportInitial}
                          className="text-amber-400 hover:underline font-semibold"
                        >
                          Klik di sini untuk mengimpor Infobank, PNM, dan Pertamina
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Logo Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-slate-950 p-1.5 border border-slate-800">
                            {client.logo_url ? (
                              <img
                                src={client.logo_url}
                                alt={client.name}
                                className="max-h-9 max-w-full object-contain"
                              />
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <ImageIcon className="h-3 w-3" />
                                <span>Teks</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <span className="font-serif text-sm font-bold text-white block">
                            {client.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {client.logo_url ? 'Format: Gambar Logo' : 'Format: Teks Tipografi'}
                          </span>
                        </td>

                        {/* Sort Order Input */}
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={client.sort_order ?? 0}
                            onChange={(e) => handleUpdateSortOrder(client, Number(e.target.value))}
                            className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white tabular-nums"
                          />
                        </td>

                        {/* Active Toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(client)}
                            className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                              client.is_active
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {client.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            <span>{client.is_active ? 'Tampil' : 'Sembunyi'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(client)}
                              title="Edit Klien"
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(client)}
                              title="Hapus Klien & Logo"
                              className="rounded p-1.5 text-slate-400 hover:bg-red-950/60 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        {/* Add/Edit Client Modal */}
        <ClientFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSaveClient}
          clientToEdit={editingClient}
        />

        {/* Bulk Upload Modal */}
        <BulkUploadModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onSuccess={loadData}
          currentCount={clients.length}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          productTitle={clientToDelete ? `Klien ${clientToDelete.name}` : ''}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteModalOpen(false);
            setClientToDelete(null);
          }}
        />

      </div>
    </>
  );
};
