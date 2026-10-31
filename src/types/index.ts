export interface Product {
  id: string;
  title: string;
  slug: string;
  category: 'resin' | 'akrilik' | 'timah' | 'kristal' | 'medali' | 'lainnya' | string;
  description: string;
  material: string;
  size_info: string;
  min_order: string;
  image_urls: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface WAClick {
  id?: string;
  product_id?: string | null;
  source: string;
  created_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  badgeText?: string;
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  hiddenProducts: number;
  clicksLast7Days: number;
  clicksLast30Days: number;
  topProducts: {
    product: Product | null;
    productId: string;
    productTitle: string;
    clickCount: number;
  }[];
}

export interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export type ClientLogo = Client;


