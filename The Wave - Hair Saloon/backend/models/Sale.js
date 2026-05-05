import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  date: { type: String, required: true },
  customer: { type: String },
  items: { type: Array, default: [] },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI'], default: 'Cash' },
  note: { type: String }
}, { timestamps: true });

saleSchema.methods.toJSON = function() {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
};

export default mongoose.model('Sale', saleSchema);
