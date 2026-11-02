import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Product, WAClick, AdminStats, Client } from '../types';

// -----------------------------------------------------------------------
// Supabase Environment Resolution & Diagnostics
// -----------------------------------------------------------------------

export interface SupabaseConfigDiagnostics {
  isConfigured: boolean;
  urlSource: 'VITE_SUPABASE_URL' | 'SUPABASE_URL' | 'none';
  keySource: 'VITE_SUPABASE_ANON_KEY' | 'SUPABASE_ANON_KEY' | 'none';
  resolvedUrl: string;
  maskedKey: string;
  configErrors: string[];
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

  // 3. Evaluate configuration requirements
  const configErrors: string[] = [];

  if (!url) {
    configErrors.push(
      'Variabel URL Supabase (VITE_SUPABASE_URL atau SUPABASE_URL) kosong atau tidak terdefinisi di environment.'
    );
  } else {
    const isHttp = url.startsWith('http://') || url.startsWith('https://');
    if (!isHttp) {
      configErrors.push(
        `URL Supabase "${url}" tidak valid karena tidak diawali dengan "https://" (atau "http://" untuk lokal).`
      );
    }
    if (url.includes('placeholder') || url.includes('your-project-id')) {
      configErrors.push(
        `URL Supabase "${url}" masih menggunakan nilai placeholder bawaan template.`
      );
    }
  }

  if (!anonKey) {
    configErrors.push(
      'Variabel Anon Key (VITE_SUPABASE_ANON_KEY atau SUPABASE_ANON_KEY) kosong atau tidak terdefinisi di environment.'
    );
  } else if (anonKey.includes('placeholder') || anonKey.includes('your-anon-public-key')) {
    configErrors.push(
      'Anon Key Supabase masih menggunakan nilai placeholder bawaan template.'
    );
  }

  const isConfigured = configErrors.length === 0;

  const maskedKey = anonKey
    ? `${anonKey.substring(0, 6)}...${anonKey.substring(anonKey.length - 4)}`
    : '(kosong)';

  const diagnostics: SupabaseConfigDiagnostics = {
    isConfigured,
    urlSource,
    keySource,
    resolvedUrl: url || '(kosong)',
    maskedKey,
    configErrors,
  };

  if (!isConfigured) {
    console.error(
      `%c[Mutiara Printing - Supabase Config Error]%c\nKoneksi Supabase TIDAK aktif:\n${configErrors
        .map((r, i) => `  ${i + 1}. ${r}`)
        .join('\n')}\n\nPeriksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env Anda.`,
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

/**
 * Helper to throw an enhanced Error carrying Supabase error code
 */
function createSupabaseError(error: { message: string; code?: string }): Error & { code?: string } {
  const err = new Error(error.message) as Error & { code?: string };
  if (error.code) {
    err.code = error.code;
  }
  return err;
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    const reason = supabaseDiagnostics.configErrors[0] || 'Koneksi Supabase belum aktif.';
    const err = new Error(`Supabase belum terkonfigurasi: ${reason}`) as Error & { code?: string };
    err.code = 'CONFIG_MISSING';
    throw err;
  }
  return supabase;
}

// -----------------------------------------------------------------------
// Products Data Service (Strict Supabase Database & Storage)
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
}> {
  const client = ensureSupabase();
  const { category, featuredOnly, search, limit = 50, offset = 0, includeInactive = false } = options;

  let query = client.from('products').select('*', { count: 'exact' });

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
    console.error('[Supabase Fetch Products Error]:', error);
    throw createSupabaseError(error);
  }

  return {
    data: (data as Product[]) || [],
    total: count ?? (data?.length || 0),
  };
}

export async function fetchProductBySlug(slug: string): Promise<{ data: Product | null }> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      return { data: null };
    }
    console.error('[Supabase Fetch Slug Error]:', error);
    throw createSupabaseError(error);
  }

  return { data: data as Product };
}

export async function createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('[Supabase Create Product Error]:', error);
    throw createSupabaseError(error);
  }

  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase Update Product Error]:', error);
    throw createSupabaseError(error);
  }

  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const client = ensureSupabase();

  const { error } = await client.from('products').delete().eq('id', id);

  if (error) {
    console.error('[Supabase Delete Product Error]:', error);
    throw createSupabaseError(error);
  }
}

// -----------------------------------------------------------------------
// WhatsApp Click Recording (Table 'wa_clicks' - Fire and Forget)
// -----------------------------------------------------------------------

