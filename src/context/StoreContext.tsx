import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  Coupon,
  User,
  Review,
  OrderStatus,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
} from '../data/mockData';
import { api } from '../services/api';

export type AppView = 'home' | 'products' | 'categories' | 'about' | 'contact' | 'cart' | 'checkout' | 'admin' | 'product-detail';

interface StoreContextType {
  // Navigation & UI
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;

  // MongoDB Status & Controls
  isMongoConnected: boolean;
  isLoadingMongo: boolean;
  refreshFromMongoDB: () => Promise<void>;
  reseedMongoDB: () => Promise<void>;

  // Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isDjangoCodeModalOpen: boolean;
  setIsDjangoCodeModalOpen: (open: boolean) => void;

  // Products
  products: Product[];
  featuredProducts: Product[];
  newProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'rating' | 'reviews_count'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  discountAmount: number;
  cartTotal: number;

  // Coupon
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'used_count'>) => Promise<void>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod: 'cod' | 'banking' | 'vnpay';
    note?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Users & Auth
  users: User[];
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: { full_name: string; email: string; phone: string; password?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; message: string }>;
  toggleUserLock: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Reviews
  reviews: Review[];
  addReview: (productId: string, rating: number, comment: string) => Promise<void>;

  // Notification Toast
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  formatCurrency: (amount: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage Helper (v2 format for MongoDB synced state)
  const loadLocal = <T,>(key: string, defaultVal: T): T => {
    try {
      const saved = localStorage.getItem(`tdshop_v2_${key}`);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const saveLocal = <T,>(key: string, val: T) => {
    try {
      localStorage.setItem(`tdshop_v2_${key}`, JSON.stringify(val));
    } catch {
      // ignore
    }
  };

  // State
  const [products, setProducts] = useState<Product[]>(() => loadLocal('products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => loadLocal('categories', INITIAL_CATEGORIES));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadLocal('coupons', INITIAL_COUPONS));
  const [users, setUsers] = useState<User[]>(() => loadLocal('users', INITIAL_USERS));
  const [orders, setOrders] = useState<Order[]>(() => loadLocal('orders', INITIAL_ORDERS));
  const [reviews, setReviews] = useState<Review[]>(() => loadLocal('reviews', INITIAL_REVIEWS));
  const [cart, setCart] = useState<CartItem[]>(() => loadLocal('cart', []));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadLocal('current_user', INITIAL_USERS[0]));

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // MongoDB Connection State
  const [isMongoConnected, setIsMongoConnected] = useState<boolean>(false);
  const [isLoadingMongo, setIsLoadingMongo] = useState<boolean>(false);

  const featuredProducts = products.filter((p) => p.is_featured && p.is_active);
  const newProducts = products.filter((p) => p.is_new && p.is_active);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDjangoCodeModalOpen, setIsDjangoCodeModalOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Sync with MongoDB function
  const refreshFromMongoDB = async () => {
    try {
      setIsLoadingMongo(true);
      const health = await api.checkHealth();
      if (health.connected) {
        setIsMongoConnected(true);
        const [cats, prods, ords, coups, usrs, revs] = await Promise.all([
          api.getCategories().catch(() => INITIAL_CATEGORIES),
          api.getProducts().catch(() => INITIAL_PRODUCTS),
          api.getOrders().catch(() => INITIAL_ORDERS),
          api.getCoupons().catch(() => INITIAL_COUPONS),
          api.getUsers().catch(() => INITIAL_USERS),
          api.getReviews().catch(() => INITIAL_REVIEWS),
        ]);

        if (cats && cats.length > 0) setCategories(cats);
        if (prods && prods.length > 0) setProducts(prods);
        if (ords) setOrders(ords);
        if (coups && coups.length > 0) setCoupons(coups);
        if (usrs && usrs.length > 0) setUsers(usrs);
        if (revs) setReviews(revs);
      }
    } catch {
      setIsMongoConnected(false);
    } finally {
      setIsLoadingMongo(false);
    }
  };

  // Reseed MongoDB function
  const reseedMongoDB = async () => {
    try {
      showToast('Đang kết nối MongoDB để xoá data cũ và khởi tạo database mới...', 'info');
      const res = await api.seedDatabase();
      if (res.success) {
        await refreshFromMongoDB();
        showToast('✓ Đã khởi tạo lại toàn bộ Database MongoDB mới thành công!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi khởi tạo database MongoDB', 'error');
    }
  };

  // Auto connect on mount
  useEffect(() => {
    refreshFromMongoDB();
  }, []);

  // Sync with LocalStorage backup
  useEffect(() => saveLocal('products', products), [products]);
  useEffect(() => saveLocal('categories', categories), [categories]);
  useEffect(() => saveLocal('coupons', coupons), [coupons]);
  useEffect(() => saveLocal('users', users), [users]);
  useEffect(() => saveLocal('orders', orders), [orders]);
  useEffect(() => saveLocal('reviews', reviews), [reviews]);
  useEffect(() => saveLocal('cart', cart), [cart]);
  useEffect(() => saveLocal('current_user', currentUser), [currentUser]);

  // Cart Calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const unitPrice = item.product.discount_price || item.product.price;
    return total + unitPrice * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discount_value) / 100);
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Cart Actions
  const addToCart = (product: Product, quantity: number = 1, variant?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id && item.selected_variant === variant);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          showToast(`Chỉ còn tối đa ${product.stock} sản phẩm trong kho!`, 'error');
          return prev;
        }
        return prev.map((item) => (item.id === existing.id ? { ...item, quantity: nextQty } : item));
      }
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product_id: product.id,
        product,
        quantity,
        selected_variant: variant,
      };
      return [...prev, newItem];
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          if (quantity > item.product.stock) {
            showToast(`Chỉ còn tối đa ${item.product.stock} sản phẩm!`, 'error');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon Handlers
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.is_active);
    if (!found) {
      showToast('Mã giảm giá không tồn tại hoặc đã hết hạn!', 'error');
      return { success: false, message: 'Mã không tồn tại hoặc đã hết hạn' };
    }
    if (cartSubtotal < found.min_order_amount) {
      const msg = `Mã này chỉ áp dụng cho đơn hàng từ ${formatCurrency(found.min_order_amount)} trở lên!`;
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
    setAppliedCoupon(found);
    showToast(`Áp dụng mã giảm giá "${found.code}" thành công!`, 'success');
    return { success: true, message: 'Áp dụng mã thành công' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Đã hủy mã giảm giá', 'info');
  };

  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'used_count'>) => {
    if (isMongoConnected) {
      try {
        const created = await api.createCoupon(couponData);
        setCoupons((prev) => [created, ...prev]);
        showToast(`Đã lưu mã giảm giá "${created.code}" vào MongoDB!`, 'success');
        return;
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      used_count: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Đã tạo mã giảm giá "${newCoupon.code}"`, 'success');
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    if (isMongoConnected) {
      try {
        const updated = await api.updateCoupon(id, updates);
        setCoupons((prev) => prev.map((c) => (c.id === id || c._id === id ? updated : c)));
        showToast('Đã cập nhật mã giảm giá trong MongoDB', 'success');
        return;
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Đã cập nhật mã giảm giá', 'success');
  };

  const deleteCoupon = async (id: string) => {
    if (isMongoConnected) {
      try {
        await api.deleteCoupon(id);
      } catch (err: any) {
        console.error(err);
      }
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id && c._id !== id));
    showToast('Đã xóa mã giảm giá', 'info');
  };

  // Products CRUD
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'rating' | 'reviews_count'>) => {
    if (isMongoConnected) {
      try {
        const created = await api.createProduct(productData);
        setProducts((prev) => [created, ...prev]);
        showToast(`Đã lưu sản phẩm "${created.name}" vào MongoDB!`, 'success');
        return;
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      rating: 5.0,
      reviews_count: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Đã thêm sản phẩm "${newProduct.name}"`, 'success');
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (isMongoConnected) {
      try {
        const updated = await api.updateProduct(id, updates);
        setProducts((prev) => prev.map((p) => (p.id === id || p._id === id ? updated : p)));
        showToast('Đã cập nhật sản phẩm trong MongoDB', 'success');
        return;
      } catch (err: any) {
        console.error(err);
      }
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Cập nhật sản phẩm thành công', 'success');
  };

  const deleteProduct = async (id: string) => {
    if (isMongoConnected) {
      try {
        await api.deleteProduct(id);
      } catch (err: any) {
        console.error(err);
      }
    }
    setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
    showToast('Đã xóa sản phẩm', 'info');
  };

  const toggleProductStatus = async (id: string) => {
    const target = products.find((p) => p.id === id || p._id === id);
    if (!target) return;
    const nextStatus = !target.is_active;
    await updateProduct(id, { is_active: nextStatus });
  };

  // Categories CRUD
  const addCategory = async (catData: Omit<Category, 'id'>) => {
    if (isMongoConnected) {
      try {
        const created = await api.createCategory(catData);
        setCategories((prev) => [...prev, created]);
        showToast(`Đã lưu danh mục "${created.name}" vào MongoDB!`, 'success');
        return;
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Đã tạo danh mục "${newCat.name}"`, 'success');
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (isMongoConnected) {
      try {
        const updated = await api.updateCategory(id, updates);
        setCategories((prev) => prev.map((c) => (c.id === id || c._id === id ? updated : c)));
        showToast('Đã cập nhật danh mục trong MongoDB', 'success');
        return;
      } catch (err: any) {
        console.error(err);
      }
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Cập nhật danh mục thành công', 'success');
  };

  const deleteCategory = async (id: string) => {
    if (isMongoConnected) {
      try {
        await api.deleteCategory(id);
      } catch (err: any) {
        console.error(err);
      }
    }
    setCategories((prev) => prev.filter((c) => c.id !== id && c._id !== id));
    showToast('Đã xóa danh mục', 'info');
  };

  // Orders CRUD
  const createOrder = async ({
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    paymentMethod,
    note,
  }: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod: 'cod' | 'banking' | 'vnpay';
    note?: string;
  }): Promise<Order> => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderPayload = {
      order_code: `TD-${randomNum}`,
      user_id: currentUser?.id || currentUser?._id || 'guest',
      user_name: customerName,
      user_email: customerEmail,
      user_phone: customerPhone,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      note,
      subtotal_amount: cartSubtotal,
      discount_amount: discountAmount,
      coupon_code: appliedCoupon?.code,
      total_amount: cartTotal,
      status: 'pending' as OrderStatus,
      items: cart.map((item) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image,
        price: item.product.discount_price || item.product.price,
        quantity: item.quantity,
      })),
    };

    let newOrder: Order;
    if (isMongoConnected) {
      try {
        newOrder = await api.createOrder(orderPayload);
      } catch {
        newOrder = { ...orderPayload, id: `ord-${Date.now()}`, created_at: new Date().toISOString() };
      }
    } else {
      newOrder = { ...orderPayload, id: `ord-${Date.now()}`, created_at: new Date().toISOString() };
    }

    // Reduce stock
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((c) => c.product_id === p.id || c.product_id === p._id);
        if (inCart) {
          const updatedStock = Math.max(0, p.stock - inCart.quantity);
          if (isMongoConnected) {
            api.updateProduct(p.id || p._id!, { stock: updatedStock }).catch(console.error);
          }
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );

    // Increment coupon used_count if applied
    if (appliedCoupon) {
      const nextUsed = appliedCoupon.used_count + 1;
      if (isMongoConnected) {
        api.updateCoupon(appliedCoupon.id || appliedCoupon._id!, { used_count: nextUsed }).catch(console.error);
      }
      setCoupons((prev) =>
        prev.map((c) => (c.id === appliedCoupon.id || c._id === appliedCoupon.id ? { ...c, used_count: nextUsed } : c))
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    showToast(`Đặt hàng thành công! Mã đơn: ${newOrder.order_code}`, 'success');
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (isMongoConnected) {
      try {
        const updated = await api.updateOrderStatus(orderId, status);
        setOrders((prev) => prev.map((o) => (o.id === orderId || o._id === orderId ? updated : o)));
        showToast('Đã cập nhật trạng thái đơn hàng trong MongoDB', 'success');
        return;
      } catch (err: any) {
        console.error(err);
      }
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
  };

  const deleteOrder = async (orderId: string) => {
    if (isMongoConnected) {
      try {
        await api.deleteOrder(orderId);
      } catch (err: any) {
        console.error(err);
      }
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId && o._id !== orderId));
    showToast('Đã xóa đơn hàng', 'info');
  };

  // Auth & Users
  const login = async (email: string, pass: string) => {
    if (isMongoConnected) {
      try {
        const res = await api.login(email, pass);
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setIsAuthModalOpen(false);
          showToast(`Chào mừng ${res.user.full_name} quay trở lại!`, 'success');
          return { success: true, message: 'Đăng nhập thành công' };
        }
      } catch (err: any) {
        showToast(err.message || 'Đăng nhập thất bại', 'error');
        return { success: false, message: err.message };
      }
    }

    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      showToast('Tài khoản không tồn tại trong hệ thống!', 'error');
      return { success: false, message: 'Tài khoản không tồn tại' };
    }
    if (!user.is_active) {
      showToast('Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ Admin!', 'error');
      return { success: false, message: 'Tài khoản đã bị khóa' };
    }
    if (user.password && user.password !== pass) {
      showToast('Mật khẩu không chính xác!', 'error');
      return { success: false, message: 'Mật khẩu sai' };
    }
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Chào mừng ${user.full_name} quay trở lại!`, 'success');
    return { success: true, message: 'Đăng nhập thành công' };
  };

  const register = async (userData: { full_name: string; email: string; phone: string; password?: string }) => {
    if (isMongoConnected) {
      try {
        const res = await api.register(userData);
        if (res.success && res.user) {
          setUsers((prev) => [res.user, ...prev]);
          setCurrentUser(res.user);
          setIsAuthModalOpen(false);
          showToast('Đăng ký tài khoản MongoDB thành công!', 'success');
          return { success: true, message: 'Đăng ký thành công' };
        }
      } catch (err: any) {
        showToast(err.message || 'Đăng ký thất bại', 'error');
        return { success: false, message: err.message };
      }
    }

    const existing = users.find((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      showToast('Email này đã được đăng ký tài khoản!', 'error');
      return { success: false, message: 'Email đã tồn tại' };
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: userData.email.split('@')[0],
      email: userData.email,
      full_name: userData.full_name,
      phone: userData.phone,
      address: '',
      is_admin: false,
      is_active: true,
      created_at: new Date().toISOString(),
      password: userData.password || '123456',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    showToast('Đăng ký tài khoản thành công!', 'success');
    return { success: true, message: 'Đăng ký thành công' };
  };

  const logout = () => {
    setCurrentUser(null);
    if (currentView === 'admin') {
      setCurrentView('home');
    }
    showToast('Đã đăng xuất tài khoản', 'info');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };
    const id = currentUser.id || currentUser._id;
    if (isMongoConnected && id) {
      try {
        const updated = await api.updateUser(id, updates);
        setCurrentUser(updated);
        setUsers((prev) => prev.map((u) => (u.id === id || u._id === id ? updated : u)));
        showToast('Cập nhật thông tin cá nhân MongoDB thành công', 'success');
        return { success: true, message: 'Cập nhật thành công' };
      } catch (err: any) {
        console.error(err);
      }
    }
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    showToast('Cập nhật thông tin cá nhân thành công', 'success');
    return { success: true, message: 'Cập nhật thành công' };
  };

  const toggleUserLock = async (userId: string) => {
    const target = users.find((u) => u.id === userId || u._id === userId);
    if (!target) return;
    const nextState = !target.is_active;
    if (isMongoConnected) {
      try {
        const updated = await api.updateUser(userId, { is_active: nextState });
        setUsers((prev) => prev.map((u) => (u.id === userId || u._id === userId ? updated : u)));
        showToast('Cập nhật trạng thái tài khoản MongoDB thành công', 'success');
        return;
      } catch (err: any) {
        console.error(err);
      }
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
    );
    showToast('Cập nhật trạng thái tài khoản thành công', 'success');
  };

  const deleteUser = async (userId: string) => {
    if (isMongoConnected) {
      try {
        await api.deleteUser(userId);
      } catch (err: any) {
        console.error(err);
      }
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId && u._id !== userId));
    showToast('Đã xóa người dùng', 'info');
  };

  // Reviews
  const addReview = async (productId: string, rating: number, comment: string) => {
    const revData = {
      product_id: productId,
      user_name: currentUser?.full_name || 'Khách hàng ẩn danh',
      user_avatar: currentUser?.avatar,
      rating,
      comment,
    };

    if (isMongoConnected) {
      try {
        const created = await api.createReview(revData);
        setReviews((prev) => [created, ...prev]);
      } catch (err: any) {
        console.error(err);
      }
    } else {
      const newRev: Review = {
        id: `rev-${Date.now()}`,
        ...revData,
        created_at: new Date().toISOString(),
      };
      setReviews((prev) => [newRev, ...prev]);
    }

    // Update product rating
    const currentReviews = reviews.filter((r) => r.product_id === productId);
    const newCount = currentReviews.length + 1;
    const newAvg = Number(
      ((currentReviews.reduce((acc, r) => acc + r.rating, 0) + rating) / newCount).toFixed(1)
    );
    updateProduct(productId, { rating: newAvg, reviews_count: newCount });
    showToast('Cảm ơn bạn đã gửi đánh giá sản phẩm!', 'success');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId,
        selectedCategorySlug,
        setSelectedCategorySlug,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeOrderId,
        setActiveOrderId,
        isMongoConnected,
        isLoadingMongo,
        refreshFromMongoDB,
        reseedMongoDB,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isDjangoCodeModalOpen,
        setIsDjangoCodeModalOpen,
        products,
        featuredProducts,
        newProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        discountAmount,
        cartTotal,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        users,
        currentUser,
        login,
        register,
        logout,
        updateProfile,
        toggleUserLock,
        deleteUser,
        reviews,
        addReview,
        notification,
        showToast,
        formatCurrency,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
