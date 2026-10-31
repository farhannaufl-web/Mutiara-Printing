import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Product, WAClick, AdminStats, Client, ClientLogo } from '../types';
import { DEMO_PRODUCTS } from './demoData';

// -----------------------------------------------------------------------
// Supabase Environment Resolution & Detailed Diagnostics
// -----------------------------------------------------------------------

export interface SupabaseConfigDiagnostics {
  isConfigured: boolean;
  urlSource: 'VITE_SUPABASE_URL' | 'SUPABASE_URL' | 'none';
  keySource: 'VITE_SUPABASE_ANON_KEY' | 'SUPABASE_ANON_KEY' | 'none';
  resolvedUrl: string;
  maskedKey: string;
  triggersSandbox: boolean;
  sandboxReasons: string[];
}

function resolveSupabaseEnv(): {
  url: string;
  anonKey: string;
  diagnostics: SupabaseConfigDiagnostics;
} {
  const env = import.meta.env as Record<string, unknown>;

  // 1. Read URL (VITE_SUPABASE_URL prioritized, fallback to SUPABASE_URL)
  let url = '';
  let urlSource: 'VITE_SUPABASE_URL' | 'SUPABASE_URL' | 'none' = 'none';

  if (typeof env.VITE_SUPABASE_URL === 'string' && env.VITE_SUPABASE_URL.trim() !== '') {
    url = env.VITE_SUPABASE_URL.trim();
    urlSource = 'VITE_SUPABASE_URL';
  } else if (typeof env.SUPABASE_URL === 'string' && env.SUPABASE_URL.trim() !== '') {
    url = env.SUPABASE_URL.trim();
    urlSource = 'SUPABASE_URL';
  }

  // 2. Read Anon Key (VITE_SUPABASE_ANON_KEY prioritized, fallback to SUPABASE_ANON_KEY)
  let anonKey = '';
  let keySource: 'VITE_SUPABASE_ANON_KEY' | 'SUPABASE_ANON_KEY' | 'none' = 'none';

  if (typeof env.VITE_SUPABASE_ANON_KEY === 'string' && env.VITE_SUPABASE_ANON_KEY.trim() !== '') {
    anonKey = env.VITE_SUPABASE_ANON_KEY.trim();
    keySource = 'VITE_SUPABASE_ANON_KEY';
  } else if (typeof env.SUPABASE_ANON_KEY === 'string' && env.SUPABASE_ANON_KEY.trim() !== '') {
    anonKey = env.SUPABASE_ANON_KEY.trim();
    keySource = 'SUPABASE_ANON_KEY';
  }

  // 3. Evaluate exact conditions that trigger sandbox mode
  const sandboxReasons: string[] = [];

  if (!url) {
    sandboxReasons.push(
      'Variabel URL Supabase (VITE_SUPABASE_URL atau SUPABASE_URL) kosong atau tidak terdefinisi di environment.'
    );
  } else {
    const isHttp = url.startsWith('http://') || url.startsWith('https://');
    if (!isHttp) {
      sandboxReasons.push(
        `URL Supabase "${url}" tidak valid karena tidak diawali dengan "https://" (atau "http://" untuk lokal).`
      );
    }
    if (url.includes('placeholder') || url.includes('your-project-id')) {
      sandboxReasons.push(
        `URL Supabase "${url}" masih menggunakan nilai placeholder bawaan template.`
      );
    }
  }

  if (!anonKey) {
    sandboxReasons.push(
      'Variabel Anon Key (VITE_SUPABASE_ANON_KEY atau SUPABASE_ANON_KEY) kosong atau tidak terdefinisi di environment.'
    );
  } else if (anonKey.includes('placeholder') || anonKey.includes('your-anon-public-key')) {
    sandboxReasons.push(
      'Anon Key Supabase masih menggunakan nilai placeholder bawaan template.'
    );
  }

  const triggersSandbox = sandboxReasons.length > 0;
  const isConfigured = !triggersSandbox;

  const maskedKey = anonKey
    ? `${anonKey.substring(0, 6)}...${anonKey.substring(anonKey.length - 4)}`
    : '(kosong)';

  const diagnostics: SupabaseConfigDiagnostics = {
    isConfigured,
    urlSource,
    keySource,
    resolvedUrl: url || '(kosong)',
    maskedKey,
    triggersSandbox,
    sandboxReasons,
  };

  // 4. Console feedback: loud and clear error messaging, never silent!
  if (triggersSandbox) {
    console.error(
      `%c[Mutiara Printing - Supabase Config Error]%c\nKoneksi Supabase TIDAK aktif.\nAplikasi beralih ke 'Local Sandbox Mode' karena kondisi berikut:\n${sandboxReasons
        .map((r, i) => `  ${i + 1}. ${r}`)
        .join('\n')}\n\nCara Memperbaiki:\n1. Buka file .env dan pastikan:\n   VITE_SUPABASE_URL=https://[project-id].supabase.co\n   VITE_SUPABASE_ANON_KEY=[anon-public-key]\n2. Atau setel SUPABASE_URL & SUPABASE_ANON_KEY pada environment hosting Anda.\n3. Simpan dan restart dev server/rebuild agar terbaca.`,
      'background: #7f1d1d; color: #fecaca; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      'color: #f87171; font-weight: normal;'
    );
  } else {
    console.log(
      `%c[Supabase Connected]%c Menggunakan ${urlSource}: ${url} dan ${keySource}: ${maskedKey}`,
      'background: #064e3b; color: #a7f3d0; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #34d399;'
    );
  }

  return { url, anonKey, diagnostics };
}

