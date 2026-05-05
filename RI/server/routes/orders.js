const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Middleware to check DB connection
function checkDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database is currently unavailable. Please try again later.' });
  }
  next();
}

// GET /api/orders
router.get('/', checkDB, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const mapped = orders.map(o => ({
      id: o.orderId,
      customer: o.customer,
      email: o.email,
      product: o.product,
      productId: o.productId,
      qty: o.qty,
      unitPrice: o.unitPrice,
      amount: o.amount,
      dueDate: o.dueDate,
      production: o.production,
      status: o.status,
      _id: o._id,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get orders error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to fetch orders. Please try again.' });
  }
});

// POST /api/orders
router.post('/', checkDB, async (req, res) => {
  try {
    const { id, customer, email, product, productId, qty, unitPrice, amount, dueDate, production, status } = req.body;
    
    if (!customer || !product) {
      return res.status(400).json({ error: 'Customer and product are required' });
    }

    const order = await Order.create({
      orderId: id, customer, email, product, productId,
      qty, unitPrice, amount, dueDate,
      production: production || { C: false, F: false, G: false, P: false },
      status: status || 'Pending',
    });
    res.status(201).json({
      id: order.orderId, customer: order.customer, email: order.email,
      product: order.product, productId: order.productId,
      qty: order.qty, unitPrice: order.unitPrice, amount: order.amount,
      dueDate: order.dueDate, production: order.production, status: order.status,
    });
  } catch (err) {
    console.error('Create order error:', err.message);
    if (err.code === 11000) {
      res.status(400).json({ error: 'Order ID already exists. Please try again.' });
    } else {
      res.status(500).json({ error: 'Database error: Unable to create order. Please try again.' });
    }
  }
});

// PUT /api/orders/:orderId
router.put('/:orderId', checkDB, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      req.body,
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({
      id: order.orderId, customer: order.customer, email: order.email,
      product: order.product, productId: order.productId,
      qty: order.qty, unitPrice: order.unitPrice, amount: order.amount,
      dueDate: order.dueDate, production: order.production, status: order.status,
    });
  } catch (err) {
    console.error('Update order error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to update order. Please try again.' });
  }
});

// DELETE /api/orders/:orderId
router.delete('/:orderId', checkDB, async (req, res) => {
  try {
    const result = await Order.findOneAndDelete({ orderId: req.params.orderId });
    if (!result) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete order error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to delete order. Please try again.' });
  }
});

module.exports = router;
