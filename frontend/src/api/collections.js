import API from './axios.js'

export const getMyCollections       = ()                => API.get('/collections')
export const createCollection       = (data)            => API.post('/collections', data)
export const updateCollection       = (id, data)        => API.put(`/collections/${id}`, data)
export const deleteCollection       = (id)              => API.delete(`/collections/${id}`)
export const toggleLinkInCollection = (id, linkId)      => API.post(`/collections/${id}/links`, { linkId })

export const getPublicCollection  = (username, slug) =>
  API.get(`/collections/public/${username}/${slug}`)

export const copyPublicCollection = (username, slug) =>
  API.post(`/collections/public/${username}/${slug}/copy`)