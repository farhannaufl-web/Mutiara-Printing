# Mutiara Printing – Website Portofolio & Katalog Custom Plakat Jakarta

Landing page & website katalog mobile-first untuk usaha advertising dan pengrajin custom plakat, trophy, dan medali **Mutiara Printing** di Blok M Square, Basement Blok D No. 8, Jakarta Selatan.

Didesain khusus untuk konversi iklan berbayar (Meta Ads, Google Ads, TikTok Ads): pengunjung memilih model produk dan langsung terhubung ke WhatsApp dengan pesan pre-filled berisi judul dan tautan produk spesifik.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Routing**: `react-router-dom`
- **Database, Auth & Storage**: Supabase (`@supabase/supabase-js`)
- **Icons**: `lucide-react`
- **SEO & Social Cards**: `react-helmet-async` + Schema.org JSON-LD LocalBusiness

---

## ⚙️ Environment Variables Setup

Buat file `.env` di root direktori atau tambahkan melalui panel Secrets / Hosting:

```bash
# Supabase Project URL & Anon Public Key
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

> **Catatan Penting Keamanan**: Jangan pernah memasukkan `service_role` key pada environment frontend. Gunakan selalu `anon` key dengan konfigurasi Row Level Security (RLS) di bawah ini.

---

## 🗄️ Supabase Schema & SQL Migration

Jalankan script SQL berikut pada **Supabase SQL Editor** untuk membuat tabel `products`, `wa_clicks`, bucket storage `product-images`, dan konfigurasi hak akses (RLS):

```sql
-- 1. Buat Tabel Produk (products)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  material TEXT DEFAULT '',
  size_info TEXT DEFAULT '',
  min_order TEXT DEFAULT '1 pcs',
  image_urls TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indeks untuk query cepat
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active_sort ON public.products(is_active, sort_order, created_at DESC);

-- 2. Buat Tabel WhatsApp Clicks (wa_clicks)
CREATE TABLE IF NOT EXISTS public.wa_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_clicks_created ON public.wa_clicks(created_at DESC);

-- 3. Buat Tabel Klien (clients) untuk Logo Marquee
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed awal klien
INSERT INTO public.clients (name, sort_order, is_active)
VALUES 
  ('Infobank', 1, true),
  ('PNM', 2, true),
  ('Pertamina', 3, true)
ON CONFLICT DO NOTHING;

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Publik bisa membaca clients yang aktif
CREATE POLICY "Public can view active clients"
  ON public.clients FOR SELECT
  USING (is_active = true);

-- Policy: Pengguna terautentikasi (admin) bisa kelola clients
CREATE POLICY "Authenticated users have full access to clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- Policy: Publik hanya bisa membaca produk yang aktif (is_active = true)
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Policy: Pengguna terautentikasi (admin) memiliki akses penuh ke products
CREATE POLICY "Authenticated users have full access to products"
  ON public.products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Publik bisa mencatat klik WhatsApp (INSERT only)
CREATE POLICY "Public can log WhatsApp clicks"
  ON public.wa_clicks FOR INSERT
  WITH CHECK (true);

-- Policy: Admin terautentikasi bisa membaca log klik WhatsApp
CREATE POLICY "Authenticated users can read clicks"
  ON public.wa_clicks FOR SELECT
  TO authenticated
  USING (true);

-- 4. Buat Storage Bucket untuk foto produk
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Publik bisa membaca foto
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Policy Storage: Admin terautentikasi bisa upload & update foto
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');
```

---

## 📱 Struktur Halaman & Fitur
1. **Beranda (`/`)**:
   - Hero banner dengan call-to-action ganda ("Chat WhatsApp" & "Lihat Katalog")
   - Trust strip (workshop fisik Blok M Square, pengerjaan cepat & presisi, custom desain, kirim seluruh Indonesia)
   - Kategori material plakat (Resin, Akrilik, Timah, Medali, Kristal, Lainnya)
   - Grid produk unggulan (`is_featured = true`)
   - Alur 4 langkah mudah pemesanan
   - Nilai keunggulan pengrajin Mutiara Printing
   - FAQ interaktif accordion
   - Lokasi workshop dengan embedded peta Google Maps interaktif & tombol navigasi

2. **Katalog (`/katalog`)**:
   - Filter segmented kategori (sticky on scroll)
   - Pencarian real-time berdasarkan judul/bahan
   - Sinkronisasi URL query parameter `?kategori=resin&q=...`
   - Tombol "Tanya via WhatsApp" pada setiap kartu produk
   - Tombol "Muat Lebih Banyak"

3. **Detail Produk (`/produk/:slug`)**:
   - Galeri foto multi-angle dengan thumbnail & modal lightbox fullscreen
   - Spesifikasi material, dimensi, dan minimal order
   - Tombol utama WhatsApp dengan format otomatis:
     `Halo Mutiara Printing, saya tertarik dengan produk *{title}* ({category}). Link: {current page URL}. Bisa minta info harga & estimasi pengerjaan?`
   - Rekomendasi produk terkait satu kategori

4. **Tentang & Workshop (`/kontak`)**:
   - Kisah singkat workshop di Blok M Square
   - Form penawaran harga cepat yang langsung terhubung ke WhatsApp
   - Jam operasional: 10.00 WIB - 20.00 WIB

5. **Panel Admin (`/admin`, `/admin/dashboard`, `/admin/klien`)**:
   - Login admin terproteksi (Supabase Auth / Akun Demo `admin@mutiaraprinting.com` / `admin123`)
   - Dashboard analitik WhatsApp (7 hari & 30 hari terakhir) + Top 5 produk paling banyak ditanyakan
   - **Manajemen Produk (`/admin/dashboard`)**: Tambah, edit, hapus (dengan dialog konfirmasi), toggle aktif & unggulan, drag & drop multi-upload foto (WebP/JPEG max ~1600px)
   - **Manajemen Klien & Running Logo (`/admin/klien`)**: Tambah, edit, hapus (otomatis menghapus file dari storage bucket), toggle aktif, atur urutan, tombol "Import Klien Awal" (Infobank, PNM, Pertamina), dan fitur **Bulk Upload Logo** dengan auto-naming dari file.


---

## 🎨 Konfigurasi Bisnis
Seluruh data bisnis, nomor WhatsApp, alamat toko, jam operasional, dan pertanyaan FAQ tersimpan rapi dan dapat diedit kapan saja di:
`src/config/site.ts`
