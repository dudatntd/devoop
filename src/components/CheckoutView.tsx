import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Truck,
  Copy,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    discountAmount,
    cartTotal,
    appliedCoupon,
    createOrder,
    currentUser,
    setCurrentView,
    formatCurrency,
    setActiveOrderId,
  } = useStore();

  // Form State
  const [name, setName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking' | 'vnpay'>('cod');

  // Placed Order Result State
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không có sản phẩm nào để thanh toán</h2>
        <button
          onClick={() => setCurrentView('products')}
          className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
        >
          Quay lại mua sắm
        </button>
      </div>
    );
  }

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!');
      return;
    }

    const order = await createOrder({
      customerName: name.trim(),
      customerEmail: email.trim() || 'guest@tdshop.vn',
      customerPhone: phone.trim(),
      shippingAddress: address.trim(),
      paymentMethod,
      note: note.trim(),
    });

    setCreatedOrder(order);
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // SUCCESS SCREEN
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 text-center animate-in fade-in zoom-in-95">
          <div className="w-18 h-18 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Đặt hàng thành công!
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Cảm ơn bạn đã tin tưởng mua sắm tại TDShop. Đơn hàng của bạn đã được ghi nhận vào hệ thống và đang được xử lý.
            </p>
          </div>

          {/* Order Code Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs text-slate-400">Mã đơn hàng:</span>
                <p className="text-lg font-black text-blue-600 font-mono tracking-wider">
                  {createdOrder.order_code}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Thời gian đặt:</span>
                <p className="text-xs font-semibold text-slate-700">
                  {new Date(createdOrder.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Người nhận:</p>
                <p className="font-bold text-slate-800">{createdOrder.user_name} - {createdOrder.user_phone}</p>
              </div>
              <div>
                <p className="text-slate-400">Phương thức thanh toán:</p>
                <p className="font-bold text-slate-800">
                  {createdOrder.payment_method === 'cod'
                    ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                    : createdOrder.payment_method === 'banking'
                    ? 'Chuyển khoản VietQR Ngân hàng'
                    : 'Ví điện tử VNPAY'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-400">Địa chỉ giao hàng:</p>
                <p className="font-semibold text-slate-800">{createdOrder.shipping_address}</p>
              </div>
            </div>

            {/* If Banking, show QR Code instructions */}
            {createdOrder.payment_method === 'banking' && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-left space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  Thông tin chuyển khoản nhanh VietQR:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1 text-xs text-slate-700">
                    <p>Ngân hàng: <strong className="text-slate-900">MBBank (Ngân Hàng Quân Đội)</strong></p>
                    <div className="flex items-center gap-2">
                      <span>Số tài khoản: <strong className="text-blue-700 font-mono text-sm">99998888TDSHOP</strong></span>
                      <button
                        onClick={() => handleCopyAccount('99998888TDSHOP')}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="Sao chép STK"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p>Chủ tài khoản: <strong className="text-slate-900 uppercase">CONG TY TNHH CONG NGHE TDSHOP</strong></p>
                    <p>Số tiền: <strong className="text-red-600 font-black">{formatCurrency(createdOrder.total_amount)}</strong></p>
                    <p>Nội dung CK: <strong className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-blue-800">{createdOrder.order_code}</strong></p>
                  </div>
                  <div className="flex justify-center">
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-blue-200 flex flex-col items-center">
                      <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400">
                        <QrCode className="w-24 h-24 text-blue-600" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-1">Quét mã bằng app ngân hàng</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="pt-2 flex justify-between items-center text-sm font-black border-t border-slate-200">
              <span>Tổng tiền đơn hàng:</span>
              <span className="text-xl text-red-600">{formatCurrency(createdOrder.total_amount)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setActiveOrderId(createdOrder.id);
                setCreatedOrder(null);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Theo dõi đơn hàng của tôi
            </button>
            <button
              onClick={() => {
                setCreatedOrder(null);
                setCurrentView('home');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tiếp tục mua hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT FORM
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={() => setCurrentView('cart')} className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại giỏ hàng
        </button>
        <span>/</span>
        <span className="font-bold text-slate-800">Thanh toán đơn hàng</span>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Shipping Info & Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck className="w-5 h-5 text-blue-600" />
              1. Thông tin người nhận & Địa chỉ giao hàng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0987654321"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Email nhận thông báo đơn hàng</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@vidu.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Địa chỉ nhận hàng chi tiết *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Ghi chú giao hàng (nếu có)</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến 15 phút..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-blue-600" />
              2. Phương thức thanh toán
            </h2>

            <div className="space-y-3">
              {/* COD Option */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      Phổ biến nhất
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Quý khách thanh toán tiền mặt trực tiếp cho nhân viên giao hàng sau khi đồng kiểm bưu kiện.
                  </p>
                </div>
              </label>

              {/* VietQR Banking Option */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'banking'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'banking'}
                  onChange={() => setPaymentMethod('banking')}
                  className="mt-1 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Chuyển khoản VietQR siêu tốc
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                      Tự động xác nhận
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Quét mã QR tự động điền số tài khoản và số tiền trên ứng dụng ngân hàng bất kỳ.
                  </p>
                </div>
              </label>

              {/* VNPAY / Card Option */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'vnpay'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => setPaymentMethod('vnpay')}
                  className="mt-1 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Thẻ tín dụng / Thẻ ATM nội địa (VNPAY)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Hỗ trợ thẻ Visa, Mastercard, JCB và 40+ ngân hàng nội địa Việt Nam.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Items Review & Confirm Button */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Chi tiết giỏ hàng ({cart.length} món)
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => {
                const unitPrice = item.product.discount_price || item.product.price;
                return (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-slate-400 text-[11px]">
                        {formatCurrency(unitPrice)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatCurrency(unitPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Mã {appliedCoupon?.code}:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span className="text-emerald-600 font-semibold">0₫ (Miễn phí)</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="text-xl font-black text-red-600">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" /> Xác nhận đặt hàng
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Bảo mật thanh toán & thông tin khách hàng 100%
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
