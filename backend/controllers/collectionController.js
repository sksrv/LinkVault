import Collection from '../models/Collection.js';
import Link from '../models/Link.js';
import User from '../models/User.js';

// generate URL-friendly slug from name
const makeSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'collection';

// ensure slug is unique for this user
const uniqueSlug = async (ownerId, name, excludeId = null) => {
  const base = makeSlug(name);
  let slug = base;
  let i = 1;

  while (true) {
    const query = { owner: ownerId, slug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Collection.findOne(query);
    if (!existing) break;

    slug = `${base}-${i++}`;
  }

  return slug;
};

// ── GET /api/collections 
export const getMyCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user._id })
      .populate('links', 'title url thumbnail favicon tags category')
      .sort({ createdAt: -1 });

    res.json({ success: true, collections });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/collections 
export const createCollection = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const slug = await uniqueSlug(req.user._id, name);

    const collection = await Collection.create({
      owner: req.user._id,
      name: name.trim(),
      description: description?.trim() || '',
      isPublic: isPublic || false,
      slug,
      links: [],
    });

    res.status(201).json({ success: true, collection });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── PUT /api/collections/:id 
export const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const { name, description, isPublic } = req.body;

    if (name !== undefined) {
      collection.name = name.trim();
      collection.slug = await uniqueSlug(req.user._id, name, collection._id);
    }

    if (description !== undefined) collection.description = description.trim();
    if (isPublic !== undefined) collection.isPublic = isPublic;

    await collection.save();

    res.json({ success: true, collection });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── DELETE /api/collections/:id 
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    res.json({ success: true, message: 'Collection deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/collections/:id/links 
export const toggleLinkInCollection = async (req, res) => {
  try {
    const { linkId } = req.body;

    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const link = await Link.findOne({ _id: linkId, user: req.user._id });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    const alreadyIn = collection.links.map(String).includes(String(linkId));

    collection.links = alreadyIn
      ? collection.links.filter((id) => String(id) !== String(linkId))
      : [...collection.links, linkId];

    await collection.save();
    await collection.populate('links', 'title url thumbnail favicon tags category');

    res.json({ success: true, added: !alreadyIn, collection });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET /api/collections/public/:username/:slug 
export const getPublicCollection = async (req, res) => {
  try {
    const { username, slug } = req.params;

    const owner = await User.findOne({
      username: username.toLowerCase().trim(),
    });

    if (!owner) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const collection = await Collection.findOne({
      owner: owner._id,
      slug: slug.toLowerCase().trim(),
      isPublic: true,
    }).populate(
      'links',
      'title url thumbnail favicon description tags category createdAt'
    );

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found or is private',
      });
    }

    res.json({
      success: true,
      collection,
      owner: { name: owner.name, username: owner.username },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/collections/public/:username/:slug/copy 
export const copyPublicCollection = async (req, res) => {
  try {
    const { username, slug } = req.params;

    const owner = await User.findOne({
      username: username.toLowerCase().trim(),
    });

    if (!owner) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (String(owner._id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You can't copy your own collection",
      });
    }

    const original = await Collection.findOne({
      owner: owner._id,
      slug: slug.toLowerCase().trim(),
      isPublic: true,
    }).populate('links');

    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found or is private',
      });
    }

    const copiedLinks = await Promise.all(
      original.links.map((link) =>
        Link.create({
          user: req.user._id,
          url: link.url,
          title: link.title,
          description: link.description,
          thumbnail: link.thumbnail,
          favicon: link.favicon,
          siteName: link.siteName || '',
          notes: '',
          tags: link.tags,
          category: link.category,
        })
      )
    );

    const newSlug = await uniqueSlug(req.user._id, original.name);

    const newCollection = await Collection.create({
      owner: req.user._id,
      name: `${original.name} (copied)`,
      description: original.description,
      slug: newSlug,
      isPublic: false,
      links: copiedLinks.map((l) => l._id),
    });

    original.copyCount = (original.copyCount || 0) + 1;
    await original.save();

    res.status(201).json({
      success: true,
      message: `Collection copied! ${copiedLinks.length} links added to your vault.`,
      collection: newCollection,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};