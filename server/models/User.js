import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: [80, 'Name is too long'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '', trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

schema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', schema);
