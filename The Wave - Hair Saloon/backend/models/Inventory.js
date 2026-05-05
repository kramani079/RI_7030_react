import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  qty: { type: Number, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  lowStock: { type: Number, required: true }
}, { timestamps: true });

inventorySchema.methods.toJSON = function() {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
};

export default mongoose.model('Inventory', inventorySchema);
