import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import CategoryModel from './models/Category';
import ProductModel from './models/Product';
import UserModel from './models/User';
import OrderModel from './models/Order';
import CouponModel from './models/Coupon';
import ReviewModel from './models/Review';
import { seedDatabase } from './seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Health check & MongoDB status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: 'MongoDB',
    connected: true,
    message: 'Backend server và MongoDB đang hoạt động hoàn hảo!',
  });
});

// 2. Reset / Re-seed Database endpoint
app.post('/api/seed', async (_req: Request, res: Response) => {
  try {
    const result = await seedDatabase();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi khởi tạo database' });
  }
});

// ================= CATEGORIES =================
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const category = new CategoryModel(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const updated = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    await CategoryModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá danh mục' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ================= PRODUCTS =================
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const filter: any = {};
    if (category && category !== 'all') {
      filter.category_id = category;
    }
    if (search) {
      filter.name = { $regex: search as string, $options: 'i' };
    }
    const products = await ProductModel.find(filter).sort({ created_at: -1 });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const product = new ProductModel(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const updated = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    await ProductModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá sản phẩm' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ================= ORDERS =================
app.get('/api/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find().sort({ created_at: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    if (!orderData.order_code) {
      orderData.order_code = `TD-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    const order = new OrderModel(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await OrderModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    await OrderModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá đơn hàng' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ================= COUPONS =================
app.get('/api/coupons', async (_req: Request, res: Response) => {
  try {
    const coupons = await CouponModel.find();
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/coupons', async (req: Request, res: Response) => {
  try {
    const coupon = new CouponModel(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/coupons/:id', async (req: Request, res: Response) => {
  try {
    const updated = await CouponModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/coupons/:id', async (req: Request, res: Response) => {
  try {
    await CouponModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá mã giảm giá' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ================= USERS & AUTH =================
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find().sort({ created_at: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị tạm khóa!' });
    }
    if (user.password && user.password !== password) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác!' });
    }
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, full_name, phone, password } = req.body;
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký!' });
    }
    const username = email.split('@')[0] + Math.floor(Math.random() * 100);
    const user = new UserModel({
      username,
      email,
      full_name,
      phone: phone || '',
      password: password || '123456',
      is_admin: false,
      is_active: true,
      address: '',
    });
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const updated = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá người dùng' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ================= REVIEWS =================
app.get('/api/reviews', async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    const filter = productId ? { product_id: productId } : {};
    const reviews = await ReviewModel.find(filter).sort({ created_at: -1 });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const review = new ReviewModel(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Start Server & Connect MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Express] Server is running on http://localhost:${PORT}`);
      console.log(`[API] Health check endpoint: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('[Startup] Failed to start server:', err);
  });
