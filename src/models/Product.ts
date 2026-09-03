import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: 'toys' | 'chocolates';
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    category: {
      type: String,
      enum: ['toys', 'chocolates'],
      required: true
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model<IProduct>(
  'Product',
  productSchema
);