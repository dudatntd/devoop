import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
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
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  items: IOrderItem[];
  created_at: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    product_image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    order_code: { type: String, required: true, unique: true, uppercase: true },
    user_id: { type: String, default: 'guest' },
    user_name: { type: String, required: true },
    user_email: { type: String, default: '' },
    user_phone: { type: String, required: true },
    shipping_address: { type: String, required: true },
    payment_method: { type: String, enum: ['cod', 'banking', 'vnpay'], default: 'cod' },
    note: { type: String, default: '' },
    total_amount: { type: Number, required: true, min: 0 },
    subtotal_amount: { type: Number, required: true, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    coupon_code: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    items: { type: [OrderItemSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default OrderModel;
