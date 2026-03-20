import API from './axios.js'

export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser    = (data) => API.post('/auth/login', data)
export const getMe        = ()     => API.get('/auth/me')

// Custom categories
export const addCustomCategory    = (category) => API.post('/auth/categories', { category })
export const deleteCustomCategory = (category) => API.delete('/auth/categories', { data: { category } })