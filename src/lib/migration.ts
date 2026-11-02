import { supabase, isSupabaseConfigured } from './supabase';

export interface LocalDataSummary {
  hasLocalData: boolean;
  productCount: number;
  clientCount: number;
  clickCount: number;
}

const LEGACY_PRODUCTS_KEY = 'mutiara_local_products_v1';
const LEGACY_CLIENTS_KEY = 'mutiara_clients_data_v2';
const LEGACY_CLICKS_KEY = 'mutiara_local_wa_clicks_v1';

/**
 * Check if legacy localStorage keys exist and contain items
 */
export function checkLegacyLocalData(): LocalDataSummary {
  let productCount = 0;
  let clientCount = 0;
  let clickCount = 0;

  try {
    const rawProd = localStorage.getItem(LEGACY_PRODUCTS_KEY);
    if (rawProd) {
      const parsed = JSON.parse(rawProd);
      if (Array.isArray(parsed)) productCount = parsed.length;
    }
  } catch {}

  try {
    const rawClients = localStorage.getItem(LEGACY_CLIENTS_KEY);
    if (rawClients) {
      const parsed = JSON.parse(rawClients);
      if (Array.isArray(parsed)) clientCount = parsed.length;
    }
  } catch {}

  try {
    const rawClicks = localStorage.getItem(LEGACY_CLICKS_KEY);
    if (rawClicks) {
      const parsed = JSON.parse(rawClicks);
      if (Array.isArray(parsed)) clickCount = parsed.length;
    }
  } catch {}

  const hasLocalData = productCount > 0 || clientCount > 0 || clickCount > 0;

  return {
    hasLocalData,
    productCount,
    clientCount,
    clickCount,
  };
}

/**
 * Helper to convert Base64 Data URL to Blob for storage upload
 */
function base64ToBlob(dataUrl: string): { blob: Blob; mime: string; ext: string } {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/webp';
  const ext = mime.includes('png') ? 'png' : mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'webp';

  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return {
    blob: new Blob([u8arr], { type: mime }),
    mime,
    ext,
  };
}

const isUuid = (str: unknown): boolean =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * Migrate legacy data from localStorage to Supabase database & storage
 */
