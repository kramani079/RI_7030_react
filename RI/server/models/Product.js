const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId:  { type: String, required: true, unique: true },  // RI_1001
  name:       { type: String, required: true },
  stock:      { type: Number, default: 0 },
  lowStock:   { type: Boolean, default: false },
  unitCost:   { type: Number, default: 0 },
  production: {
    C: { type: Boolean, default: false },  // Casting
    F: { type: Boolean, default: false },  // Finishing
    G: { type: Boolean, default: false },  // Gold Plating
    P: { type: Boolean, default: false },  // Packaging
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
