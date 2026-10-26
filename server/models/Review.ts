import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    product_id: { type: String, required: true, index: true },
    user_name: { type: String, required: true, trim: true },
    user_avatar: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
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

export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export default ReviewModel;
