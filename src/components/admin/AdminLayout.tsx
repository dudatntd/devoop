import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Tag,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Truck,
  Ban,
  AlertTriangle,
  Lock,
  Unlock,
  Search,
  DollarSign,
  TrendingUp,
  X,
  Code2,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, Category, Order, User, Coupon, OrderStatus } from '../../types';

export const AdminLayout: React.FC = () => {
  const {
    currentUser,
    setCurrentView,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    orders,
    updateOrderStatus,
    deleteOrder,
    users,
    toggleUserLock,
    deleteUser,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    formatCurrency,
    showToast,
    login,
    setIsDjangoCodeModalOpen,
    isMongoConnected,
    isLoadingMongo,
    reseedMongoDB,
    refreshFromMongoDB,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'coupons'
  >('dashboard');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pCatId, setPCatId] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDiscount, setPDiscount] = useState('');
  const [pStock, setPStock] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImage, setPImage] = useState('');

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [cName, setCName] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cDesc, setCDesc] = useState('');

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Customer History Modal
  const [viewCustomerHistory, setViewCustomerHistory] = useState<User | null>(null);

  // Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState<'percent' | 'fixed'>('percent');
  const [coupValue, setCoupValue] = useState('');
  const [coupMinOrder, setCoupMinOrder] = useState('');
  const [coupStart, setCoupStart] = useState('2026-01-01');
  const [coupEnd, setCoupEnd] = useState('2026-12-31');

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Non-admin guard
  if (!currentUser || !currentUser.is_admin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Yêu Cầu Quyền Quản Trị</h2>
            <p className="text-xs text-slate-500 mt-1">
              Khu vực này dành riêng cho quản trị viên TDShop. Vui lòng đăng nhập với tài khoản có quyền Admin.
            </p>
          </div>
          <button
            onClick={() => login('admin@tdshop.vn', 'admin')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Đăng nhập nhanh với quyền Admin (admin@tdshop.vn)
          </button>
          <button
            onClick={() => setCurrentView('home')}
            className="w-full py-2.5 text-xs text-slate-600 hover:underline cursor-pointer"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const lowStockProducts = products.filter((p) => p.stock <= 10);
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  // Product Modal Handlers
  const handleOpenProductModal = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setPName(prod.name);
      setPCatId(prod.category_id);
      setPPrice(prod.price.toString());
      setPDiscount(prod.discount_price ? prod.discount_price.toString() : '');
      setPStock(prod.stock.toString());
      setPDesc(prod.description);
      setPImage(prod.image);
    } else {
      setEditingProduct(null);
      setPName('');
      setPCatId(categories[0]?.id || '');
      setPPrice('');
      setPDiscount('');
      setPStock('20');
      setPDesc('');
      setPImage('https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80');
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(pPrice);
    const discNum = pDiscount ? Number(pDiscount) : undefined;
    const stockNum = Number(pStock);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: pName,
        category_id: pCatId,
        price: priceNum,
        discount_price: discNum,
        stock: stockNum,
        description: pDesc,
        image: pImage,
      });
    } else {
      addProduct({
        name: pName,
        slug: pName.toLowerCase().replace(/\s+/g, '-'),
        category_id: pCatId,
        price: priceNum,
        discount_price: discNum,
        stock: stockNum,
        description: pDesc,
        image: pImage,
        is_active: true,
        is_featured: false,
        is_new: true,
      });
    }
    setIsProductModalOpen(false);
  };

  // Category Modal Handlers
  const handleOpenCategoryModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCName(cat.name);
      setCSlug(cat.slug);
      setCDesc(cat.description);
    } else {
      setEditingCategory(null);
      setCName('');
      setCSlug('');
      setCDesc('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = cSlug || cName.toLowerCase().replace(/\s+/g, '-');
    if (editingCategory) {
      updateCategory(editingCategory.id, { name: cName, slug, description: cDesc });
    } else {
      addCategory({
        name: cName,
        slug,
        description: cDesc,
        iconName: 'Package',
      });
    }
    setIsCategoryModalOpen(false);
  };

  // Coupon Modal Handlers
  const handleOpenCouponModal = (coup: Coupon | null = null) => {
    if (coup) {
      setEditingCoupon(coup);
      setCoupCode(coup.code);
      setCoupType(coup.discount_type);
      setCoupValue(coup.discount_value.toString());
      setCoupMinOrder(coup.min_order_amount.toString());
      setCoupStart(coup.start_date);
      setCoupEnd(coup.end_date);
    } else {
      setEditingCoupon(null);
      setCoupCode('');
      setCoupType('percent');
      setCoupValue('10');
      setCoupMinOrder('500000');
      setCoupStart('2026-01-01');
      setCoupEnd('2026-12-31');
    }
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(coupValue);
    const minOrd = Number(coupMinOrder);
    if (editingCoupon) {
      updateCoupon(editingCoupon.id, {
        code: coupCode.toUpperCase().trim(),
        discount_type: coupType,
        discount_value: val,
        min_order_amount: minOrd,
        start_date: coupStart,
        end_date: coupEnd,
      });
    } else {
      addCoupon({
        code: coupCode.toUpperCase().trim(),
        discount_type: coupType,
        discount_value: val,
        min_order_amount: minOrd,
        start_date: coupStart,
        end_date: coupEnd,
        is_active: true,
      });
    }
    setIsCouponModalOpen(false);
  };

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === 'all' || p.category_id === productCatFilter;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm">
              TD
            </span>
            <span className="font-black text-lg tracking-tight">
              TDShop <span className="text-blue-400 font-semibold text-xs px-2 py-0.5 rounded bg-blue-950 border border-blue-800">ADMIN CONTROL</span>
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* MongoDB Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium border border-slate-700">
            <span className={`w-2.5 h-2.5 rounded-full ${isMongoConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300">
              {isMongoConnected ? 'MongoDB Đã kết nối' : 'Đang đợi kết nối MongoDB...'}
            </span>
          </div>

          {/* Re-seed MongoDB Database Button */}
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xoá toàn bộ dữ liệu data cũ và tạo lại database mới trong MongoDB?')) {
                reseedMongoDB();
              }
            }}
            disabled={isLoadingMongo}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Xoá toàn bộ data cũ và tạo lại database MongoDB mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMongo ? 'animate-spin' : ''}`} />
            Khởi tạo lại Database MongoDB
          </button>

          <button
            onClick={() => setCurrentView('home')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Xem trang bán hàng
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs shrink-0 self-start">
          <div className="space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Bảng điều khiển (Dashboard)
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Package className="w-4 h-4" /> Quản lý sản phẩm
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4" /> Quản lý danh mục
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" /> Quản lý đơn hàng
              </span>
              {pendingOrders.length > 0 && (
                <span className="text-[10px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                activeTab === 'customers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" /> Khách hàng
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                activeTab === 'coupons'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Tag className="w-4 h-4" /> Quản lý khuyến mãi
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                {coupons.length}
              </span>
            </button>
          </div>
        </aside>

        {/* Dynamic Admin View */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Tổng doanh thu</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xl font-black text-slate-900">{formatCurrency(totalRevenue)}</p>
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3 h-3" /> Tăng trưởng ổn định
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Tổng đơn hàng</span>
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xl font-black text-slate-900">{orders.length}</p>
                  <p className="text-[11px] text-amber-600 font-semibold">
                    {pendingOrders.length} đơn cần xác nhận
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Tổng sản phẩm</span>
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-xl font-black text-slate-900">{products.length}</p>
                  <p className="text-[11px] text-slate-400">Trên {categories.length} danh mục</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Tổng khách hàng</span>
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xl font-black text-slate-900">{users.length}</p>
                  <p className="text-[11px] text-purple-600 font-semibold">Đã đăng ký tài khoản</p>
                </div>
              </div>

              {/* Visual Analytics Bar chart & Status breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue simulation */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Biểu đồ doanh thu gần đây
                    </h3>
                    <span className="text-[10px] text-slate-400">Đơn vị: Triệu VNĐ</span>
                  </div>

                  <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
                    {[
                      { month: 'T4', rev: 25, label: '25M' },
                      { month: 'T5', rev: 38, label: '38M' },
                      { month: 'T6', rev: 45, label: '45M' },
                      { month: 'T7', rev: 62, label: '62M' },
                      { month: 'T8', rev: 78, label: '78M' },
                      { month: 'T9', rev: 94, label: '94M' },
                    ].map((bar) => (
                      <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-bold text-slate-600">{bar.label}</span>
                        <div
                          className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all"
                          style={{ height: `${(bar.rev / 100) * 100}%` }}
                        />
                        <span className="text-[11px] font-bold text-slate-500">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders by Status */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Trạng thái đơn hàng
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Chờ xác nhận
                      </span>
                      <strong className="text-slate-800">
                        {orders.filter((o) => o.status === 'pending').length}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                        <Package className="w-3.5 h-3.5" /> Đã xác nhận
                      </span>
                      <strong className="text-slate-800">
                        {orders.filter((o) => o.status === 'confirmed').length}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-purple-600 font-semibold">
                        <Truck className="w-3.5 h-3.5" /> Đang giao hàng
                      </span>
                      <strong className="text-slate-800">
                        {orders.filter((o) => o.status === 'shipping').length}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã giao thành công
                      </span>
                      <strong className="text-slate-800">
                        {orders.filter((o) => o.status === 'delivered').length}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                        <Ban className="w-3.5 h-3.5" /> Đã hủy
                      </span>
                      <strong className="text-slate-800">
                        {orders.filter((o) => o.status === 'cancelled').length}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low stock alert table */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Cảnh báo sản phẩm sắp hết hàng (&lt; 10 sản phẩm)
                  </h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    Xem tất cả sản phẩm →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Sản phẩm</th>
                        <th className="py-2.5 px-3">Giá bán</th>
                        <th className="py-2.5 px-3">Tồn kho</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lowStockProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-3 flex items-center gap-2 font-semibold text-slate-800">
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                            <span className="truncate max-w-[240px]">{p.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-red-600 font-bold">
                            {formatCurrency(p.discount_price || p.price)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-red-500">
                            Chỉ còn {p.stock}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="text-blue-600 hover:underline font-bold"
                            >
                              Nhập thêm hàng
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900">Quản lý sản phẩm TDShop</h2>
                  <p className="text-xs text-slate-500">Thêm, sửa, xóa, quản lý tồn kho và giá bán</p>
                </div>
                <button
                  onClick={() => handleOpenProductModal(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm sản phẩm mới
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm theo tên sản phẩm..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Hình ảnh</th>
                      <th className="py-3 px-3">Tên sản phẩm</th>
                      <th className="py-3 px-3">Danh mục</th>
                      <th className="py-3 px-3">Giá gốc / KM</th>
                      <th className="py-3 px-3">Tồn kho</th>
                      <th className="py-3 px-3">Trạng thái</th>
                      <th className="py-3 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const cat = categories.find((c) => c.id === p.category_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 max-w-[200px] truncate">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{cat?.name}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-red-600">
                              {formatCurrency(p.discount_price || p.price)}
                            </span>
                            {p.discount_price && (
                              <span className="block text-[10px] text-slate-400 line-through">
                                {formatCurrency(p.price)}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {p.stock <= 5 ? (
                              <span className="text-red-600">{p.stock} (Sắp hết)</span>
                            ) : (
                              <span className="text-slate-700">{p.stock}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => toggleProductStatus(p.id)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                p.is_active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {p.is_active ? 'Đang bán' : 'Ẩn'}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenProductModal(p)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Sửa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn chắc chắn muốn xóa "${p.name}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900">Quản lý danh mục sản phẩm</h2>
                  <p className="text-xs text-slate-500">Phân loại sản phẩm rõ ràng cho khách hàng</p>
                </div>
                <button
                  onClick={() => handleOpenCategoryModal(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm danh mục
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Tên danh mục</th>
                      <th className="py-3 px-3">Đường dẫn slug</th>
                      <th className="py-3 px-3">Mô tả</th>
                      <th className="py-3 px-3">Số lượng sản phẩm</th>
                      <th className="py-3 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((c) => {
                      const count = products.filter((p) => p.category_id === c.id).length;
                      return (
                        <tr key={c.id}>
                          <td className="py-3 px-3 font-bold text-slate-800">{c.name}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{c.slug}</td>
                          <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{c.description}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {count} sản phẩm
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenCategoryModal(c)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn chắc chắn muốn xóa danh mục "${c.name}"?`)) {
                                    deleteCategory(c.id);
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900">Quản lý đơn hàng</h2>
                  <p className="text-xs text-slate-500">Xử lý trạng thái và theo dõi lịch sử mua sắm</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-bold">Lọc:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 font-bold"
                  >
                    <option value="all">Tất cả ({orders.length})</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Mã đơn</th>
                      <th className="py-3 px-3">Khách hàng</th>
                      <th className="py-3 px-3">Ngày đặt</th>
                      <th className="py-3 px-3">Tổng tiền</th>
                      <th className="py-3 px-3">Thanh toán</th>
                      <th className="py-3 px-3">Trạng thái đơn</th>
                      <th className="py-3 px-3 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-mono font-bold text-blue-600">
                          #{o.order_code}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-800">{o.user_name}</p>
                          <p className="text-[10px] text-slate-400">{o.user_phone}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(o.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-3 font-bold text-red-600">
                          {formatCurrency(o.total_amount)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {o.payment_method === 'cod' ? 'Tiền mặt (COD)' : 'VietQR'}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="p-1 rounded-lg border border-slate-300 font-bold text-[11px]"
                          >
                            <option value="pending">⏳ Chờ xác nhận</option>
                            <option value="confirmed">📦 Đã xác nhận</option>
                            <option value="shipping">🚚 Đang giao hàng</option>
                            <option value="delivered">✅ Đã giao</option>
                            <option value="cancelled">❌ Đã hủy</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="text-blue-600 hover:underline font-bold"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900">Quản lý khách hàng</h2>
                <p className="text-xs text-slate-500">Danh sách tài khoản, khóa / mở khóa và lịch sử</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Khách hàng</th>
                      <th className="py-3 px-3">Email & SĐT</th>
                      <th className="py-3 px-3">Vai trò</th>
                      <th className="py-3 px-3">Số đơn mua</th>
                      <th className="py-3 px-3">Trạng thái</th>
                      <th className="py-3 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const userOrdersCount = orders.filter(
                        (o) => o.user_id === u.id || o.user_email === u.email
                      ).length;
                      return (
                        <tr key={u.id}>
                          <td className="py-3 px-3 flex items-center gap-2">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt={u.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="font-bold text-slate-800">{u.full_name}</span>
                          </td>
                          <td className="py-3 px-3">
                            <p className="text-slate-700">{u.email}</p>
                            <p className="text-[10px] text-slate-400">{u.phone}</p>
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            {u.is_admin ? (
                              <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-bold">
                                Quản trị viên
                              </span>
                            ) : (
                              <span className="text-slate-600">Khách hàng</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-700">
                            {userOrdersCount} đơn hàng
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.is_active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {u.is_active ? 'Đang hoạt động' : 'Đã bị khóa'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewCustomerHistory(u)}
                                className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-[11px] font-bold"
                              >
                                Lịch sử
                              </button>
                              {!u.is_admin && (
                                <button
                                  onClick={() => toggleUserLock(u.id)}
                                  className={`p-1.5 rounded-lg ${
                                    u.is_active
                                      ? 'text-amber-600 hover:bg-amber-50'
                                      : 'text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                                >
                                  {u.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              {!u.is_admin && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Bạn chắc chắn muốn xóa khách hàng "${u.full_name}"?`)) {
                                      deleteUser(u.id);
                                    }
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Xóa tài khoản"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS MANAGEMENT */}
          {activeTab === 'coupons' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900">Quản lý mã khuyến mãi</h2>
                  <p className="text-xs text-slate-500">Tạo voucher giảm giá % hoặc số tiền cố định</p>
                </div>
                <button
                  onClick={() => handleOpenCouponModal(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tạo mã giảm giá mới
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Mã Code</th>
                      <th className="py-3 px-3">Loại giảm & Giá trị</th>
                      <th className="py-3 px-3">Đơn tối thiểu</th>
                      <th className="py-3 px-3">Thời hạn</th>
                      <th className="py-3 px-3">Đã dùng</th>
                      <th className="py-3 px-3">Trạng thái</th>
                      <th className="py-3 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-3 font-mono font-bold text-blue-700 bg-blue-50/50">
                          {c.code}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600">
                          {c.discount_type === 'percent'
                            ? `Giảm ${c.discount_value}%`
                            : `Giảm ${formatCurrency(c.discount_value)}`}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {formatCurrency(c.min_order_amount)}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {c.start_date} → {c.end_date}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-700">{c.used_count} lượt</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {c.is_active ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenCouponModal(c)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn chắc chắn muốn xóa mã "${c.code}"?`)) {
                                  deleteCoupon(c.id);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD/EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingProduct ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Danh mục *</label>
                  <select
                    value={pCatId}
                    onChange={(e) => setPCatId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Giá gốc (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="25000000"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Giá khuyến mãi (nếu có)</label>
                  <input
                    type="number"
                    value={pDiscount}
                    onChange={(e) => setPDiscount(e.target.value)}
                    placeholder="22500000"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">URL hình ảnh sản phẩm</label>
                <input
                  type="text"
                  required
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Mô tả các tính năng nổi bật..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Ví dụ: Thiết Bị Đeo Thông Minh"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Slug đường dẫn (tùy chọn)</label>
                <input
                  type="text"
                  value={cSlug}
                  onChange={(e) => setCSlug(e.target.value)}
                  placeholder="thiet-bi-deo"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Tóm tắt về các sản phẩm trong danh mục này..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Lưu danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingCoupon ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
              </h3>
              <button onClick={() => setIsCouponModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mã giảm giá (Code) *</label>
                <input
                  type="text"
                  required
                  value={coupCode}
                  onChange={(e) => setCoupCode(e.target.value)}
                  placeholder="VD: TDSALE20"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Loại giảm *</label>
                  <select
                    value={coupType}
                    onChange={(e) => setCoupType(e.target.value as 'percent' | 'fixed')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Giá trị {coupType === 'percent' ? '(%)' : '(VNĐ)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={coupValue}
                    onChange={(e) => setCoupValue(e.target.value)}
                    placeholder={coupType === 'percent' ? '15' : '100000'}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Đơn hàng tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={coupMinOrder}
                  onChange={(e) => setCoupMinOrder(e.target.value)}
                  placeholder="500000"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={coupStart}
                    onChange={(e) => setCoupStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={coupEnd}
                    onChange={(e) => setCoupEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Lưu mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN ORDER DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Chi tiết đơn hàng #{selectedOrder.order_code}
                </h3>
                <p className="text-xs text-slate-400">
                  Đặt ngày {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p>Khách hàng: <strong>{selectedOrder.user_name}</strong> - {selectedOrder.user_phone}</p>
                <p>Email: {selectedOrder.user_email}</p>
                <p>Địa chỉ: {selectedOrder.shipping_address}</p>
                {selectedOrder.note && <p className="text-amber-700">Ghi chú: {selectedOrder.note}</p>}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <img src={it.product_image} alt={it.product_name} className="w-8 h-8 rounded object-cover" />
                      <div>
                        <p className="font-bold text-slate-800">{it.product_name}</p>
                        <p className="text-[10px] text-slate-400">{formatCurrency(it.price)} x {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-black">
                <span>Tổng giá trị đơn:</span>
                <span className="text-red-600 text-base">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  if (confirm(`Bạn chắc chắn muốn xóa đơn hàng #${selectedOrder.order_code}?`)) {
                    deleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }
                }}
                className="text-xs text-red-600 hover:underline font-bold"
              >
                Xóa đơn hàng
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER HISTORY */}
      {viewCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Lịch sử mua hàng: {viewCustomerHistory.full_name}
                </h3>
                <p className="text-xs text-slate-400">{viewCustomerHistory.email}</p>
              </div>
              <button onClick={() => setViewCustomerHistory(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {orders
                .filter(
                  (o) =>
                    o.user_id === viewCustomerHistory.id ||
                    o.user_email === viewCustomerHistory.email
                )
                .map((ord) => (
                  <div key={ord.id} className="p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-blue-600">#{ord.order_code}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{ord.items.length} mặt hàng</span>
                      <strong className="text-red-600">{formatCurrency(ord.total_amount)}</strong>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewCustomerHistory(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
