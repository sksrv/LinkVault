import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import Toast, { showToast } from '../components/Toast.jsx'
import {
  getMyCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  toggleLinkInCollection,
} from '../api/collections'
import { getLinks } from '../api/links.js'
import { getDomain, timeAgo } from '../utils/helpers.js'

const CollectionsPage = () => {
  const { user } = useAuth()
  const [collections, setCollections]           = useState([])
  const [allLinks, setAllLinks]                 = useState([])
  const [loading, setLoading]                   = useState(true)
  const [showModal, setShowModal]               = useState(false)
  const [editTarget, setEditTarget]             = useState(null)
  const [activeCollection, setActiveCollection] = useState(null)
  const [showLinkPicker, setShowLinkPicker]     = useState(false)
  const [form, setForm] = useState({ name: '', description: '', isPublic: false })
  const [saving, setSaving] = useState(false)
  const [linkSearch, setLinkSearch] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [colRes, linkRes] = await Promise.all([
        getMyCollections(),
        getLinks(),
      ])
      setCollections(colRes.data.collections)
      setAllLinks(linkRes.data.links)
    } catch {
      showToast('Failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: '', description: '', isPublic: false })
    setShowModal(true)
  }

  const openEdit = (col) => {
    setEditTarget(col)
    setForm({ name: col.name, description: col.description, isPublic: col.isPublic })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editTarget) {
        const res = await updateCollection(editTarget._id, form)
        setCollections((prev) =>
          prev.map((c) => c._id === editTarget._id ? res.data.collection : c)
        )
        showToast('Collection updated!')
      } else {
        const res = await createCollection(form)
        setCollections((prev) => [res.data.collection, ...prev])
        showToast('Collection created!')
      }
      setShowModal(false)
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this collection? Your links will NOT be deleted.')) return
    try {
      await deleteCollection(id)
      setCollections((prev) => prev.filter((c) => c._id !== id))
      if (activeCollection?._id === id) setActiveCollection(null)
      showToast('Collection deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const handleToggleLink = async (linkId) => {
    if (!activeCollection) return
    try {
      const res = await toggleLinkInCollection(activeCollection._id, linkId)
      const updated = res.data.collection
      setCollections((prev) => prev.map((c) => c._id === updated._id ? updated : c))
      setActiveCollection(updated)
      showToast(res.data.added ? 'Link added ✓' : 'Link removed')
    } catch {
      showToast('Failed to update', 'error')
    }
  }

  const getShareUrl = (col) =>
    `${window.location.origin}/u/${user?.username}/${col.slug}`

  const handleCopyLink = (col) => {
    navigator.clipboard.writeText(getShareUrl(col))
    showToast('Share link copied!')
  }

  const isLinkInCollection = (linkId) => {
    if (!activeCollection) return false
    return activeCollection.links.some(
      (l) => (typeof l === 'object' ? l._id : l) === linkId
    )
  }

  const filteredLinks = allLinks.filter((l) =>
    l.title?.toLowerCase().includes(linkSearch.toLowerCase()) ||
    getDomain(l.url).toLowerCase().includes(linkSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar onAddLink={() => {}} />

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Collections
            </h1>
            <p className="text-sm mt-1 text-gray-500">
              Group links and share publicly · Your username:{' '}
              <span className="font-mono text-brand-400">
                @{user?.username || 'loading...'}
              </span>
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Collection
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="card h-48 animate-pulse bg-dark-700" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-dark-600 border border-white/6 rounded-2xl
                            flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No collections yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Create a collection to group related links and share them publicly.
            </p>
            <button onClick={openCreate} className="btn-primary">
              Create your first collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((col) => (
              <div key={col._id} className="card p-5 flex flex-col gap-3 bg-dark-700">

                {/* Name + badge */}
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-white truncate">{col.name}</h3>
                    {col.description && (
                      <p className="text-xs mt-0.5 text-gray-500 line-clamp-2">
                        {col.description}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 whitespace-nowrap ${
                    col.isPublic
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-dark-500 text-gray-600 border border-white/6'
                  }`}>
                    {col.isPublic ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>

                {/* Link thumbnails */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {col.links.slice(0, 4).map((link, i) => (
                      <div key={i}
                        className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center
                                   text-xs font-bold border-2 border-dark-700 bg-dark-500 text-gray-500">
                        {link.thumbnail
                          ? <img src={link.thumbnail} alt="" className="w-full h-full object-cover"
                              onError={(e) => (e.target.style.display = 'none')} />
                          : getDomain(link.url || '')?.charAt(0).toUpperCase()
                        }
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-gray-600">
                    {col.links.length} link{col.links.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs font-mono text-gray-600 ml-auto">
                    {timeAgo(col.createdAt)}
                  </span>
                </div>

                {/* Share URL preview */}
                {col.isPublic && (
                  <div
                    onClick={() => handleCopyLink(col)}
                    className="rounded-lg px-3 py-2 font-mono text-xs text-gray-600
                               bg-dark-600 border border-white/6 truncate cursor-pointer
                               hover:border-brand-500/30 hover:text-brand-400 transition-all"
                    title="Click to copy share link">
                    /u/{user?.username}/{col.slug}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      setActiveCollection(col)
                      setShowLinkPicker(true)
                      setLinkSearch('')
                    }}
                    className="btn-secondary text-xs px-3 py-1.5 flex-1 justify-center">
                    Manage Links
                  </button>

                  {col.isPublic && (
                    <button onClick={() => handleCopyLink(col)} title="Copy share link"
                      className="w-8 h-8 rounded-xl bg-dark-600 border border-white/6
                                 flex items-center justify-center text-brand-400 transition-all
                                 hover:bg-dark-500">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                      </svg>
                    </button>
                  )}

                  <button onClick={() => openEdit(col)} title="Edit"
                    className="w-8 h-8 rounded-xl bg-dark-600 border border-white/6
                               flex items-center justify-center text-gray-400 hover:text-white
                               transition-all hover:bg-dark-500">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>

                  <button onClick={() => handleDelete(col._id)} title="Delete"
                    className="w-8 h-8 rounded-xl bg-dark-600 border border-white/6
                               flex items-center justify-center text-gray-400 hover:text-red-400
                               hover:border-red-500/30 transition-all">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-dark-700 border border-white/8
                          rounded-2xl shadow-2xl shadow-black/60 animate-scale-in p-6">

            <h2 className="text-white font-bold text-lg mb-5">
              {editTarget ? 'Edit Collection' : 'New Collection'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. React Resources"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="What is this collection about?"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              {/* Public toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-xl
                           bg-dark-600 border border-white/6 cursor-pointer"
                onClick={() => setForm((p) => ({ ...p, isPublic: !p.isPublic }))}>
                <div>
                  <p className="text-sm font-semibold text-white">Make Public</p>
                  <p className="text-xs text-gray-500">
                    Anyone with the link can view &amp; copy this collection
                  </p>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-all duration-200
                                 flex-shrink-0 ml-4 ${form.isPublic ? 'bg-brand-500' : 'bg-dark-400'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                                   transition-all duration-200
                                   ${form.isPublic ? 'left-[22px]' : 'left-0.5'}`} />
                </div>
              </div>

              {/* Show share URL preview when editing a public collection */}
              {form.isPublic && editTarget && (
                <p className="text-xs font-mono bg-dark-600 border border-white/6
                              px-3 py-2 rounded-lg text-gray-500">
                  Share URL: /u/{user?.username}/{editTarget.slug}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="btn-primary flex-1 justify-center">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : editTarget ? 'Save Changes' : 'Create'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Link Picker Modal ── */}
      {showLinkPicker && activeCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLinkPicker(false)} />
          <div className="relative w-full max-w-lg bg-dark-700 border border-white/8
                          rounded-2xl shadow-2xl shadow-black/60 animate-scale-in
                          flex flex-col max-h-[80vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <div>
                <h2 className="text-white font-bold text-base">Manage Links</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeCollection.name} · {activeCollection.links.length} selected
                </p>
              </div>
              <button onClick={() => setShowLinkPicker(false)} className="btn-ghost p-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-2">
              <input
                type="text"
                placeholder="Search links..."
                value={linkSearch}
                onChange={(e) => setLinkSearch(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Links list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {filteredLinks.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-500">No links found</p>
              ) : filteredLinks.map((link) => {
                const inCollection = isLinkInCollection(link._id)
                return (
                  <div
                    key={link._id}
                    onClick={() => handleToggleLink(link._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border
                                transition-all cursor-pointer ${
                      inCollection
                        ? 'bg-brand-500/8 border-brand-500/30'
                        : 'bg-dark-600 border-white/6 hover:border-white/12'
                    }`}>

                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center
                                     justify-center flex-shrink-0 transition-all ${
                      inCollection
                        ? 'bg-brand-500 border-brand-500'
                        : 'border-white/20 bg-transparent'
                    }`}>
                      {inCollection && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {link.title || getDomain(link.url)}
                      </p>
                      <p className="text-xs font-mono text-gray-600 truncate">
                        {getDomain(link.url)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/6">
              <button onClick={() => setShowLinkPicker(false)} className="btn-primary w-full justify-center">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast />
    </div>
  )
}

export default CollectionsPage