const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId:    { type: String, required: true, unique: true },  // RI_2001
  customer:   { type: String, required: true },
  email:      { type: String, default: '' },
  product:    { type: String, required: true },
  productId:  { type: String, default: '' },
  qty:        { type: Number, required: true },
  unitPrice:  { type: String, default: '0' },
  amount:     { type: String, default: '' },
  dueDate:    { type: String, default: '' },
  production: {
    C: { type: Boolean, default: false },
    F: { type: Boolean, default: false },
    G: { type: Boolean, default: false },
    P: { type: Boolean, default: false },
  },
  status:     { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
