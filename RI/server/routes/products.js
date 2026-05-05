const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Middleware to check DB connection
function checkDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database is currently unavailable. Please try again later.' });
  }
  next();
}

// GET /api/products
router.get('/', checkDB, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Map to frontend format
    const mapped = products.map(p => ({
      id: p.productId,
      name: p.name,
      stock: p.stock,
      lowStock: p.lowStock,
      unitCost: p.unitCost,
      production: p.production,
      _id: p._id,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get products error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to fetch products. Please try again.' });
  }
});

// POST /api/products
router.post('/', checkDB, async (req, res) => {
  try {
    const { id, name, stock, lowStock, unitCost, production } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Check for duplicate productId
    const exists = await Product.findOne({ productId: id });
    if (exists) {
      return res.status(400).json({ error: `Product ID ${id} already exists` });
    }

    const product = await Product.create({
      productId: id,
      name, stock,
      lowStock: lowStock || stock < 15,
      unitCost: unitCost || 0,
      production: production || { C: false, F: false, G: false, P: false },
    });
    res.status(201).json({
      id: product.productId, name: product.name, stock: product.stock,
      lowStock: product.lowStock, unitCost: product.unitCost, production: product.production,
    });
  } catch (err) {
    console.error('Create product error:', err.message);
    if (err.code === 11000) {
      res.status(400).json({ error: 'Product ID already exists. Please use a different ID.' });
    } else {
      res.status(500).json({ error: 'Database error: Unable to create product. Please try again.' });
    }
  }
});

// PUT /api/products/:productId
router.put('/:productId', checkDB, async (req, res) => {
  try {
    const { name, stock, lowStock, unitCost, production } = req.body;
    const product = await Product.findOneAndUpdate(
      { productId: req.params.productId },
      { name, stock, lowStock: lowStock !== undefined ? lowStock : stock < 15, unitCost, production },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({
      id: product.productId, name: product.name, stock: product.stock,
      lowStock: product.lowStock, unitCost: product.unitCost, production: product.production,
    });
  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to update product. Please try again.' });
  }
});

// DELETE /api/products/:productId
router.delete('/:productId', checkDB, async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({ productId: req.params.productId });
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to delete product. Please try again.' });
  }
});

module.exports = router;
