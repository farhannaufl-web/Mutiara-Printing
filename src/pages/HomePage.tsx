import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/site';
import { fetchProducts } from '../lib/supabase';
import { handleWhatsAppClick } from '../lib/whatsapp';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { CatalogSkeletonGrid } from '../components/common/LoadingSkeleton';
import { ClientLogosMarquee } from '../components/common/ClientLogosMarquee';

import {
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  MapPin,
  ExternalLink,
  Clock,
  Layers,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        setLoading(true);
        const { data } = await fetchProducts({ featuredOnly: true, limit: 6 });
        if (isMounted) {
          setFeaturedProducts(data);
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>{SITE_CONFIG.name} – Jasa Custom Plakat, Trophy & Medali Jakarta</title>
        <meta
          name="description"
          content="Pengrajin custom plakat resin, akrilik, timah/logam, trophy kristal, dan medali kejuaraan di Blok M Square Jakarta Selatan. Pengerjaan cepat, free preview desain, dan hasil presisi."
        />
        <meta property="og:title" content={`${SITE_CONFIG.name} – Jasa Custom Plakat & Trophy Jakarta`} />
        <meta property="og:description" content={SITE_CONFIG.shortDescription} />
        <meta property="og:image" content="/src/assets/images/hero_trophy_showcase_1793424612733.jpg" />
      </Helmet>

      <div className="flex flex-col">
        {/* ======================================================== */}
        {/* 1. HERO SECTION                                         */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-[#0B1120] py-16 sm:py-24 lg:py-28">
          {/* Subtle warm glow background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
              
              {/* Left Column: Headlines & Call to Actions */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Workshop Pengrajin Langsung · Blok M Square</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] text-balance">
                  Jasa Custom <span className="gold-gradient-text">Plakat, Trophy & Medali</span> Berkualitas di Jakarta
                </h1>

                <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed mx-auto lg:mx-0">
                  Wujudkan penghargaan istimewa untuk event perusahaan, kelulusan, dan kompetisi.
                  Dikerjakan dengan ketelitian mesin laser CNC &amp; finishing tangan berpengalaman.
                </p>

                {/* Primary Dual Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={(e) => handleWhatsAppClick({ source: 'home_hero' }, e)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#C9A227] to-amber-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-900/30 transition-all hover:bg-amber-400 active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4 fill-slate-950" />
                    <span>Chat WhatsApp Workshop</span>
                  </button>

                  <Link
                    to="/katalog"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-100 transition-colors hover:border-amber-400/50 hover:bg-slate-700 hover:text-white"
                  >
                    <span>Lihat Katalog Produk</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Micro reassurance badges */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Bisa Pesan Mulai 1 Pcs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Free Preview Mockup Desain
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Kirim Seluruh Indonesia
                  </span>
                </div>
              </div>

              {/* Right Column: Hero Visual Showcase */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative glow frame */}
                  <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-[#121B2E] shadow-2xl shadow-black/80">
                    <div className="aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden">
                      <img
                        src="/src/assets/images/hero_trophy_showcase_1793424612733.jpg"
                        alt="Koleksi Trophy dan Plakat Eksklusif Mutiara Printing"
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                    <div className="p-4 sm:p-5 bg-gradient-to-t from-[#0C1424] to-[#121B2E] border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-serif font-bold text-slate-200">
                          Koleksi Plakat &amp; Award Presisi
                        </span>
                        <span className="text-amber-400 font-medium">Bahan Premium Grade A</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Resin kristal bening, akrilik bevel potongan laser, dan kuningan sepuh emas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. TRUST STRIP                                          */}
        {/* ======================================================== */}
        <section className="border-b border-slate-800 bg-[#0E1626] py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SITE_CONFIG.trustPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 border-l-2 border-amber-500/40 pl-4 py-1"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2.5. CLIENT LOGOS AUTO-LOOP MARQUEE                      */}
        {/* ======================================================== */}
        <ClientLogosMarquee />

        {/* ======================================================== */}
        {/* 3. CATEGORIES SECTION                                   */}
        {/* ======================================================== */}
        <section className="py-16 sm:py-20 bg-[#0B1120]">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Pilihan Material
                </p>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
                  Kategori Plakat &amp; Cenderamata
                </h2>
              </div>
              <Link
                to="/katalog"
                className="mt-4 md:mt-0 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Lihat Semua Kategori &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SITE_CONFIG.categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/katalog?kategori=${cat.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-[#121B2D] p-6 transition-all duration-300 hover:border-amber-500/50 hover:bg-[#162238] hover:shadow-xl hover:shadow-black/30"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-400/20 group-hover:text-amber-300 transition-colors">
                        <Layers className="h-5 w-5" />
                      </div>
                      {cat.badgeText && (
                        <span className="text-[11px] font-medium text-amber-400">
                          {cat.badgeText}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-amber-400/90 group-hover:text-amber-300">
                    <span>Eksplor Model {cat.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. FEATURED PRODUCTS                                    */}
        {/* ======================================================== */}
        <section className="py-16 sm:py-20 bg-[#0E1627] border-y border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Portofolio Terpilih
                </p>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
                  Karya Plakat &amp; Trophy Unggulan
                </h2>
                <p className="mt-2 text-xs text-slate-400 max-w-xl">
                  Contoh hasil produksi pesanan klien korporat, BUMN, universitas, dan institusi.
                </p>
              </div>
              <Link
                to="/katalog"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/40 hover:text-white"
              >
                <span>Buka Katalog Lengkap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <CatalogSkeletonGrid count={3} />
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    sourceContext="home_featured_grid"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-[#121B2D] p-8 text-center text-slate-400 text-sm">
                Belum ada produk unggulan saat ini. Silakan kunjungi halaman katalog.
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. CARA ORDER (4-STEP PROCESS)                           */}
        {/* ======================================================== */}
        <section id="cara-order" className="py-16 sm:py-20 bg-[#0B1120]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Alur Pemesanan Simpel
              </p>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
                4 Langkah Mudah Pesan Plakat Custom
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Dari konsultasi konsep hingga barang jadi siap dikirim ke tempat Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SITE_CONFIG.orderSteps.map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-xl border border-slate-800 bg-[#111A2B] p-6 transition-all hover:border-slate-700"
                >
                  <span className="font-serif text-3xl font-bold text-amber-400/80">
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-serif text-base font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick CTA under process */}
            <div className="mt-10 rounded-xl border border-amber-500/20 bg-gradient-to-r from-[#121B2E] via-[#16233B] to-[#121B2E] p-6 text-center">
              <h3 className="font-serif text-lg font-bold text-white">
                Punya Konsep atau Sketsa Kasar?
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                Konsultasikan langsung dengan desainer workshop kami secara gratis tanpa komitmen.
              </p>
              <button
                onClick={(e) =>
                  handleWhatsAppClick(
                    {
                      source: 'home_order_process_cta',
                      customMessage:
                        'Halo Mutiara Printing, saya mau konsultasi konsep plakat custom yang ingin saya buat.',
                    },
                    e
                  )
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#C9A227] px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                <MessageCircle className="h-4 w-4 fill-slate-950" />
                <span>Konsultasi Konsep Sekarang</span>
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. MENGAPA MEMILIH KAMI (WHY CHOOSE US)                 */}
        {/* ======================================================== */}
        <section className="py-16 sm:py-20 bg-[#0E1626] border-y border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Standar Kualitas
              </p>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
                Mengapa Mempercayakan Kepada Mutiara Printing?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SITE_CONFIG.whyChooseUs.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/80 bg-[#121A2A] p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-4">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 7. FAQ ACCORDION                                         */}
        {/* ======================================================== */}
        <section className="py-16 sm:py-20 bg-[#0B1120]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Informasi &amp; Tanya Jawab
              </p>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h2>
            </div>

            <div className="space-y-3">
              {SITE_CONFIG.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-slate-800 bg-[#111A2B] transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-slate-200 transition-colors hover:text-white"
                    >
                      <span className="font-serif text-base">{faq.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-amber-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-800/80 px-5 pt-3 pb-5 text-xs text-slate-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 8. WORKSHOP LOCATION & GOOGLE MAPS SECTION               */}
        {/* ======================================================== */}
        <section className="py-16 sm:py-20 bg-[#0E1627] border-t border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              
              {/* Left Column: Workshop Information */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Kunjungi Workshop Fisik
                  </p>
                  <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
                    Lokasi Kami di Blok M Square
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Ingin melihat sampel bahan plakat, akrilik, dan contoh medali secara langsung?
                    Silakan berkunjung langsung ke workshop kami.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#121A2A] p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">Alamat Lengkap</p>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {SITE_CONFIG.location.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Jam Buka Toko</p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {SITE_CONFIG.location.hours}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={SITE_CONFIG.location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 text-xs font-bold text-slate-100 transition-colors hover:border-amber-400/50 hover:bg-slate-700"
                  >
                    <span>Buka di Google Maps</span>
                    <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                  </a>

                  <button
                    onClick={(e) =>
                      handleWhatsAppClick(
                        {
                          source: 'home_location_section',
                          customMessage:
                            'Halo Mutiara Printing, saya mau tanya ancer-ancer lokasi toko di Blok M Square Basement Blok D No 8.',
                        },
                        e
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A227] px-5 py-3 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
                  >
                    <MessageCircle className="h-4 w-4 fill-slate-950" />
                    <span>Tanya Ancer-Ancer via WA</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Google Maps Iframe */}
              <div className="lg:col-span-7">
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                  <div className="aspect-[16/10] sm:aspect-[16/9] w-full">
                    <iframe
                      title="Lokasi Mutiara Printing Blok M Square"
                      src={SITE_CONFIG.location.mapsEmbedUrl}
                      className="h-full w-full border-0 filter contrast-[0.95] saturate-[0.9]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
};