const envResolution = resolveSupabaseEnv();

export const supabaseUrl = envResolution.url;
export const supabaseAnonKey = envResolution.anonKey;
export const isSupabaseConfigured = envResolution.diagnostics.isConfigured;
export const supabaseDiagnostics = envResolution.diagnostics;

// Initialize Supabase client
export const supabase = isSupabaseConfigured
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;



// Local storage fallback keys for seamless demo testing & local offline edits
const LOCAL_PRODUCTS_KEY = 'mutiara_local_products_v1';
const LOCAL_CLICKS_KEY = 'mutiara_local_wa_clicks_v1';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(DEMO_PRODUCTS));
      return DEMO_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_PRODUCTS;
  } catch {
    return DEMO_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

function getLocalClicks(): WAClick[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLICKS_KEY);
    if (!raw) {
      // Seed some realistic clicks for the admin dashboard view
      const demoClicks: WAClick[] = [
        { id: '1', product_id: 'demo-1', source: 'product_detail', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
        { id: '2', product_id: 'demo-1', source: 'home_hero', created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
        { id: '3', product_id: 'demo-2', source: 'product_card', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: '4', product_id: 'demo-3', source: 'product_detail', created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
        { id: '5', product_id: 'demo-2', source: 'product_card', created_at: new Date(Date.now() - 3600000 * 72).toISOString() },
        { id: '6', product_id: 'demo-4', source: 'floating', created_at: new Date(Date.now() - 3600000 * 96).toISOString() },
        { id: '7', product_id: 'demo-1', source: 'catalog_card', created_at: new Date(Date.now() - 3600000 * 120).toISOString() },
      ];
      localStorage.setItem(LOCAL_CLICKS_KEY, JSON.stringify(demoClicks));
      return demoClicks;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalClick(click: WAClick): void {
  try {
    const current = getLocalClicks();
    current.unshift(click);
    localStorage.setItem(LOCAL_CLICKS_KEY, JSON.stringify(current.slice(0, 500)));
  } catch (e) {
    console.error('Failed to save click', e);
  }
}

// -----------------------------------------------------------------------
// Data Service Methods
// -----------------------------------------------------------------------

export interface FetchProductsOptions {
  category?: string;
  featuredOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
}

export async function fetchProducts(options: FetchProductsOptions = {}): Promise<{
  data: Product[];
  total: number;
  isMock: boolean;
}> {
  const { category, featuredOnly, search, limit = 50, offset = 0, includeInactive = false } = options;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }
      if (search && search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      query = query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error) {
        console.warn('Supabase fetch error, using local fallback:', error.message);
        throw error;
      }
      if (data && data.length > 0) {
        return { data: data as Product[], total: count ?? data.length, isMock: false };
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // Local storage fallback
  let items = getLocalProducts();
  if (!includeInactive) {
    items = items.filter((p) => p.is_active);
  }
  if (category && category !== 'all') {
    items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (featuredOnly) {
    items = items.filter((p) => p.is_featured);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.material.toLowerCase().includes(s)
    );
  }

  items.sort((a, b) => a.sort_order - b.sort_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const total = items.length;
  const paginated = items.slice(offset, offset + limit);

  return { data: paginated, total, isMock: true };
}

export async function fetchProductBySlug(slug: string): Promise<{ data: Product | null; isMock: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return { data: data as Product, isMock: false };
      }
    } catch (e) {
      console.warn('Supabase slug fetch error, trying local:', e);
    }
  }

  const items = getLocalProducts();
  const found = items.find((p) => p.slug === slug) || null;
  return { data: found, isMock: true };
}

export async function createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const newProduct: Product = {
    ...productData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prod_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    } catch (e) {
      console.warn('Supabase create error, saving locally:', e);
    }
  }

  const items = getLocalProducts();
  items.unshift(newProduct);
  saveLocalProducts(items);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    } catch (e) {
      console.warn('Supabase update error, saving locally:', e);
    }
  }

  const items = getLocalProducts();
  const index = items.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Product not found');
  items[index] = { ...items[index], ...updates };
  saveLocalProducts(items);
  return items[index];
}

