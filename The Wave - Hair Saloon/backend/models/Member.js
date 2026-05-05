import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  months: { type: Number, required: true },
  startDate: { type: String, required: true },
  amount: { type: Number, default: 0 },
  services: { type: Object, default: {} },
  usageHistory: { type: Array, default: [] }
}, { timestamps: true });

memberSchema.methods.toJSON = function() {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
};

export default mongoose.model('Member', memberSchema);
