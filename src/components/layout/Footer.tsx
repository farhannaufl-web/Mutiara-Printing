import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';
import { handleWhatsAppClick } from '../../lib/whatsapp';
import { MapPin, Clock, MessageCircle, Instagram, ShieldCheck, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#070B14] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 text-white group" title="Mutiara Printing & Promotion">
              <img
                src="/assets/aistudio/Logo_45caa060.png"
                alt="Logo Mutiara Printing"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <img
                src="/assets/aistudio/Tulisan_a6e36dee.png"
                alt="Mutiara Printing & Promotion"
                className="h-6 w-auto object-contain"
              />
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              {SITE_CONFIG.shortDescription}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-amber-400/90">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Workshop Resmi di Blok M Square Jakarta</span>
            </div>
          </div>

          {/* Col 2: Kategori Populer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Kategori Produk
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              {SITE_CONFIG.categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/katalog?kategori=${cat.slug}`}
                    className="transition-colors hover:text-amber-400"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Workshop & Jam Operasional */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Lokasi & Jam Kerja
            </h4>
            <div className="mt-4 space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{SITE_CONFIG.location.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{SITE_CONFIG.location.hours}</span>
              </div>
              <div className="pt-1">
                <a
                  href={SITE_CONFIG.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-medium text-amber-400 hover:text-amber-300 underline"
                >
                  Buka Petunjuk Arah di Google Maps &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Kontak Cepat & WhatsApp */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Pemesanan Cepat
            </h4>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed">
              Kirimkan referensi desain atau logo Anda langsung ke admin workshop kami:
            </p>
            <div className="mt-3 space-y-2">
              <button
                onClick={(e) => handleWhatsAppClick({ source: 'footer' }, e)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A227] px-3.5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                <MessageCircle className="h-4 w-4 fill-slate-950" />
                <span>WhatsApp: {SITE_CONFIG.whatsapp.displayNumber}</span>
              </button>

              <a
                href={SITE_CONFIG.social.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:text-white"
              >
                <Instagram className="h-4 w-4 text-pink-400" />
                <span>@{SITE_CONFIG.social.instagram}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link to="/katalog" className="hover:text-slate-400 transition-colors">Katalog Lengkap</Link>
            <Link to="/kontak" className="hover:text-slate-400 transition-colors">Kontak</Link>
            <Link to="/admin" className="hover:text-slate-400 text-slate-600 transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
