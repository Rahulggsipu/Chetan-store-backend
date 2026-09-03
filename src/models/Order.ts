import mongoose, { Document, Schema } from 'mongoose';

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface ICustomer {
  name: string;
  phone: string;
  address: string;
}

export interface IOrder extends Document {
  customer: ICustomer;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: 'COD';
  paymentStatus: 'PENDING' | 'PAID';
  orderStatus: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      }
    },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        subtotal: {
          type: Number,
          required: true
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    paymentMethod: {
      type: String,
      enum: ['COD'],
      default: 'COD'
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING'
    },

    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED'
      ],
      default: 'PLACED'
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
