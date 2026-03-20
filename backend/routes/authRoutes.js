import express from 'express'
import User from '../models/User.js'
import Link from '../models/Link.js'
import { register, login, getMe } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// ─── Public routes 
router.post('/register', register)
router.post('/login', login)

// ─── Protected routes 
router.get('/me', protect, getMe)

// ─── Custom Categories 
const DEFAULT_CATEGORIES = [
  'General', 'Work', 'Learning', 'Design',
  'Development', 'Research', 'Entertainment', 'Tools', 'Other',
]

router.post('/categories', protect, async (req, res) => {
  try {
    const { category } = req.body
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' })
    }

    const trimmed = category.trim()
    if (DEFAULT_CATEGORIES.includes(trimmed)) {
      return res.status(400).json({ success: false, message: 'This is already a default category' })
    }

    const user = await User.findById(req.user._id)
    if (user.customCategories.includes(trimmed)) {
      return res.status(400).json({ success: false, message: 'Category already exists' })
    }

    user.customCategories.push(trimmed)
    await user.save()
    res.json({ success: true, customCategories: user.customCategories })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

router.delete('/categories', protect, async (req, res) => {
  try {
    const { category } = req.body
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category name is required' })
    }

    const user = await User.findById(req.user._id)
    user.customCategories = user.customCategories.filter((c) => c !== category)
    await user.save()

    await Link.updateMany(
      { user: req.user._id, category },
      { $set: { category: 'General' } }
    )

    res.json({ success: true, customCategories: user.customCategories })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router