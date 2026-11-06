export type Availability = "in_stock" | "low_stock" | "out_of_stock";

export interface ArtisanBrief {
  slug: string;
  name: string;
  location: string;
  avatar: string | null;
  specialisation: string;
  is_sample: boolean;
}

export interface Artisan extends ArtisanBrief {
  tagline: string;
  story: string;
  journey: string[];
  state: string;
  years_experience: number;
  product_count?: number;
  products?: Product[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  category_name: string;
  price: number;
  compare_at_price: number | null;
  short_description: string;
  image: string | null;
  images: string[];
  rating: number;
  review_count: number;
  stock: number;
  availability: Availability;
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  artisan: ArtisanBrief;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
}

export interface ProductDetail extends Product {
  description: string;
  materials: string[];
  specs: Record<string, string>;
  care: string;
  qc: { status: string; checked_on: string; checks: string[] };
  artisan: Artisan;
  reviews: Review[];
  related: Product[];
}

export interface Category {
  slug: string;
  name: string;
  image: string;
  count: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface HomeData {
  featured: Product[];
  bestsellers: Product[];
  new_arrivals: Product[];
  artisans: Artisan[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  joined: string;
}

export interface SavedAddress {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

export type ShippingMethod = "standard" | "express";
export type PaymentMethod = "upi" | "card" | "cod";

export interface Quote {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string | null;
  coupon_message: string | null;
  coupon_valid: boolean;
  free_shipping_gap: number;
}

export interface Order {
  number: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  address: { full_name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string };
  items: { product_id: number; slug: string; name: string; price: number; quantity: number; image: string | null }[];
  shipping_method: ShippingMethod;
  payment_method: PaymentMethod;
  payment_status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string | null;
  status: string;
  stage: number;
  stages: string[];
  tracking_is_simulated: boolean;
}
