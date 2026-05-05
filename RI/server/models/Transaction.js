const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txId:          { type: String, required: true, unique: true },  // RI_3001
  type:          { type: String, enum: ['Buy', 'Sell'], required: true },
  party:         { type: String, required: true },
  product:       { type: String, required: true },
  productId:     { type: String, default: '' },
  qty:           { type: String, required: true },
  amount:        { type: String, required: true },
  rate:          { type: String, default: '0' },
  paymentMethod: { type: String, default: 'Pending' },
  date:          { type: String, required: true },
  status:        { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
