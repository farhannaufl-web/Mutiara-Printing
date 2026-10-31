import { createClient } from '@supabase/supabase-js';
import { Product, WAClick, AdminStats } from '../types';
import { DEMO_PRODUCTS } from './demoData';

// Read env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://')
);

// Initialize Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
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
