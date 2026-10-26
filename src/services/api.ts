import { Category, Product, Order, Coupon, User, Review, OrderStatus } from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Health & MongoDB Status
  checkHealth: async () => {
    return fetchJSON<{ status: string; database: string; connected: boolean; message: string }>('/health');
  },

  // Reset / Re-seed MongoDB database
  seedDatabase: async () => {
    return fetchJSON<{ success: boolean; message: string; counts: Record<string, number> }>('/seed', {
      method: 'POST',
    });
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    return fetchJSON<Category[]>('/categories');
  },
  createCategory: async (data: Omit<Category, 'id' | '_id'>): Promise<Category> => {
    return fetchJSON<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateCategory: async (id: string, updates: Partial<Category>): Promise<Category> => {
    return fetchJSON<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteCategory: async (id: string): Promise<{ success: boolean }> => {
    return fetchJSON<{ success: boolean }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Products
  getProducts: async (filters?: { category?: string; search?: string }): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJSON<Product[]>(`/products${query}`);
  },
  getProductById: async (id: string): Promise<Product> => {
    return fetchJSON<Product>(`/products/${id}`);
  },
  createProduct: async (data: Omit<Product, 'id' | '_id' | 'created_at' | 'rating' | 'reviews_count'>): Promise<Product> => {
    return fetchJSON<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    return fetchJSON<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    return fetchJSON<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    return fetchJSON<Order[]>('/orders');
  },
  createOrder: async (data: any): Promise<Order> => {
    return fetchJSON<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    return fetchJSON<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  deleteOrder: async (id: string): Promise<{ success: boolean }> => {
    return fetchJSON<{ success: boolean }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },

  // Coupons
  getCoupons: async (): Promise<Coupon[]> => {
    return fetchJSON<Coupon[]>('/coupons');
  },
  createCoupon: async (data: Omit<Coupon, 'id' | '_id' | 'used_count'>): Promise<Coupon> => {
    return fetchJSON<Coupon>('/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateCoupon: async (id: string, updates: Partial<Coupon>): Promise<Coupon> => {
    return fetchJSON<Coupon>(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteCoupon: async (id: string): Promise<{ success: boolean }> => {
    return fetchJSON<{ success: boolean }>(`/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  // Users & Auth
  getUsers: async (): Promise<User[]> => {
    return fetchJSON<User[]>('/users');
  },
  login: async (email: string, password?: string): Promise<{ success: boolean; user: User; message?: string }> => {
    return fetchJSON<{ success: boolean; user: User; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (userData: { full_name: string; email: string; phone?: string; password?: string }): Promise<{ success: boolean; user: User; message?: string }> => {
    return fetchJSON<{ success: boolean; user: User; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    return fetchJSON<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    return fetchJSON<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Reviews
  getReviews: async (productId?: string): Promise<Review[]> => {
    const query = productId ? `?productId=${productId}` : '';
    return fetchJSON<Review[]>(`/reviews${query}`);
  },
  createReview: async (data: { product_id: string; user_name: string; rating: number; comment: string; user_avatar?: string }): Promise<Review> => {
    return fetchJSON<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default api;
