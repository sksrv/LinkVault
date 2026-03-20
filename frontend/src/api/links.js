import API from './axios.js'

export const getLinks = (params) => API.get('/links', { params })
export const getLinkById = (id) => API.get(`/links/${id}`)
export const createLink = (data) => API.post('/links', data)
export const updateLink = (id, data) => API.put(`/links/${id}`, data)
export const deleteLink = (id) => API.delete(`/links/${id}`)
export const fetchMetadata = (url) => API.get('/links/meta/fetch', { params: { url } })
export const getStats = () => API.get('/links/stats/summary')