export async function recordWAClickToDatabase(click: {
  product_id?: string | null;
  source: string;
  created_at?: string;
}): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('wa_clicks').insert([
      {
        product_id: click.product_id || null,
        source: click.source,
        created_at: click.created_at || new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.warn('[Supabase WA Click] Fire-and-forget insert warning:', err);
  }
}

// -----------------------------------------------------------------------
// Admin Statistics (Real Supabase Aggregations)
// -----------------------------------------------------------------------

export async function fetchAdminStats(): Promise<AdminStats> {
  const client = ensureSupabase();

  const [prodRes, clickRes] = await Promise.all([
    client.from('products').select('*'),
    client.from('wa_clicks').select('*'),
  ]);

  if (prodRes.error) {
    console.error('[Supabase Admin Stats Error - Products]:', prodRes.error);
    throw createSupabaseError(prodRes.error);
  }

  if (clickRes.error) {
    console.warn('[Supabase Admin Stats Warning - Clicks]:', clickRes.error);
  }

  const products = (prodRes.data as Product[]) || [];
  const clicks = (clickRes.data as WAClick[]) || [];

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

// -----------------------------------------------------------------------
// Image Compression & Upload Service (Storage Bucket 'product-images')
// -----------------------------------------------------------------------

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

export async function uploadProductImage(file: File): Promise<string> {
  const client = ensureSupabase();

  const compressedBlob = await compressImage(file, 1600, 0.82);
  const ext = 'webp';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await client.storage
    .from('product-images')
    .upload(filePath, compressedBlob, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) {
    console.error('[Supabase Storage Error - uploadProductImage]:', error);
    throw createSupabaseError({
      message: `Gagal upload foto produk: ${error.message}`,
      code: (error as unknown as { code?: string }).code || 'STORAGE_ERROR',
    });
  }

  const { data: publicUrlData } = client.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

// -----------------------------------------------------------------------
// Client Management Service (Table 'clients' & Storage 'product-images/clients/')
// -----------------------------------------------------------------------

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

export async function fetchClients(includeInactive = false): Promise<Client[]> {
  const client = ensureSupabase();

  let query = client
    .from('clients')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Supabase Fetch Clients Error]:', error);
    throw createSupabaseError(error);
  }

  return (data as Client[]) || [];
}

export async function compressLogoImage(
  file: File,
  maxWidth = 600,
  quality = 0.88
): Promise<{ blob: Blob; mimeType: string; extension: string }> {
  return new Promise((resolve, reject) => {
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

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

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
              reject(new Error('Gagal mengompres logo'));
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

export async function uploadClientLogo(file: File): Promise<string> {
  const client = ensureSupabase();

  const { blob, mimeType, extension } = await compressLogoImage(file, 600, 0.88);
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filePath = `clients/${Date.now()}-${cleanBaseName}.${extension}`;

  const { data, error } = await client.storage
    .from('product-images')
    .upload(filePath, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error('[Supabase Storage Error - uploadClientLogo]:', error);
    throw createSupabaseError({
      message: `Gagal upload logo klien: ${error.message}`,
      code: (error as unknown as { code?: string }).code || 'STORAGE_ERROR',
    });
  }

  const { data: publicUrlData } = client.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

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

export async function createClient(
  clientData: Omit<Client, 'id' | 'created_at'>
): Promise<Client> {
  const client = ensureSupabase();

  const { data, error } = await client
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

  if (error) {
    console.error('[Supabase Create Client Error]:', error);
    throw createSupabaseError(error);
  }

  return data as Client;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase Update Client Error]:', error);
    throw createSupabaseError(error);
  }

  return data as Client;
}

export async function deleteClient(id: string, logoUrl?: string | null): Promise<void> {
  const client = ensureSupabase();

  // 1. Delete logo file from storage if present
  if (logoUrl) {
    const storagePath = extractStoragePath(logoUrl);
    if (storagePath) {
      try {
        await client.storage.from('product-images').remove([storagePath]);
      } catch (err) {
        console.warn('Warning saat hapus logo klien dari storage:', err);
      }
    }
  }

  // 2. Delete row from 'clients' table
  const { error } = await client.from('clients').delete().eq('id', id);
  if (error) {
    console.error('[Supabase Delete Client Error]:', error);
    throw createSupabaseError(error);
  }
}

export async function bulkCreateClients(
  clientsData: Array<Omit<Client, 'id' | 'created_at'>>
): Promise<Client[]> {
  if (clientsData.length === 0) return [];
  const client = ensureSupabase();

  const { data, error } = await client
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

  if (error) {
    console.error('[Supabase Bulk Create Clients Error]:', error);
    throw createSupabaseError(error);
  }

  return (data as Client[]) || [];
}

export async function importInitialClients(): Promise<Client[]> {
  return bulkCreateClients(INITIAL_CLIENT_SEEDS);
}
