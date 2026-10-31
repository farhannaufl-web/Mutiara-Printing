import React, { useEffect, useState } from 'react';
import { fetchClients, DEFAULT_CLIENTS } from '../../lib/supabase';
import { ClientLogo } from '../../types';

// Crisp, vector SVG brand marks for default well-known clients
const renderBrandLogo = (client: ClientLogo) => {
  // If user uploaded a custom logo image URL in Supabase
  if (client.logo_url) {
    return (
      <img
        src={client.logo_url}
        alt={client.name}
        className="h-9 w-auto max-w-[140px] object-contain opacity-85 transition-opacity hover:opacity-100"
        loading="lazy"
      />
    );
  }

  const normalized = client.name.toLowerCase();

  // 1. INFOBANK
  if (normalized.includes('infobank')) {
    return (
      <div className="flex items-center gap-2 px-1">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xs shadow-sm">
          iB
        </div>
        <div className="flex flex-col text-left">
          <span className="font-sans text-base font-extrabold tracking-tight text-white leading-none">
            info<span className="text-red-500">bank</span>
          </span>
          <span className="text-[8px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
            Media &amp; Research
          </span>
        </div>
      </div>
    );
  }

  // 2. PNM (Permodalan Nasional Madani)
  if (normalized.includes('pnm')) {
    return (
      <div className="flex items-center gap-2.5 px-1">
        <svg className="h-7 w-7 shrink-0" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
          <path d="M12 24C12 18 18 12 24 12C24 18 18 24 12 24Z" fill="#34D399" />
          <path d="M14 22C14 17 19 14 22 14" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col text-left">
          <span className="font-sans text-lg font-black tracking-tight text-white leading-none">
            PNM
          </span>
          <span className="text-[7.5px] font-medium tracking-tight text-emerald-400/90 uppercase mt-0.5">
            Permodalan Nasional Madani
          </span>
        </div>
      </div>
    );
  }

  // 3. PERTAMINA
  if (normalized.includes('pertamina')) {
    return (
      <div className="flex items-center gap-2.5 px-1">
        <svg className="h-6 w-7 shrink-0" viewBox="0 0 38 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blue rhomboid */}
          <path d="M6 31L18 31L25 18L13 18L6 31Z" fill="#0284C7" />
          {/* Green curved diamond */}
          <path d="M14 16L26 16L32 3L20 3L14 16Z" fill="#16A34A" />
          {/* Red diamond accent */}
          <path d="M26 31L36 31L33 24L23 24L26 31Z" fill="#DC2626" />
        </svg>
        <div className="flex flex-col text-left">
          <span className="font-sans text-sm font-black tracking-wider text-white leading-none uppercase">
            PERTAMINA
          </span>
        </div>
      </div>
    );
  }

  // 4. BANK MANDIRI
  if (normalized.includes('mandiri')) {
    return (
      <div className="flex items-center gap-2 px-1">
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16C10 6 22 6 28 16C22 12 10 12 4 16Z" fill="#F59E0B" />
          <path d="M6 19C12 11 20 11 26 19C20 16 12 16 6 19Z" fill="#D97706" />
        </svg>
        <div className="flex flex-col text-left">
          <span className="font-sans text-sm font-bold tracking-tight text-white leading-none lowercase">
            bank <span className="font-extrabold text-amber-400">mandiri</span>
          </span>
        </div>
      </div>
    );
  }

  // 5. BNI
  if (normalized.includes('bni')) {
    return (
      <div className="flex items-center gap-2 px-1">
        <div className="flex h-6 w-2 bg-gradient-to-b from-orange-500 to-amber-600 rounded-sm" />
        <span className="font-sans text-base font-black tracking-tight text-white leading-none">
          BNI
        </span>
      </div>
    );
  }

  // 6. TELKOM INDONESIA
  if (normalized.includes('telkom')) {
    return (
      <div className="flex items-center gap-2 px-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[10px]">
          T
        </div>
        <span className="font-sans text-xs font-bold tracking-tight text-white leading-none">
          Telkom Indonesia
        </span>
      </div>
    );
  }

  // Generic fallback for any additional client added in Supabase
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60">
      <span className="font-sans text-xs font-bold tracking-wide text-slate-200 uppercase">
        {client.name}
      </span>
    </div>
  );
};

export const ClientLogosMarquee: React.FC = () => {
  const [clients, setClients] = useState<ClientLogo[]>(DEFAULT_CLIENTS);

  useEffect(() => {
    let isMounted = true;
    fetchClients().then((data) => {
      if (isMounted && data && data.length > 0) {
        setClients(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Duplicate items array twice so the auto-loop translates smoothly without jumps
  const loopItems = [...clients, ...clients];

  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-[#090F1C] py-10">
      {/* Decorative gradient masks for smooth fade effect at edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28 bg-gradient-to-r from-[#090F1C] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28 bg-gradient-to-l from-[#090F1C] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
          Klien &amp; Instansi yang Telah Bekerja Sama
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Dipercaya oleh korporasi terkemuka, BUMN, perbankan, dan lembaga nasional
        </p>
      </div>

      {/* Infinite scrolling track */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee flex items-center gap-10 sm:gap-14 py-2">
          {loopItems.map((client, index) => (
            <div
              key={`${client.id}-${index}`}
              className="flex items-center justify-center shrink-0 rounded-xl border border-slate-800/70 bg-[#0E1626]/70 px-6 py-3 shadow-sm transition-all duration-300 hover:border-amber-500/40 hover:bg-[#131E33] hover:scale-105"
            >
              {renderBrandLogo(client)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
