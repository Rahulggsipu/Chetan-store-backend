import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { sendOrderWhatsAppMessage } from '../services/whatsapp.service';

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { customer, items, paymentMethod } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.address) {
      res.status(400).json({
        success: false,
        message: 'Name, phone and address are required',
      });
      return;
    }

    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
      return;
    }

    if (paymentMethod !== 'COD') {
      res.status(400).json({
        success: false,
        message: 'Only Cash on Delivery is supported',
      });
      return;
    }

    const orderItems = [];
    let totalAmount = 0;

    // Validate products and calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
        return;
      }

      if (!product.isActive) {
        res.status(400).json({
          success: false,
          message: `${product.name} is no longer available`,
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `${product.name} has only ${product.stock} items available`,
        });
        return;
      }

      const subtotal = product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal,
      });

      totalAmount += subtotal;
    }

    // Reduce inventory
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          new: true,
        }
      );

      if (!product) {
        res.status(400).json({
          success: false,
          message:
            'Stock changed while placing the order. Please try again.',
        });
        return;
      }
    }

    // Create order
    const order = await Order.create({
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      },
      items: orderItems,
      totalAmount,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
    });

    // Send WhatsApp confirmation
    try {
      await sendOrderWhatsAppMessage({
        phone: customer.phone,
        customerName: customer.name,
        orderId: order._id.toString(),
        items: orderItems,
        totalAmount,
      });
    } catch (whatsappError) {
      // WhatsApp failure should NOT fail the order
      console.error(
        'WhatsApp notification failed:',
        whatsappError
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
  }
};