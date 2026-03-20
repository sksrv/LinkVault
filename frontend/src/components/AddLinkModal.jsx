import { useState, useEffect } from 'react'
import { createLink, updateLink, fetchMetadata } from '../api/links.js'
import { parseTags, normalizeUrl } from '../utils/helpers.js'
import { useAuth, DEFAULT_CATEGORIES } from '../context/AuthContext.jsx'

const AddLinkModal = ({ isOpen, onClose, onSuccess, editLink }) => {
  const isEditing = !!editLink
  const { allCategories, customCategories, addCategory, deleteCategory } = useAuth()

  const [form, setForm] = useState({
    url: '', title: '', description: '',
    notes: '', tags: '', category: 'General',
  })
  const [newCategory, setNewCategory]           = useState('')
  const [showNewCatInput, setShowNewCatInput]   = useState(false)
  const [addingCat, setAddingCat]               = useState(false)
  const [deletingCat, setDeletingCat]           = useState('')
  const [catError, setCatError]                 = useState('')
  const [loading, setLoading]                   = useState(false)
  const [fetching, setFetching]                 = useState(false)
  const [error, setError]                       = useState('')

  // Populate form when editing
  useEffect(() => {
    if (editLink) {
      setForm({
        url: editLink.url || '',
        title: editLink.title || '',
        description: editLink.description || '',
        notes: editLink.notes || '',
        tags: editLink.tags?.join(', ') || '',
        category: editLink.category || 'General',
      })
    } else {
      setForm({ url: '', title: '', description: '', notes: '', tags: '', category: 'General' })
    }
    setError('')
    setShowNewCatInput(false)
    setNewCategory('')
    setCatError('')
  }, [editLink, isOpen])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleUrlBlur = async () => {
    if (!form.url || isEditing) return
    const url = normalizeUrl(form.url)
    if (!url.startsWith('http')) return
    setFetching(true)
    try {
      const res = await fetchMetadata(url)
      const { title, description } = res.data.metadata
      setForm((prev) => ({
        ...prev, url,
        title: prev.title || title || '',
        description: prev.description || description || '',
      }))
    } catch {}
    finally { setFetching(false) }
  }

  // Add custom category
  const handleAddCategory = async () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    setCatError('')
    setAddingCat(true)
    try {
      await addCategory(trimmed)
      setForm((prev) => ({ ...prev, category: trimmed }))
      setNewCategory('')
      setShowNewCatInput(false)
    } catch (err) {
      setCatError(err.response?.data?.message || 'Could not add category')
    } finally {
      setAddingCat(false)
    }
  }

  // Delete custom category
  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete "${cat}"? All links in this category will move to General.`)) return
    setDeletingCat(cat)
    try {
      await deleteCategory(cat)
      // If user was on deleted category, switch to General
      if (form.category === cat) {
        setForm((prev) => ({ ...prev, category: 'General' }))
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete category')
    } finally {
      setDeletingCat('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.url.trim()) { setError('URL is required'); return }
    setLoading(true)
    try {
      const payload = {
        url: normalizeUrl(form.url),
        title: form.title,
        description: form.description,
        notes: form.notes,
        tags: parseTags(form.tags),
        category: form.category,
      }
      if (isEditing) { await updateLink(editLink._id, payload) }
      else { await createLink(payload) }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-700 border border-white/8 rounded-2xl
                      shadow-2xl shadow-black/60 animate-scale-in max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
          <div>
            <h2 className="text-white font-bold text-lg">
              {isEditing ? 'Edit Link' : 'Save New Link'}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {isEditing ? 'Update your saved link' : "Paste a URL and we'll fetch the details"}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              URL <span className="text-brand-400">*</span>
            </label>
            <div className="relative">
              <input name="url" type="text" placeholder="https://example.com"
                value={form.url} onChange={handleChange} onBlur={handleUrlBlur}
                className="input-field pr-10" autoFocus />
              {fetching && (
                <div className="absolute right-3 top-3.5">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {fetching && <p className="text-xs text-brand-400 mt-1 font-mono">Fetching metadata...</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
            <input name="title" type="text" placeholder="Auto-fetched or enter manually"
              value={form.title} onChange={handleChange} className="input-field" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea name="description" placeholder="Auto-fetched or add your own..."
              value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Personal Notes</label>
            <textarea name="notes" placeholder="Why did you save this?"
              value={form.notes} onChange={handleChange} rows={2} className="input-field resize-none" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Tags <span className="text-gray-600 normal-case font-normal">(comma separated)</span>
            </label>
            <input name="tags" type="text" placeholder="react, tutorial, frontend"
              value={form.tags} onChange={handleChange} className="input-field" />
          </div>

          {/* ── Category ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Category
              </label>
              <span className="text-xs text-gray-600 font-mono">
                Selected: <span className="text-brand-400">{form.category}</span>
              </span>
            </div>

            {/* ── Default categories  ── */}
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-1.5">Default</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button key={cat} type="button"
                  onClick={() => setForm((p) => ({ ...p, category: cat }))}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-150
                    ${form.category === cat
                      ? 'bg-brand-500/15 border-brand-500/50 text-brand-400'
                      : 'bg-dark-600 border-white/8 text-gray-400 hover:text-white hover:border-white/20'
                    }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* ── Custom categories ── */}
            {customCategories.length > 0 && (
              <>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1.5">My Categories</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {customCategories.map((cat) => (
                    <div key={cat}
                      className={`flex items-center gap-1 text-xs rounded-lg border font-medium transition-all duration-150
                        ${form.category === cat
                          ? 'bg-brand-500/15 border-brand-500/50 text-brand-400'
                          : 'bg-dark-600 border-white/8 text-gray-400'
                        }`}>
                      {/* Select button */}
                      <button type="button"
                        onClick={() => setForm((p) => ({ ...p, category: cat }))}
                        className="pl-3 pr-1 py-1.5 hover:text-white transition-colors">
                        {cat}
                      </button>
                      {/* Delete button */}
                      <button type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={deletingCat === cat}
                        className="pr-2 py-1.5 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
                        title={`Delete "${cat}"`}>
                        {deletingCat === cat
                          ? <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                          : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Add new category ── */}
            <button type="button" onClick={() => { setShowNewCatInput((p) => !p); setCatError('') }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-400
                         border border-dashed border-white/15 hover:border-brand-500/40
                         px-3 py-1.5 rounded-lg transition-all duration-150">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create new category
            </button>

            {showNewCatInput && (
              <div className="mt-2 animate-slide-up space-y-1.5">
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. Side Projects"
                    value={newCategory}
                    onChange={(e) => { setNewCategory(e.target.value); setCatError('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } }}
                    className="input-field flex-1 py-2 text-sm"
                    autoFocus />
                  <button type="button" onClick={handleAddCategory} disabled={addingCat}
                    className="btn-primary px-4 py-2 text-sm">
                    {addingCat
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Add'
                    }
                  </button>
                </div>
                {catError && (
                  <p className="text-xs text-red-400 font-mono">{catError}</p>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/6">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEditing ? 'Saving...' : 'Adding...'}
              </>
            ) : isEditing ? 'Save Changes' : 'Add Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddLinkModal