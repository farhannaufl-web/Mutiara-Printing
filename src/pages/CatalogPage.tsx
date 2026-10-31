import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/site';
import { fetchProducts } from '../lib/supabase';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { CatalogSkeletonGrid } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Search, X, Sparkles } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('kategori') || 'all';
  const currentSearch = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [visibleCount, setVisibleCount] = useState(12);

  // Load products
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProducts({
        category: currentCategory === 'all' ? undefined : currentCategory,
        search: currentSearch || undefined,
        limit: 100,
      });
      setProducts(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat katalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setVisibleCount(12);
  }, [currentCategory, currentSearch]);

  const handleCategorySelect = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      nextParams.delete('kategori');
    } else {
      nextParams.set('kategori', slug);
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      nextParams.set('q', searchTerm.trim());
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
  };

  const clearSearch = () => {
    setSearchTerm('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('q');
    setSearchParams(nextParams);
  };

  const displayedProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const hasMore = visibleCount < products.length;

  return (
    <>
      <Helmet>
        <title>Katalog Plakat, Trophy & Medali Custom – {SITE_CONFIG.name}</title>
        <meta
          name="description"
          content="Jelajahi portofolio lengkap plakat resin kristal, plakat akrilik laser, trophy piala, dan medali logam berkualitas di Mutiara Printing Jakarta."
        />
        <meta property="og:title" content={`Katalog Plakat & Trophy – ${SITE_CONFIG.name}`} />
        <meta property="og:description" content="Pilihan ragam material plakat & trophy custom berkualitas dari workshop Mutiara Printing." />
      </Helmet>

      <div className="min-h-screen bg-[#0B1120] pb-24">
        {/* Header Banner */}
        <section className="border-b border-slate-800 bg-[#0E1626] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Portofolio &amp; Desain Pilihan</span>
              </div>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Katalog Plakat &amp; Trophy Custom
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pilih model yang Anda minati untuk menanyakan estimasi harga dan jadwal pengerjaan langsung ke WhatsApp workshop kami.
              </p>
            </div>
          </div>
        </section>

        {/* Sticky Filters & Search Control Bar */}
        <div className="sticky top-18 z-30 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-md py-3 shadow-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Category Segmented Control / Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentCategory === 'all'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white bg-slate-800/80'
                  }`}
                >
                  Semua Produk ({products.length})
                </button>

                {SITE_CONFIG.categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      currentCategory === cat.slug
                        ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white bg-slate-800/80'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] max-w-sm">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari model plakat, bahan..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-1.5 pl-8 pr-8 text-xs text-slate-100 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

            </div>
          </div>
        </div>

        {/* Catalog Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          {loading ? (
            <CatalogSkeletonGrid count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : products.length === 0 ? (
            <EmptyState
              title="Tidak ada produk yang cocok"
              description="Tidak ditemukan produk untuk kriteria filter atau kata kunci saat ini."
              onReset={() => {
                setSearchTerm('');
                setSearchParams({});
              }}
              resetLabel="Lihat Semua Produk"
            />
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    sourceContext="catalog_card"
                  />
                ))}
              </div>

              {/* "Muat Lebih Banyak" / Pagination */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 9)}
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-xs font-bold text-slate-200 transition-colors hover:border-amber-400/50 hover:bg-slate-700 hover:text-white"
                  >
                    Muat Lebih Banyak ({products.length - visibleCount} tersisa)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};
