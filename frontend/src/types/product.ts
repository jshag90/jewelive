export interface User {
  id: number;
  nickname?: string | null;
  email?: string | null;
  points?: number;
  coupon_count?: number;
  membership_grade?: string;
  wish_count?: number;
  sales_count?: number;
}

export interface Product {
  id: number;
  seller_id: number;
  seller?: User | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  price: number;
  retail_price?: number | null;
  discount_rate?: number | null;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  images?: string;
  brand?: string | null;
  brand_id?: number | null;
  category_main?: string | null;
  category_medium?: string | null;
  category_small?: string | null;
  condition?: string | null;
  tags?: string | null;
  badge?: string | null;
  is_ready?: boolean;
  has_certificate?: boolean;
  year?: string | null;
  views: number;
  likes: number;
  chat_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  emoji?: string | null;
  children: Category[];
}

export interface Brand {
  id: number;
  name: string;
  latin?: string;
  logo?: string;
  popular?: string[];
}

export interface Banner {
  id: number;
  badge: string;
  title: string;
  sub: string;
  bg: string;
  image: string;
  accent: string;
}

export interface QuickAction {
  id: number;
  icon: string;
  title: string;
  subtitle?: string | null;
  bg: string;
  fg?: string;
}

export interface HomePayload {
  banners: Banner[];
  quick_actions: QuickAction[];
  marquee: string[];
  new_arrivals: Product[];
  categories: Category[];
}

export interface ExploreSection {
  brand: Brand;
  products: Product[];
}

export interface ExplorePayload {
  categories: Category[];
  brands: Brand[];
  sections: ExploreSection[];
}

export interface WikiEntry {
  id: number;
  product_name: string;
  product_sub: string;
  price: number;
  traded_at: string;
  image: string;
}

export interface TradeReview {
  id: number;
  title: string;
  author: string;
  rating: number;
  summary: string;
  created_at: string;
}

export interface WantedPost {
  id: number;
  brand: string;
  product: string;
  budget: number;
  note: string;
  created_at: string;
}

export interface Notice {
  id: number;
  tag: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
}

export interface LoungePayload {
  wiki: WikiEntry[];
  reviews: TradeReview[];
  wanted: WantedPost[];
  notices: Notice[];
}

export interface Letter {
  id: number;
  issue: string;
  title: string;
  excerpt: string;
  cover: string;
  created_at: string;
  is_new?: boolean;
}