export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase delete error, deleting locally:', e);
    }
  }

  const items = getLocalProducts();
  const filtered = items.filter((p) => p.id !== id);
  saveLocalProducts(filtered);
}

// WhatsApp Click Recording (Fire-and-forget)
export async function recordWAClickToDatabase(click: WAClick): Promise<void> {
  try {
    saveLocalClick(click);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('wa_clicks').insert([
        {
          product_id: click.product_id || null,
          source: click.source,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  } catch (err) {
    // Non-blocking error handling
    console.warn('Silent WA click recording failure:', err);
  }
}

// Fetch Admin Stats
export async function fetchAdminStats(): Promise<AdminStats> {
  let products = getLocalProducts();
  let clicks = getLocalClicks();

  if (isSupabaseConfigured && supabase) {
    try {
      const [prodRes, clickRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('wa_clicks').select('*'),
      ]);
      if (prodRes.data) products = prodRes.data as Product[];
      if (clickRes.data) clicks = clickRes.data as WAClick[];
    } catch (e) {
      console.warn('Failed to load admin stats from Supabase, using local:', e);
    }
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86400000;
  const thirtyDaysAgo = now - 30 * 86400000;

  const clicksLast7Days = clicks.filter(
    (c) => c.created_at && new Date(c.created_at).getTime() >= sevenDaysAgo
  ).length;

  const clicksLast30Days = clicks.filter(
    (c) => c.created_at && new Date(c.created_at).getTime() >= thirtyDaysAgo
  ).length;

  // Product click distribution
  const clickMap: Record<string, number> = {};
  for (const c of clicks) {
    if (c.product_id) {
      clickMap[c.product_id] = (clickMap[c.product_id] || 0) + 1;
    }
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const sortedClickEntries = Object.entries(clickMap).sort((a, b) => b[1] - a[1]);

  const topProducts = sortedClickEntries.slice(0, 5).map(([productId, count]) => {
    const prod = productMap.get(productId) || null;
    return {
      productId,
      product: prod,
      productTitle: prod ? prod.title : 'Produk Umum / Terhapus',
      clickCount: count,
    };
  });

  return {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.is_active).length,
    hiddenProducts: products.filter((p) => !p.is_active).length,
    clicksLast7Days,
    clicksLast30Days,
    topProducts,
  };
}

// Image Compression Helper
export async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.82
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context unavailable'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Image compression failed'));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Upload image to Supabase Storage or return local Object URL
export async function uploadProductImage(file: File): Promise<string> {
  const compressedBlob = await compressImage(file, 1600, 0.82);

  if (isSupabaseConfigured && supabase) {
    try {
      const ext = 'webp';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (e) {
      console.warn('Supabase storage upload failed, using local DataURL:', e);
    }
  }

  // Convert to DataURL for offline/local storage preview
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(compressedBlob);
  });
}

// -----------------------------------------------------------------------
// Client Management Service (Table 'clients' & Storage 'product-images/clients/')
// -----------------------------------------------------------------------

const LOCAL_CLIENTS_KEY = 'mutiara_clients_data_v2';

export const INITIAL_CLIENT_SEEDS: Omit<Client, 'id' | 'created_at'>[] = [
  {
    name: 'Infobank',
    logo_url: null,
    sort_order: 1,
    is_active: true,
  },
  {
    name: 'PNM',
    logo_url: null,
    sort_order: 2,
    is_active: true,
  },
  {
    name: 'Pertamina',
    logo_url: null,
    sort_order: 3,
    is_active: true,
  },
];

function getLocalClients(): Client[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLIENTS_KEY);
    if (!raw) {
      const initial: Client[] = INITIAL_CLIENT_SEEDS.map((s, idx) => ({
        ...s,
        id: `client_seed_${idx + 1}`,
        created_at: new Date(Date.now() - idx * 3600000).toISOString(),
      }));
      localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalClients(clients: Client[]): void {
  try {
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients locally', e);
  }
}

/**
 * Fetch clients from Supabase table 'clients' (with fallback to Infobank, PNM, Pertamina default seed)
 */
export async function fetchClients(includeInactive = false): Promise<Client[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Client[];
      }
    } catch {
      // Fall through to local fallback if offline or table not ready
    }
  }

  let items = getLocalClients();
  if (items.length === 0) {
    items = INITIAL_CLIENT_SEEDS.map((s, idx) => ({
      ...s,
      id: `client_seed_${idx + 1}`,
      created_at: new Date(Date.now() - idx * 3600000).toISOString(),
    }));
  }

  if (!includeInactive) {
    items = items.filter((c) => c.is_active);
  }
  items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return items;
}