export async function migrateLocalDataToSupabase(
  onProgress?: (msg: string) => void
): Promise<{
  productsMigrated: number;
  clientsMigrated: number;
  clicksMigrated: number;
}> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Koneksi Supabase belum aktif. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY telah disetel.');
  }

  let productsMigrated = 0;
  let clientsMigrated = 0;
  let clicksMigrated = 0;

  // 1. MIGRATE PRODUCTS
  const rawProd = localStorage.getItem(LEGACY_PRODUCTS_KEY);
  if (rawProd) {
    try {
      const products = JSON.parse(rawProd);
      if (Array.isArray(products) && products.length > 0) {
        onProgress?.(`Memproses ${products.length} produk dari penyimpanan lokal...`);

        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          onProgress?.(`Memproses produk ${i + 1}/${products.length}: "${p.title}"...`);

          const processedImageUrls: string[] = [];

          // Upload any base64 images to Supabase Storage
          if (Array.isArray(p.image_urls)) {
            for (let imgIdx = 0; imgIdx < p.image_urls.length; imgIdx++) {
              const url = p.image_urls[imgIdx];
              if (typeof url === 'string' && url.startsWith('data:image/')) {
                try {
                  onProgress?.(`Mengunggah foto ${imgIdx + 1} untuk "${p.title}" ke Supabase Storage...`);
                  const { blob, mime, ext } = base64ToBlob(url);
                  const fileName = `migrated_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
                  const filePath = `products/${fileName}`;

                  const { data: uploadData, error: uploadErr } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, blob, { contentType: mime, upsert: false });

                  if (uploadErr) throw uploadErr;

                  const { data: pubUrl } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(uploadData.path);

                  processedImageUrls.push(pubUrl.publicUrl);
                } catch (uploadError) {
                  console.warn('Gagal upload gambar base64:', uploadError);
                  // Keep as is if failed
                  processedImageUrls.push(url);
                }
              } else if (typeof url === 'string') {
                processedImageUrls.push(url);
              }
            }
          }

          // Generate or preserve slug
          const safeSlug =
            p.slug ||
            (p.title
              ? p.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '')
              : `produk-${Date.now()}-${i}`);

          const productPayload = {
            title: p.title || 'Produk Tanpa Judul',
            slug: `${safeSlug}-${Date.now().toString().slice(-4)}`,
            category: p.category || 'resin',
            description: p.description || '',
            material: p.material || '',
            size_info: p.size_info || '',
            min_order: p.min_order || '1 pcs',
            image_urls: processedImageUrls.length > 0 ? processedImageUrls : ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'],
            is_featured: Boolean(p.is_featured),
            is_active: p.is_active !== undefined ? Boolean(p.is_active) : true,
            sort_order: typeof p.sort_order === 'number' ? p.sort_order : i + 1,
          };

          const { error: insertProdErr } = await supabase.from('products').insert([productPayload]);
          if (insertProdErr) {
            console.error('[Supabase Migrate] Gagal insert produk:', insertProdErr);
            throw new Error(`[Supabase Error ${insertProdErr.code}] Gagal insert produk "${p.title}": ${insertProdErr.message}`);
          }

          productsMigrated++;
        }
      }
    } catch (err) {
      console.error('Error saat migrasi produk:', err);
      throw err;
    }
  }

  // 2. MIGRATE CLIENTS
  const rawClients = localStorage.getItem(LEGACY_CLIENTS_KEY);
  if (rawClients) {
    try {
      const clients = JSON.parse(rawClients);
      if (Array.isArray(clients) && clients.length > 0) {
        onProgress?.(`Memproses ${clients.length} klien dari penyimpanan lokal...`);

        for (let i = 0; i < clients.length; i++) {
          const c = clients[i];
          let finalLogoUrl = c.logo_url || null;

          if (finalLogoUrl && typeof finalLogoUrl === 'string' && finalLogoUrl.startsWith('data:image/')) {
            try {
              onProgress?.(`Mengunggah logo klien "${c.name}" ke Supabase Storage...`);
              const { blob, mime, ext } = base64ToBlob(finalLogoUrl);
              const fileName = `clients/migrated_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('product-images')
                .upload(fileName, blob, { contentType: mime, upsert: false });

              if (uploadErr) throw uploadErr;

              const { data: pubUrl } = supabase.storage
                .from('product-images')
                .getPublicUrl(uploadData.path);

              finalLogoUrl = pubUrl.publicUrl;
            } catch (err) {
              console.warn('Gagal upload logo klien base64:', err);
            }
          }

          const clientPayload = {
            name: c.name || 'Klien',
            logo_url: finalLogoUrl,
            sort_order: typeof c.sort_order === 'number' ? c.sort_order : i + 1,
            is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
          };

          const { error: insertClientErr } = await supabase.from('clients').insert([clientPayload]);
          if (insertClientErr) {
            console.error('[Supabase Migrate] Gagal insert klien:', insertClientErr);
            throw new Error(`[Supabase Error ${insertClientErr.code}] Gagal insert klien "${c.name}": ${insertClientErr.message}`);
          }

          clientsMigrated++;
        }
      }
    } catch (err) {
      console.error('Error saat migrasi klien:', err);
      throw err;
    }
  }

  // 3. MIGRATE WA CLICKS
  const rawClicks = localStorage.getItem(LEGACY_CLICKS_KEY);
  if (rawClicks) {
    try {
      const clicks = JSON.parse(rawClicks);
      if (Array.isArray(clicks) && clicks.length > 0) {
        onProgress?.(`Memproses ${clicks.length} data klik WhatsApp...`);

        const clicksPayload = clicks.map((c) => ({
          product_id: isUuid(c.product_id) ? c.product_id : null,
          source: c.source || 'product_detail',
          created_at: c.created_at || new Date().toISOString(),
        }));

        // Batch insert in chunks of 50
        for (let i = 0; i < clicksPayload.length; i += 50) {
          const chunk = clicksPayload.slice(i, i + 50);
          const { error: clickErr } = await supabase.from('wa_clicks').insert(chunk);
          if (clickErr) {
            console.warn('[Supabase Migrate] Warning saat insert clicks:', clickErr.message);
          } else {
            clicksMigrated += chunk.length;
          }
        }
      }
    } catch (err) {
      console.warn('Error saat migrasi WA clicks (non-blocking):', err);
    }
  }

  // 4. CLEAN UP LOCALSTORAGE KEYS
  onProgress?.('Membersihkan data lama dari localStorage...');
  try {
    localStorage.removeItem(LEGACY_PRODUCTS_KEY);
    localStorage.removeItem(LEGACY_CLIENTS_KEY);
    localStorage.removeItem(LEGACY_CLICKS_KEY);
  } catch (cleanErr) {
    console.warn('Gagal menghapus localStorage keys:', cleanErr);
  }

  onProgress?.('Migrasi selesai!');
  return {
    productsMigrated,
    clientsMigrated,
    clicksMigrated,
  };
}
