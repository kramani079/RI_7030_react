import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String },
  services: { type: String },
  employee: { type: String },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

// Convert the _id seamlessly exactly how frontend expects `id`
bookingSchema.methods.toJSON = function() {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
};

export default mongoose.model('Booking', bookingSchema);
