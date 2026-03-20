import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginUser, registerUser, getMe, addCustomCategory, deleteCustomCategory } from '../api/auth.js'

const AuthContext = createContext(null)

export const DEFAULT_CATEGORIES = [
  'General', 'Work', 'Learning', 'Design',
  'Development', 'Research', 'Entertainment', 'Tools', 'Other',
]

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [customCategories, setCustomCategories] = useState([])

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then((res) => {
          setUser(res.data.user)
          setCustomCategories(res.data.user.customCategories || [])
        })
        .catch(() => { localStorage.removeItem('token') })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    setCustomCategories(res.data.user.customCategories || [])
    return res.data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await registerUser({ name, email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    setCustomCategories(res.data.user.customCategories || [])
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    setCustomCategories([])
  }, [])

  // Add a new custom category
  const addCategory = useCallback(async (category) => {
    const res = await addCustomCategory(category)
    setCustomCategories(res.data.customCategories)
    return res.data
  }, [])

  // Delete a custom category
  const deleteCategory = useCallback(async (category) => {
    const res = await deleteCustomCategory(category)
    setCustomCategories(res.data.customCategories)
    return res.data
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      customCategories, allCategories,
      addCategory, deleteCategory,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}