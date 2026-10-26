import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
  Code2,
  Package,
  PhoneCall,
  Info,
  LogOut,
  ChevronDown,
  Database,
} from 'lucide-react';
import { useStore, AppView } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartCount,
    searchQuery,
    setSearchQuery,
    currentUser,
    logout,
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsProfileModalOpen,
    setIsDjangoCodeModalOpen,
    setSelectedCategorySlug,
    categories,
    isMongoConnected,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView('products');
    }
  };

  const navigateTo = (view: AppView, catSlug: string | null = null) => {
    setSelectedCategorySlug(catSlug);
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              TDShop: Miễn phí vận chuyển cho đơn hàng từ 500.000₫
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> Hotline: 1900 8888 (8h00 - 21h30)
            </span>
          </div>
          <div className="flex items-center gap-4">
            {currentUser?.is_admin && (
              <button
                onClick={() => setCurrentView('admin')}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Quản trị Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo TDShop */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  TD<span className="text-blue-600">Shop</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Công Nghệ & Đời Sống
                </span>
              </div>
            </button>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-2 hidden sm:flex items-center relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm iPhone, Laptop, tai nghe, sạc nhanh..."
                className="w-full bg-slate-50 text-slate-800 text-sm pl-10 pr-24 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Django code button (mobile visible) */}
            <button
              onClick={() => setIsDjangoCodeModalOpen(true)}
              title="Xem kiến trúc Django + MySQL"
              className="md:hidden p-2 text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Code2 className="w-5 h-5" />
            </button>

            {/* MongoDB status indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
                isMongoConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isMongoConnected ? 'Đã kết nối MongoDB thành công' : 'Đang tìm kiếm server backend MongoDB'}
            >
              <span className={`w-2 h-2 rounded-full ${isMongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Database className="w-3.5 h-3.5" />
              <span>{isMongoConnected ? 'MongoDB' : 'Offline'}</span>
            </div>

            {/* Admin quick toggle */}
            {currentUser?.is_admin && (
              <button
                onClick={() => setCurrentView(currentView === 'admin' ? 'home' : 'admin')}
                className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                {currentView === 'admin' ? 'Về cửa hàng' : 'Trang Admin'}
              </button>
            )}

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {currentUser.full_name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {currentUser.is_admin ? 'Quản trị viên' : 'Khách hàng'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4" /> Tài khoản & Đơn mua
                    </button>

                    {currentUser.is_admin && (
                      <button
                        onClick={() => setCurrentView('admin')}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-sky-500" /> Bảng điều khiển Admin
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden sm:inline-flex text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setCurrentView('cart')}
              className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer group"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-scale">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <form onSubmit={handleSearchSubmit} className="pb-3 sm:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm tại TDShop..."
              className="w-full bg-slate-50 text-slate-800 text-xs pl-9 pr-18 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded"
            >
              Tìm
            </button>
          </div>
        </form>

        {/* Desktop Categories & Menu bar */}
        <nav className="hidden md:flex items-center justify-between border-t border-slate-100 py-2.5 text-sm">
          <div className="flex items-center gap-7">
            {/* Category dropdown toggle */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4 text-blue-600" />
                Danh mục sản phẩm
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                  onClick={() => setIsCategoryDropdownOpen(false)}
                >
                  <button
                    onClick={() => navigateTo('products', null)}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Tất cả danh mục ({categories.length})
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navigateTo('products', cat.slug)}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400">Xem ngay →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Menu Items */}
            <button
              onClick={() => navigateTo('home')}
              className={`font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                currentView === 'home' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Trang chủ
            </button>

            <button
              onClick={() => navigateTo('products')}
              className={`font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                currentView === 'products' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Sản phẩm
            </button>

            <button
              onClick={() => navigateTo('about')}
              className={`font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                currentView === 'about' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Giới thiệu
            </button>

            <button
              onClick={() => navigateTo('contact')}
              className={`font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                currentView === 'contact' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Liên hệ
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              ✓ Đổi mới 7 ngày miễn phí
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-600 font-semibold">
              ✓ 100% Chính hãng VN/A
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <button
              onClick={() => navigateTo('home')}
              className={`p-2.5 rounded-lg ${currentView === 'home' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => navigateTo('products')}
              className={`p-2.5 rounded-lg ${currentView === 'products' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}
            >
              Tất cả sản phẩm
            </button>
          </div>

          <div className="border-t border-slate-100 pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Danh mục sản phẩm:
            </p>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigateTo('products', cat.slug)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                  <span className="text-slate-400">→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <button
              onClick={() => setIsDjangoCodeModalOpen(true)}
              className="w-full py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center justify-center gap-2"
            >
              <Code2 className="w-4 h-4" /> Xem Mã Nguồn Django + MySQL
            </button>
            {currentUser?.is_admin && (
              <button
                onClick={() => navigateTo('admin')}
                className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Vào Trang Quản Trị Admin
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
