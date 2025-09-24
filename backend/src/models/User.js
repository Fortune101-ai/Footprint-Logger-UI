import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role:{ type: String, enum: ['guest', 'user'], default: 'guest' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
