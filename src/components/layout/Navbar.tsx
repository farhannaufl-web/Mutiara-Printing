import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';
import { handleWhatsAppClick } from '../../lib/whatsapp';
import { MessageCircle, Menu, X, Award, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Katalog Produk', path: '/katalog' },
    { label: 'Cara Order', path: '/#cara-order' },
    { label: 'Tentang & Workshop', path: '/kontak' },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return false;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B1120]/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-[#C9A227] to-amber-700 text-slate-950 shadow-md">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              {SITE_CONFIG.name}
            </span>
          </div>
        </Link>

        {/* Zone 2: 4-5 single-line clean text links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-400 ${
                isActive(link.path)
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={(e) => handleWhatsAppClick({ source: 'navbar' }, e)}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#C9A227] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 shadow-sm transition-all hover:bg-amber-400 active:scale-98 whitespace-nowrap shrink-0"
          >
            <MessageCircle className="h-4 w-4 fill-slate-950" />
            <span>Chat WhatsApp</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0E1626] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleWhatsAppClick({ source: 'navbar_mobile_drawer' }, e);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A227] px-4 py-3 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-400"
            >
              <MessageCircle className="h-4 w-4 fill-slate-950" />
              <span>Konsultasi Cepat via WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
