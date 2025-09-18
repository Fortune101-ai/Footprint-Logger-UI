import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  activity: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  co2Emissions: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Activity', activitySchema);
