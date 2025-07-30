export interface Category {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  english_name?: string;
  english_description?: string;
  is_active: boolean;
  picture_url?: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Item {
  id: number;
  uuid: string;
  name: string;
  description: string;
  slug?: string;
  category_id: string;
  price: number;
  discount_price?: number;
  discount_percentage?: number;
  sku?: string;
  barcode?: string;
  is_active: boolean;
  quantity?: number;
  attributes?: Record<string, any>;
  complementaries?: Record<string, any>;
  address?: string;
  latitude?: number;
  longitude?: number;
  google_map_url?: string;
  governorate_id?: number;
  country_id?: number;
  city_id?: number;
  phone_number?: string;
  whatsapp_number?: string;
  specifications?: Record<string, any>;
  images?: string[];
  created_at: string;
  updated_at: string;
  category: Category;
  governorate?: any;
  country?: any;
  city?: any;
}

export interface PaginatedItems {
  data: Item[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
