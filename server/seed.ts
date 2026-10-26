import mongoose from 'mongoose';
import { connectDB } from './config/db';
import CategoryModel from './models/Category';
import ProductModel from './models/Product';
import UserModel from './models/User';
import OrderModel from './models/Order';
import CouponModel from './models/Coupon';
import ReviewModel from './models/Review';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from '../src/data/mockData';

export const seedDatabase = async () => {
  console.log('[Seed] Đang kết nối tới MongoDB để khởi tạo lại database mới...');
  await connectDB();

  console.log('[Seed] 1. Xoá toàn bộ dữ liệu data cũ trong các collection MongoDB...');
  await Promise.all([
    CategoryModel.deleteMany({}),
    ProductModel.deleteMany({}),
    UserModel.deleteMany({}),
    OrderModel.deleteMany({}),
    CouponModel.deleteMany({}),
    ReviewModel.deleteMany({}),
  ]);
  console.log('[Seed] ✓ Đã xoá sạch dữ liệu cũ thành công!');

  console.log('[Seed] 2. Tạo dữ liệu danh mục mới (Categories)...');
  const createdCategories = await CategoryModel.insertMany(
    INITIAL_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      iconName: c.iconName,
      description: c.description,
      image: c.image,
    }))
  );

  // Map category slug to real MongoDB _id
  const catMap = new Map<string, string>();
  createdCategories.forEach((cat) => {
    catMap.set(cat.slug, cat._id.toString());
  });

  console.log('[Seed] 3. Tạo dữ liệu sản phẩm mới (Products)...');
  const productsToInsert = INITIAL_PRODUCTS.map((p) => {
    let catId = p.category_id;
    if (p.category_id === 'cat-phone' && catMap.has('dien-thoai')) {
      catId = catMap.get('dien-thoai')!;
    } else if (p.category_id === 'cat-laptop' && catMap.has('laptop')) {
      catId = catMap.get('laptop')!;
    } else if (p.category_id === 'cat-audio' && catMap.has('tai-nghe')) {
      catId = catMap.get('tai-nghe')!;
    } else if (p.category_id === 'cat-accessory' && catMap.has('phu-kien')) {
      catId = catMap.get('phu-kien')!;
    }

    return {
      name: p.name,
      slug: p.slug,
      category_id: catId,
      price: p.price,
      discount_price: p.discount_price,
      description: p.description,
      specs: p.specs || {},
      image: p.image,
      gallery: p.gallery || [p.image],
      stock: p.stock,
      rating: p.rating,
      reviews_count: p.reviews_count,
      is_active: p.is_active,
      is_featured: p.is_featured,
      is_new: p.is_new,
    };
  });
  const createdProducts = await ProductModel.insertMany(productsToInsert);

  console.log('[Seed] 4. Tạo tài khoản người dùng mới (Users)...');
  const createdUsers = await UserModel.insertMany(
    INITIAL_USERS.map((u) => ({
      username: u.username,
      email: u.email,
      password: u.password || 'password123',
      full_name: u.full_name,
      phone: u.phone,
      address: u.address,
      avatar: u.avatar,
      is_admin: u.is_admin,
      is_active: u.is_active,
    }))
  );

  console.log('[Seed] 5. Tạo mã giảm giá mới (Coupons)...');
  const createdCoupons = await CouponModel.insertMany(
    INITIAL_COUPONS.map((c) => ({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount,
      start_date: c.start_date,
      end_date: c.end_date,
      is_active: c.is_active,
      used_count: c.used_count,
    }))
  );

  console.log('[Seed] 6. Tạo đơn hàng mới (Orders)...');
  const sampleProduct = createdProducts[0];
  const sampleCustomer = createdUsers.find((u) => !u.is_admin) || createdUsers[0];

  const createdOrders = await OrderModel.insertMany(
    INITIAL_ORDERS.map((o) => ({
      order_code: o.order_code,
      user_id: sampleCustomer._id.toString(),
      user_name: o.user_name,
      user_email: o.user_email,
      user_phone: o.user_phone,
      shipping_address: o.shipping_address,
      payment_method: o.payment_method,
      note: o.note,
      total_amount: o.total_amount,
      subtotal_amount: o.subtotal_amount,
      discount_amount: o.discount_amount,
      coupon_code: o.coupon_code,
      status: o.status,
      items: [
        {
          product_id: sampleProduct ? sampleProduct._id.toString() : 'prod-1',
          product_name: sampleProduct ? sampleProduct.name : o.items[0]?.product_name,
          product_image: sampleProduct ? sampleProduct.image : o.items[0]?.product_image,
          price: sampleProduct ? (sampleProduct.discount_price || sampleProduct.price) : 28990000,
          quantity: 1,
        },
      ],
    }))
  );

  console.log('[Seed] 7. Tạo đánh giá sản phẩm mới (Reviews)...');
  const createdReviews = await ReviewModel.insertMany(
    INITIAL_REVIEWS.map((r) => ({
      product_id: sampleProduct ? sampleProduct._id.toString() : 'prod-1',
      user_name: r.user_name,
      rating: r.rating,
      comment: r.comment,
    }))
  );

  console.log('----------------------------------------------------');
  console.log('✓ KHỞI TẠO DATABASE MỚI CHO MONGODB THÀNH CÔNG!');
  console.log(`- Danh mục (Categories): ${createdCategories.length}`);
  console.log(`- Sản phẩm (Products):   ${createdProducts.length}`);
  console.log(`- Người dùng (Users):    ${createdUsers.length}`);
  console.log(`- Mã giảm giá (Coupons): ${createdCoupons.length}`);
  console.log(`- Đơn hàng (Orders):     ${createdOrders.length}`);
  console.log(`- Đánh giá (Reviews):    ${createdReviews.length}`);
  console.log('----------------------------------------------------');

  return {
    success: true,
    message: 'Khởi tạo database MongoDB mới thành công!',
    counts: {
      categories: createdCategories.length,
      products: createdProducts.length,
      users: createdUsers.length,
      coupons: createdCoupons.length,
      orders: createdOrders.length,
      reviews: createdReviews.length,
    },
  };
};

// Run directly from CLI
if (process.argv[1] && process.argv[1].includes('seed')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Hoàn tất, đóng kết nối MongoDB.');
      return mongoose.connection.close();
    })
    .catch((err) => {
      console.error('[Seed] Lỗi khi tạo database mới:', err);
      process.exit(1);
    });
}