/**
 * Client-side image compression preserving transparency (PNG/WebP, max width 600px)
 */
export async function compressLogoImage(
  file: File,
  maxWidth = 600,
  quality = 0.88
): Promise<{ blob: Blob; mimeType: string; extension: string }> {
  return new Promise((resolve, reject) => {
    // If SVG vector, preserve directly
    if (file.type === 'image/svg+xml') {
      return resolve({ blob: file, mimeType: 'image/svg+xml', extension: 'svg' });
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));

        // Clear transparent canvas for transparency preservation
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first; if transparent, WebP supports alpha. Fallback to image/png
        const targetFormat = file.type === 'image/png' ? 'image/png' : 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                mimeType: targetFormat,
                extension: targetFormat === 'image/png' ? 'png' : 'webp',
              });
            } else {
              canvas.toBlob(
                (fallbackBlob) => {
                  if (fallbackBlob) {
                    resolve({ blob: fallbackBlob, mimeType: 'image/png', extension: 'png' });
                  } else {
                    reject(new Error('Gagal mengompresi logo'));
                  }
                },
                'image/png'
              );
            }
          },
          targetFormat,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Upload logo file to Supabase Storage bucket 'product-images' under 'clients/{timestamp}-{filename}'
 */
export async function uploadClientLogo(file: File): Promise<string> {
  const { blob, mimeType, extension } = await compressLogoImage(file, 600, 0.88);
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filePath = `clients/${Date.now()}-${cleanBaseName}.${extension}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (e) {
      console.warn('Supabase client logo upload error, saving local data URL:', e);
    }
  }

  // Fallback to Data URL in sandbox/demo
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/**
 * Extracts relative storage file path from public Supabase URL
 */
export function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const marker = '/product-images/';
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(url.substring(idx + marker.length));
    }
    if (url.startsWith('clients/')) {
      return url;
    }
  } catch {}
  return null;
}

/**
 * Create a new client entry
 */
export async function createClient(
  clientData: Omit<Client, 'id' | 'created_at'>
): Promise<Client> {
  const newClient: Client = {
    ...clientData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            name: clientData.name,
            logo_url: clientData.logo_url || null,
            sort_order: clientData.sort_order ?? 0,
            is_active: clientData.is_active ?? true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    } catch (e) {
      console.warn('Supabase createClient error, saving locally:', e);
    }
  }

  const items = getLocalClients();
  items.push(newClient);
  saveLocalClients(items);
  return newClient;
}

/**
 * Update an existing client
 */
export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    } catch (e) {
      console.warn('Supabase updateClient error, updating locally:', e);
    }
  }

  const items = getLocalClients();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Klien tidak ditemukan');
  items[idx] = { ...items[idx], ...updates };
  saveLocalClients(items);
  return items[idx];
}

/**
 * Delete a client and delete its logo file from storage
 */
export async function deleteClient(id: string, logoUrl?: string | null): Promise<void> {
  // 1. Delete logo file from storage if present
  if (logoUrl) {
    const storagePath = extractStoragePath(logoUrl);
    if (storagePath && isSupabaseConfigured && supabase) {
      try {
        await supabase.storage.from('product-images').remove([storagePath]);
      } catch (err) {
        console.warn('Failed to delete client logo from storage:', err);
      }
    }
  }

  // 2. Delete row from 'clients' table
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('Supabase deleteClient error, deleting locally:', e);
    }
  }

  const items = getLocalClients();
  const filtered = items.filter((c) => c.id !== id);
  saveLocalClients(filtered);
}

/**
 * Bulk create multiple clients (for bulk upload)
 */
export async function bulkCreateClients(
  clientsData: Array<Omit<Client, 'id' | 'created_at'>>
): Promise<Client[]> {
  if (clientsData.length === 0) return [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(
          clientsData.map((c) => ({
            name: c.name,
            logo_url: c.logo_url || null,
            sort_order: c.sort_order ?? 0,
            is_active: c.is_active ?? true,
          }))
        )
        .select();

      if (error) throw error;
      return (data as Client[]) || [];
    } catch (e) {
      console.warn('Supabase bulkCreateClients error, saving locally:', e);
    }
  }

  const items = getLocalClients();
  const createdList: Client[] = clientsData.map((c, idx) => ({
    ...c,
    id: `client_${Date.now()}_${idx}`,
    created_at: new Date().toISOString(),
  }));
  items.push(...createdList);
  saveLocalClients(items);
  return createdList;
}

/**
 * Import initial seeds (Infobank, PNM, Pertamina)
 */
export async function importInitialClients(): Promise<Client[]> {
  return bulkCreateClients(INITIAL_CLIENT_SEEDS);
}


