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
} from '../../lib/supabase';
import { Client } from '../../types';
import { SITE_CONFIG } from '../../config/site';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { ClientFormModal } from '../../components/admin/ClientFormModal';
import { BulkUploadModal } from '../../components/admin/BulkUploadModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

import {
  Users,
  Plus,
  UploadCloud,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  Image as ImageIcon,
} from 'lucide-react';

const formatErrorMessage = (err: unknown, fallback: string = 'Terjadi kesalahan'): string => {
  if (err && typeof err === 'object') {
    const errorObj = err as { message?: string; code?: string };
    if (errorObj.message) {
      const codePart = errorObj.code ? `[Kode: ${errorObj.code}] ` : '';
      return `${codePart}${errorObj.message}`;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
};

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
    setTimeout(() => setToast(null), 4500);
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
    } catch (err: unknown) {
      console.error('Failed to load clients:', err);
      showToast(formatErrorMessage(err, 'Gagal memuat data klien dari Supabase.'), 'error');
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
      showToast(
        `Klien "${client.name}" ${updated.is_active ? 'diaktifkan di marquee' : 'disembunyikan'}.`
      );
      // Strictly refetch from Supabase
      await loadData();
    } catch (err: unknown) {
      showToast(formatErrorMessage(err, 'Gagal mengubah status aktif.'), 'error');
    }
  };

  const handleUpdateSortOrder = async (client: Client, newOrder: number) => {
    try {
      await updateClient(client.id, { sort_order: newOrder });
      showToast(`Urutan "${client.name}" diperbarui.`);
      // Strictly refetch from Supabase
      await loadData();
    } catch (err: unknown) {
      showToast(formatErrorMessage(err, 'Gagal memperbarui urutan.'), 'error');
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
    try {
      if (editingClient) {
        const updated = await updateClient(editingClient.id, clientData);
        showToast(`Data klien "${updated.name}" berhasil diperbarui.`);
      } else {
        const created = await createClient(clientData);
        showToast(`Klien baru "${created.name}" berhasil ditambahkan.`);
      }
      // Strictly refetch from Supabase
      await loadData();
    } catch (err: unknown) {
      showToast(formatErrorMessage(err, 'Gagal menyimpan klien.'), 'error');
      throw err;
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
      showToast(`Klien "${clientToDelete.name}" beserta logonya berhasil dihapus.`);
      setDeleteModalOpen(false);
      setClientToDelete(null);
      // Strictly refetch from Supabase
      await loadData();
    } catch (err: unknown) {
      showToast(formatErrorMessage(err, 'Gagal menghapus klien.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportInitial = async () => {
    setIsImporting(true);
    try {
      const imported = await importInitialClients();
      showToast(`${imported.length} klien awal (Infobank, PNM, Pertamina) berhasil diimpor ke Supabase!`);
      // Strictly refetch from Supabase
      await loadData();
    } catch (err: unknown) {
      showToast(formatErrorMessage(err, 'Gagal mengimpor klien awal.'), 'error');
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
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-xs shadow-2xl text-white backdrop-blur-md max-w-md">
          {toast.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span className="break-words leading-relaxed">{toast.message}</span>
        </div>
      )}

      <div className="min-h-screen bg-[#090E1A] pb-24 text-slate-100">
        <AdminHeader onRefreshData={loadData} />

        <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top Info Banner & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Manajemen Klien &amp; Running Logo
                </h1>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Data disimpan di tabel <code className="text-amber-300">clients</code> dan file logo di Supabase Storage. Perubahan langsung tampil di running logo Beranda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                title="Muat ulang dari Supabase"
                className="rounded-xl border border-slate-800 bg-[#111A2D] p-2.5 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleImportInitial}
                disabled={isImporting}
                title="Tambahkan Infobank, PNM, Pertamina ke Supabase jika belum ada"
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>{isImporting ? 'Mengimpor...' : 'Import Klien Awal'}</span>
              </button>

              <button
                onClick={() => setBulkModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
              >
                <UploadCloud className="h-4 w-4 text-amber-400" />
                <span>Bulk Upload Logo</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 rounded-xl bg-[#C9A227] px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Klien</span>
              </button>
            </div>
          </div>

          {/* Search & Counter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-[#111A2D] p-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama klien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-400 px-1">
              Total <span className="font-semibold text-white">{clients.length}</span> klien (
              <span className="text-emerald-400 font-semibold">{clients.filter((c) => c.is_active).length} aktif</span> di marquee)
            </div>
          </div>

          {/* Clients List Table */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111A2D]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/80 font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Logo Klien</th>
                    <th className="px-4 py-3">Nama Klien / Instansi</th>
                    <th className="px-4 py-3">Urutan Marquee</th>
                    <th className="px-4 py-3">Status Tampil</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Memuat data klien dari Supabase...
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        {searchTerm ? 'Tidak ada klien yang cocok dengan pencarian.' : 'Belum ada data klien. Klik "Tambah Klien" atau "Import Klien Awal".'}
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Logo Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="flex h-12 w-20 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 p-1.5 overflow-hidden">
                            {client.logo_url ? (
                              <img
                                src={client.logo_url}
                                alt={client.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                <ImageIcon className="h-3 w-3 text-slate-600" />
                                <span>Teks</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <span className="font-bold text-white text-sm block">
                            {client.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {client.logo_url ? 'Logo Image' : 'Ditampilkan sebagai Badge Teks'}
                          </span>
                        </td>

                        {/* Sort Order */}
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={client.sort_order ?? 0}
                            onChange={(e) =>
                              handleUpdateSortOrder(client, parseInt(e.target.value) || 0)
                            }
                            className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-center font-mono text-xs text-white focus:border-amber-400 focus:outline-none"
                          />
                        </td>

                        {/* Status Toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(client)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              client.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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
