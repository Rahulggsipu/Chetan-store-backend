import { Request, Response } from 'express';
import { Product } from '../models/Product';

/**
 * GET /api/products
 *
 * Query params:
 * category=toys
 * minPrice=100
 * maxPrice=1000
 * sort=price_asc
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    const filter: Record<string, unknown> = {
      isActive: true
    };

    // Category filter
    if (category) {
      if (!['toys', 'chocolates'].includes(category as string)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
        return;
      }

      filter.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};

      if (minPrice) {
        priceFilter.$gte = Number(minPrice);
      }

      if (maxPrice) {
        priceFilter.$lte = Number(maxPrice);
      }

      filter.price = priceFilter;
    }

    // Sorting
    let sortOption: Record<string, 1 | -1> = {
      createdAt: -1
    };

    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    }

    if (sort === 'price_desc') {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * GET /api/products/:id
 */
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      isActive: true
    }).lean();

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

/**
 * POST /api/products
 */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      category,
      imageUrl,
      stock
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !imageUrl ||
      stock === undefined
    ) {
      res.status(400).json({
        success: false,
        message: 'All product fields are required'
      });

      return;
    }

    if (!['toys', 'chocolates'].includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category'
      });

      return;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

/**
 * PUT /api/products/:id
 */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
      isActive
    } = req.body;

    if (category && !['toys', 'chocolates'].includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category'
      });

      return;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        imageUrl,
        stock,
        isActive
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

/**
 * DELETE /api/products/:id
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        isActive: false
      },
      {
        new: true
      }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product removed successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

/**
 * PATCH /api/products/:id/stock
 */
export const updateStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      res.status(400).json({
        success: false,
        message: 'Valid stock value is required'
      });

      return;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        stock
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update stock error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
};