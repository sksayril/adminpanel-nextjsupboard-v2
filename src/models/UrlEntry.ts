import mongoose from 'mongoose';

const UrlEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.UrlEntry || mongoose.model('UrlEntry', UrlEntrySchema);
