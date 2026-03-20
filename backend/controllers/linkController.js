import Link from '../models/Link.js';
import fetchMetadata from '../utils/fetchMetadata.js';

// ───POST /api/links 
const createLink = async (req, res) => {
  try {
    const { url, title, description, notes, tags, category } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const metadata = await fetchMetadata(url);

    const link = await Link.create({
      user: req.user._id,
      url,
      title: title || metadata.title,
      description: description || metadata.description,
      thumbnail: metadata.thumbnail,
      favicon: metadata.favicon,
      siteName: metadata.siteName,
      notes: notes || '',
      tags: tags ? tags.map((t) => t.toLowerCase().trim()) : [],
      category: category || 'General',
    });

    res.status(201).json({ success: true, link });
  } catch (error) {
    console.error('Create link error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/links 
const getLinks = async (req, res) => {
  try {
    const { search, tag, category, favorite } = req.query;

    let query = { user: req.user._id };

    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    if (category) {
      query.category = category;
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const links = await Link.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: links.length, links });
  } catch (error) {
    console.error('Get links error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/links/:id 
const getLinkById = async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.user._id });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    res.json({ success: true, link });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/links/:id 
const updateLink = async (req, res) => {
  try {
    let link = await Link.findOne({ _id: req.params.id, user: req.user._id });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    const { title, description, notes, tags, category, isFavorite } = req.body;

    if (title !== undefined) link.title = title;
    if (description !== undefined) link.description = description;
    if (notes !== undefined) link.notes = notes;
    if (tags !== undefined) link.tags = tags.map((t) => t.toLowerCase().trim());
    if (category !== undefined) link.category = category;
    if (isFavorite !== undefined) link.isFavorite = isFavorite;

    await link.save();

    res.json({ success: true, link });
  } catch (error) {
    console.error('Update link error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ───DELETE /api/links/:id 
const deleteLink = async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/links/meta/fetch 
const getMetadata = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    const metadata = await fetchMetadata(url);
    res.json({ success: true, metadata });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch metadata' });
  }
};

// ─── GET /api/links/stats/summary 
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Link.countDocuments({ user: userId });
    const favorites = await Link.countDocuments({ user: userId, isFavorite: true });

    const categories = await Link.distinct('category', { user: userId });

    const allTags = await Link.find({ user: userId }).select('tags');
    const tagSet = new Set();
    allTags.forEach((l) => l.tags.forEach((t) => tagSet.add(t)));

    res.json({
      success: true,
      stats: {
        total,
        favorites,
        categories: categories.length,
        tags: tagSet.size,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
  getMetadata,
  getStats,
};