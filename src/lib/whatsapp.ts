import { SITE_CONFIG } from '../config/site';
import { recordWAClickToDatabase } from './supabase';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export interface OpenWhatsAppOptions {
  productId?: string | null;
  productTitle?: string;
  categoryName?: string;
  source: 'home_hero' | 'product_card' | 'product_detail' | 'floating' | 'navbar' | 'contact_page' | 'footer' | string;
  customMessage?: string;
}

/**
 * Builds the WhatsApp direct chat link with pre-filled message
 */
export function buildWhatsAppUrl(options: OpenWhatsAppOptions): string {
  const number = SITE_CONFIG.whatsapp.number;
  let message = options.customMessage || SITE_CONFIG.whatsapp.defaultMessage;

  if (options.productTitle) {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const cat = options.categoryName || 'Custom';
    message = `Halo Mutiara Printing, saya tertarik dengan produk *${options.productTitle}* (${cat}). Link: ${currentUrl}. Bisa minta info harga & estimasi pengerjaan?`;
  }

  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Fires tracking analytics, records click to Supabase wa_clicks, and navigates to WhatsApp safely
 */
export function handleWhatsAppClick(options: OpenWhatsAppOptions, event?: React.MouseEvent): void {
  if (event) {
    event.stopPropagation();
  }

  // 1. Fire optional tracking hooks
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Contact');
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'whatsapp_click', {
          event_category: 'engagement',
          event_label: options.source,
          product_id: options.productId || 'general',
          product_name: options.productTitle || 'General Inquiry',
        });
      }
    }
  } catch (err) {
    console.debug('Analytics hook execution skipped:', err);
  }

  // 2. Record click to database (fire and forget, never blocks navigation)
  recordWAClickToDatabase({
    product_id: options.productId || null,
    source: options.source,
    created_at: new Date().toISOString(),
  }).catch(() => {});

  // 3. Open WhatsApp link (using safe anchor click instead of window.open to comply with iframe policies)
  const url = buildWhatsAppUrl(options);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
