import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/site';
import { fetchProductBySlug, fetchProducts } from '../lib/supabase';
import { handleWhatsAppClick } from '../lib/whatsapp';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import {
  MessageCircle,
  Share2,
  ShieldCheck,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Ruler,
  Layers,
  ArrowLeft,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      if (!slug) return;
      try {
        setLoading(true);
        const { data } = await fetchProductBySlug(slug);
        if (isMounted) {
          setProduct(data);
          setActiveImageIndex(0);

          if (data) {
            // Load related products in the same category
            const relRes = await fetchProducts({
              category: data.category,
              limit: 4,
            });
            if (isMounted) {
              setRelatedProducts(relRes.data.filter((p) => p.id !== data.id));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.title || SITE_CONFIG.name,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      // Ignore share cancellation
    }
  };

  const images = product?.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : ['/src/assets/images/hero_trophy_showcase_1793424612733.jpg'];

  const currentImage = images[activeImageIndex] || images[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 aspect-[4/3] rounded-2xl bg-slate-800" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="h-8 w-3/4 bg-slate-700 rounded" />
              <div className="h-20 w-full bg-slate-800 rounded" />
              <div className="h-12 w-full bg-slate-700 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0B1120] py-20 text-center">
        <div className="mx-auto max-w-md px-4">
          <h2 className="font-serif text-2xl font-bold text-white">Produk Tidak Ditemukan</h2>
          <p className="mt-2 text-xs text-slate-400">
            Model plakat yang Anda cari mungkin telah dinonaktifkan atau tautan salah.
          </p>
          <Link
            to="/katalog"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C9A227] px-5 py-2.5 text-xs font-bold text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Katalog Produk</span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabel =
    product.category === 'resin'
      ? 'Plakat Resin'
      : product.category === 'akrilik'
      ? 'Plakat Akrilik'
      : product.category === 'timah'
      ? 'Plakat Timah & Logam'
      : product.category === 'kristal'
      ? 'Trophy Kristal'
      : product.category === 'medali'
      ? 'Medali Kejuaraan'
      : product.category;

  return (
    <>
      <Helmet>
        <title>{`${product.title} – ${SITE_CONFIG.name}`}</title>
        <meta name="description" content={product.description.substring(0, 155)} />
        <meta property="og:title" content={`${product.title} – ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={product.description.substring(0, 155)} />
        <meta property="og:image" content={images[0]} />
        <meta property="og:type" content="product" />
      </Helmet>

      <div className="min-h-screen bg-[#0B1120] pb-24">
        {/* Breadcrumb row */}
        <div className="border-b border-slate-800/80 bg-[#0E1626]/60 py-3">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 text-xs text-slate-400 sm:px-6 lg:px-8">
            <Link to="/" className="hover:text-amber-400">Beranda</Link>
            <span>/</span>
            <Link to="/katalog" className="hover:text-amber-400">Katalog</Link>
            <span>/</span>
            <Link to={`/katalog?kategori=${product.category}`} className="hover:text-amber-400 capitalize">
              {categoryLabel}
            </Link>
            <span>/</span>
            <span className="truncate text-slate-200 max-w-[200px]">{product.title}</span>
          </div>
        </div>

        {/* Product Details Section */}
        <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Primary Image Viewport */}
              <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#111A2C] shadow-xl">
                <img
                  src={currentImage}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Lightbox zoom trigger */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Lihat Foto Fullscreen"
                  className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur-md hover:bg-black/90 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {/* Image navigation arrows if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/90"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/90"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-amber-400 scale-105 shadow-md'
                          : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & WhatsApp CTA Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                
                {/* Clean unboxed category metadata with separator */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-medium">
                    <span className="capitalize">{categoryLabel}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400">Kode: {product.slug.substring(0, 12)}</span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Link Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Bagikan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Product Title */}
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  {product.title}
                </h1>

                {/* Primary CTA Box - Conversion Anchor for Ads Traffic */}
                <div className="rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#16233B] to-[#111A2D] p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Harga Custom &amp; Estimasi Pengerjaan
                    </span>
                    <span className="text-slate-400">Pengerjaan 2-5 Hari</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Harga bervariasi sesuai kuantiti, ukuran, dan tingkat detail grafir/logam. Tap tombol di bawah untuk meminta penawaran harga resmi:
                  </p>

                  <button
                    onClick={(e) =>
                      handleWhatsAppClick(
                        {
                          productId: product.id,
                          productTitle: product.title,
                          categoryName: categoryLabel,
                          source: 'product_detail',
                        },
                        e
                      )
                    }
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#C9A227] to-amber-600 py-3.5 px-4 text-sm font-bold text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-98"
                  >
                    <MessageCircle className="h-5 w-5 fill-slate-950" />
                    <span>Pesan / Tanya via WhatsApp</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    Otomatis menyertakan nama produk &amp; link spesifikasi ini
                  </p>
                </div>

                {/* Product Description */}
                <div className="space-y-2 pt-2">
                  <h3 className="font-serif text-sm font-bold text-white">Deskripsi Produk</h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div className="rounded-xl border border-slate-800 bg-[#121B2D] p-4 space-y-3">
                  <h3 className="font-serif text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Spesifikasi &amp; Detail Teknis
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Layers className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Material Bahan: </span>
                        <span className="font-medium text-slate-200">{product.material || '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Ruler className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Ukuran Standar: </span>
                        <span className="font-medium text-slate-200">{product.size_info || 'Bisa custom sesuai permintaan'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Package className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Minimal Order: </span>
                        <span className="font-medium text-slate-200">{product.min_order || '1 pcs'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Guarantees */}
                <div className="rounded-xl border border-slate-800/80 bg-[#0E1626] p-3.5 flex items-center gap-3 text-xs text-slate-300">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-amber-400" />
                  <span>
                    Dapatkan <strong>Free Mockup Preview</strong> sebelum produksi dimulai. Bisa cek sampel langsung di Blok M Square.
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 border-t border-slate-800 pt-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Rekomendasi Terkait
                  </p>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    Model Lainnya di Kategori {categoryLabel}
                  </h2>
                </div>
                <Link
                  to={`/katalog?kategori=${product.category}`}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.slice(0, 3).map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    sourceContext="product_detail_related"
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Fullscreen Lightbox Modal */}
        {lightboxOpen && (
          <div
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Tutup foto"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700"
            >
              <X className="h-6 w-6" />
            </button>

            <img
              src={currentImage}
              alt={product.title}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}
      </div>
    </>
  );
};
