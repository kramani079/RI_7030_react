const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Middleware to check DB connection
function checkDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database is currently unavailable. Please try again later.' });
  }
  next();
}

// GET /api/transactions
router.get('/', checkDB, async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ createdAt: -1 });
    const mapped = txns.map(t => ({
      id: t.txId,
      type: t.type,
      party: t.party,
      product: t.product,
      productId: t.productId,
      qty: t.qty,
      amount: t.amount,
      rate: t.rate,
      paymentMethod: t.paymentMethod,
      date: t.date,
      status: t.status,
      _id: t._id,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get transactions error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to fetch transactions. Please try again.' });
  }
});

// POST /api/transactions
router.post('/', checkDB, async (req, res) => {
  try {
    const { id, type, party, product, productId, qty, amount, rate, paymentMethod, date, status } = req.body;
    
    if (!type || !party || !product) {
      return res.status(400).json({ error: 'Type, party, and product are required' });
    }

    const txn = await Transaction.create({
      txId: id, type, party, product, productId,
      qty, amount, rate: rate || '0',
      paymentMethod: paymentMethod || 'Pending',
      date, status: status || 'Pending',
    });
    res.status(201).json({
      id: txn.txId, type: txn.type, party: txn.party,
      product: txn.product, productId: txn.productId,
      qty: txn.qty, amount: txn.amount, rate: txn.rate,
      paymentMethod: txn.paymentMethod, date: txn.date, status: txn.status,
    });
  } catch (err) {
    console.error('Create transaction error:', err.message);
    if (err.code === 11000) {
      res.status(400).json({ error: 'Transaction ID already exists. Please try again.' });
    } else {
      res.status(500).json({ error: 'Database error: Unable to save transaction. Please try again.' });
    }
  }
});

// PUT /api/transactions/:txId
router.put('/:txId', checkDB, async (req, res) => {
  try {
    const txn = await Transaction.findOneAndUpdate(
      { txId: req.params.txId },
      req.body,
      { new: true }
    );
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json({
      id: txn.txId, type: txn.type, party: txn.party,
      product: txn.product, productId: txn.productId,
      qty: txn.qty, amount: txn.amount, rate: txn.rate,
      paymentMethod: txn.paymentMethod, date: txn.date, status: txn.status,
    });
  } catch (err) {
    console.error('Update transaction error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to update transaction. Please try again.' });
  }
});

// DELETE /api/transactions/:txId
router.delete('/:txId', checkDB, async (req, res) => {
  try {
    const result = await Transaction.findOneAndDelete({ txId: req.params.txId });
    if (!result) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err.message);
    res.status(500).json({ error: 'Database error: Unable to delete transaction. Please try again.' });
  }
});

module.exports = router;
