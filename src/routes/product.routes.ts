import { Router } from 'express';

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} from '../controllers/product.controller';

const router = Router();

// Customer APIs
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin APIs
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

export default router;