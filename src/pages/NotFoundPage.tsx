import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/site';
import { ArrowLeft, PackageSearch } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Halaman Tidak Ditemukan – {SITE_CONFIG.name}</title>
      </Helmet>

      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-amber-400">
          <PackageSearch className="h-8 w-8" />
        </div>
        <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-amber-400">
          404 Error
        </span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-white">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-400">
          Halaman yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat URL salah.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link
            to="/katalog"
            className="inline-flex items-center gap-2 rounded-xl bg-[#C9A227] px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Katalog Produk</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-200 hover:text-white"
          >
            Beranda
          </Link>
        </div>
      </div>
    </>
  );
};
