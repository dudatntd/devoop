export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  avatar?: string;
  password?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  image?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  discount_price?: number;
  description: string;
  specs?: Record<string, string>;
  image: string;
  gallery?: string[];
  stock: number;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  _id?: string;
  product_id: string;
  product: Product;
  quantity: number;
  selected_variant?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  _id?: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  _id?: string;
  order_code: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  shipping_address: string;
  payment_method: 'cod' | 'banking' | 'vnpay';
  note?: string;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  coupon_code?: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface Coupon {
  id: string;
  _id?: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number; // e.g. 10 for 10% or 50000 for 50k VND
  min_order_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  used_count: number;
}

export interface Review {
  id: string;
  _id?: string;
  product_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  ordersByStatus: { status: OrderStatus; label: string; count: number; color: string }[];
}
