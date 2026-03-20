import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    favicon: {
      type: String,
      default: '',
    },
    siteName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast search
linkSchema.index({ user: 1, createdAt: -1 });
linkSchema.index({ title: 'text', description: 'text', notes: 'text' });

const Link = mongoose.model('Link', linkSchema);

export default Link;