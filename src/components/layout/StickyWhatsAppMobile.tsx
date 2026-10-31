import React from 'react';
import { handleWhatsAppClick } from '../../lib/whatsapp';
import { SITE_CONFIG } from '../../config/site';
import { MessageCircle } from 'lucide-react';

export const StickyWhatsAppMobile: React.FC = () => {
  return (
    <>
      {/* 1. Mobile Full-Width Sticky Bottom Bar (Only visible on screens < md) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-amber-500/20 bg-[#0B1120]/95 p-2.5 backdrop-blur-lg md:hidden">
        <button
          onClick={(e) => handleWhatsAppClick({ source: 'mobile_sticky_bar' }, e)}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#C9A227] to-amber-600 px-4 font-semibold text-slate-950 shadow-lg shadow-amber-900/30 active:scale-[0.99] transition-transform"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-amber-400">
            <MessageCircle className="h-4 w-4 fill-amber-400" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            Chat WhatsApp Workshop Sekarang
          </span>
        </button>
      </div>

      {/* 2. Desktop Floating Button (Bottom-Right, only visible on md+) */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={(e) => handleWhatsAppClick({ source: 'desktop_floating' }, e)}
          aria-label="Hubungi WhatsApp Mutiara Printing"
          className="group flex items-center gap-3 rounded-full bg-slate-900 border border-amber-500/40 p-2 pl-4 text-white shadow-xl shadow-black/50 transition-all duration-200 hover:border-amber-400 hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              Online 10.00 - 20.00
            </span>
            <span className="text-xs font-bold text-slate-100">
              Konsultasi WhatsApp
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C9A227] text-slate-950 shadow-inner group-hover:bg-amber-400">
            <MessageCircle className="h-6 w-6 fill-slate-950 text-slate-950" />
          </div>
        </button>
      </div>
    </>
  );
};
