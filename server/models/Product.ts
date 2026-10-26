import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
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

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    category_id: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    discount_price: { type: Number, min: 0 },
    description: { type: String, default: '' },
    specs: { type: Map, of: String, default: {} },
    image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    reviews_count: { type: Number, default: 0, min: 0 },
    is_active: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    is_new: { type: Boolean, default: true },
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

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default ProductModel;
