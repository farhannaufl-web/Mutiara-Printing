import React, { useEffect, useState } from 'react';
import { fetchClients } from '../../lib/supabase';
import { Client } from '../../types';

// Helper to render authentic corporate logo mark if no custom logo_url is uploaded yet
const renderClientLogoMark = (client: Client) => {
  // 1. Custom image uploaded in Supabase or Admin
  if (client.logo_url) {
    return (
      <img
        src={client.logo_url}
        alt={client.name}
        loading="lazy"
        className="h-8 sm:h-9 w-auto max-w-[140px] object-contain grayscale opacity-80 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-105"
      />
    );
  }

  const nameLower = client.name.toLowerCase();

  // 2. PERTAMINA Authentic Vector Logo
  if (nameLower.includes('pertamina')) {
    return (
      <div className="flex items-center gap-2.5 px-1 grayscale opacity-80 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100">
        <svg className="h-6 w-7 shrink-0" viewBox="0 0 38 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blue bottom rhomboid */}
          <path d="M6 31L18 31L25 18L13 18L6 31Z" fill="#0284C7" />
          {/* Green top-left curved rhomboid */}
          <path d="M14 16L26 16L32 3L20 3L14 16Z" fill="#16A34A" />
          {/* Red diamond accent */}
          <path d="M26 31L36 31L33 24L23 24L26 31Z" fill="#DC2626" />
        </svg>
        <span className="font-sans text-sm font-black tracking-wider text-white uppercase leading-none">
          PERTAMINA
        </span>
      </div>
    );
  }

  // 3. PNM (Permodalan Nasional Madani) Authentic Vector Logo
  if (nameLower.includes('pnm')) {
    return (
      <div className="flex items-center gap-2.5 px-1 grayscale opacity-80 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100">
        <svg className="h-7 w-7 shrink-0" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
          <path d="M12 24C12 18 18 12 24 12C24 18 18 24 12 24Z" fill="#34D399" />
          <path d="M14 22C14 17 19 14 22 14" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col text-left">
          <span className="font-sans text-base font-black tracking-tight text-white leading-none">
            PNM
          </span>
          <span className="text-[7px] font-semibold tracking-tight text-emerald-400 uppercase mt-0.5">
            Permodalan Nasional Madani
          </span>
        </div>
      </div>
    );
  }

  // 4. INFOBANK Authentic Vector Logo
  if (nameLower.includes('infobank')) {
    return (
      <div className="flex items-center gap-2 px-1 grayscale opacity-80 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xs shadow-sm">
          iB
        </div>
        <div className="flex flex-col text-left">
          <span className="font-sans text-sm font-extrabold tracking-tight text-white leading-none">
            info<span className="text-red-500">bank</span>
          </span>
          <span className="text-[7.5px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
            Media &amp; Riset
          </span>
        </div>
      </div>
    );
  }

  // 5. Default Styled Corporate Badge
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="h-2 w-2 rounded-full bg-amber-400/80 group-hover:scale-125 transition-transform" />
      <span className="font-sans text-xs sm:text-sm font-bold tracking-wider text-slate-300 transition-colors group-hover:text-amber-300 uppercase">
        {client.name}
      </span>
    </div>
  );
};

export const ClientLogosMarquee: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadClients() {
      try {
        setLoading(true);
        const data = await fetchClients(false); // Only active clients
        if (isMounted) {
          setClients(data || []);
        }
      } catch (err) {
        console.error('Failed to load active clients for marquee', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadClients();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Loading Skeleton state
  if (loading) {
    return (
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-[#090F1C] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4 text-center">
          <div className="mx-auto h-3 w-44 rounded bg-slate-800 animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-6 overflow-hidden px-4 opacity-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-32 shrink-0 rounded-xl bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  // 2. Hide entire section if no client data exists
  if (!loading && clients.length === 0) {
    return null;
  }

  // To create a seamless, non-breaking continuous loop across wide monitors,
  // replicate items so the track has generous length
  const repeatCount = Math.max(4, Math.ceil(12 / clients.length));
  const loopItems: Client[] = Array.from({ length: repeatCount }).flatMap(() => clients);

  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-[#090F1C] py-10">
      {/* Decorative gradient masks for smooth fade edge effect */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28 bg-gradient-to-r from-[#090F1C] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28 bg-gradient-to-l from-[#090F1C] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
          Klien &amp; Instansi yang Telah Bekerja Sama
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Dipercaya oleh korporasi, BUMN, perbankan, dan institusi nasional
        </p>
      </div>

      {/* Infinite scrolling track */}
      <div className="flex w-full overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-8 sm:gap-12 py-2">
          {loopItems.map((client, index) => (
            <div
              key={`${client.id}-${index}`}
              className="group flex items-center justify-center shrink-0 rounded-xl border border-slate-800/80 bg-[#0E1626]/80 px-6 py-3.5 shadow-sm transition-all duration-300 hover:border-amber-500/40 hover:bg-[#131E33] hover:scale-105 cursor-default"
            >
              {renderClientLogoMark(client)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
