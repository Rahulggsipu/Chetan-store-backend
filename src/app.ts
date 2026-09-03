import express from 'express';
import cors from 'cors';

import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log('REQUEST:', req.method, req.originalUrl);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API is running'
  });
});

app.use('/api/products', productRoutes);

app.use('/api/orders', orderRoutes);

export default app;