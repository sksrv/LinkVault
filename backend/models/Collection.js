import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [60, 'Name too long'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Description too long'],
    },
    // URL-friendly name e.g. "my-react-resources"
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Array of link IDs belonging to this collection
    links: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link',
      },
    ],
    // How many times others copied this collection
    copyCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

// Auto-generate slug from name before saving
collectionSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
      .replace(/\s+/g, '-')            // spaces  dashes
      .replace(/-+/g, '-')             // multiple dashes  one
  }
  next()
})

// Each user can only have one collection with the same slug
collectionSchema.index({ owner: 1, slug: 1 }, { unique: true })

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection