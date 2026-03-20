import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// ─── JWT token generator 
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

// ─── build a unique username from a display name 
export const buildUsername = async (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  let username = base
  let counter = 1

  while (await User.findOne({ username })) {
    const suffix = Math.floor(1000 + Math.random() * 9000)
    username = `${base}${suffix}`
    counter++
    if (counter > 20) {
      username = `${base}${Date.now()}`
      break
    }
  }

  return username
}

// ─── format user object for response 
export const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  username: user.username,
  customCategories: user.customCategories,
})

// ─── POST /api/auth/register 
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      })
    }

    const username = await buildUsername(name)
    const user = await User.create({ name, email, password, username })
    const token = generateToken(user._id)

    console.log(` New user registered: ${user.email} → @${user.username}`)

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: formatUser(user),
    })
  } catch (error) {
    console.error('Register error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ─── POST /api/auth/login 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    if (!user.username) {
      user.username = await buildUsername(user.name)
      await user.save()
      console.log(`Username auto-fixed on login: ${user.email} → @${user.username}`)
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: formatUser(user),
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ─── GET /api/auth/me 
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user.username) {
      user.username = await buildUsername(user.name)
      await user.save()
      console.log(`Username auto-fixed on getMe: ${user.email} → @${user.username}`)
    }

    res.json({ success: true, user: formatUser(user) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}