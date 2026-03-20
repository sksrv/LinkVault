import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPublicCollection, copyPublicCollection } from '../api/collections'
import { useAuth } from '../context/AuthContext'
import { getDomain, timeAgo, truncate } from '../utils/helpers'

const PublicCollectionPage = () => {
  const { username, slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getPublicCollection(username, slug)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Collection not found'))
      .finally(() => setLoading(false))
  }, [username, slug])

  const handleCopy = async () => {
    if (!user) { navigate('/login'); return }
    setCopying(true)
    try {
      await copyPublicCollection(username, slug)
      setCopied(true)
      setTimeout(() => navigate('/dashboard'), 1800)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to copy collection')
    } finally {
      setCopying(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-gray-500">Loading collection...</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-16 h-16 bg-dark-700 border border-white/6 rounded-2xl flex items-center justify-center text-3xl">
          🔒
        </div>
        <h2 className="text-xl font-bold text-white">{error}</h2>
        <p className="text-sm text-gray-600 font-mono">/u/{username}/{slug}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
          <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
        </div>
      </div>
    )
  }

  const { collection, owner } = data

  return (
    <div className="min-h-screen bg-dark-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <span className="font-bold text-white">LinkVault</span>
          </Link>

          {/* Copy button — hidden if viewing your own collection */}
          {user?.username !== username && (
            <button onClick={handleCopy} disabled={copying || copied} className="btn-primary text-sm">
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Saved to your vault!
                </>
              ) : copying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {user ? 'Add to my Vault' : 'Sign in to Copy'}
                </>
              )}
            </button>
          )}

          {!user && (
            <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
          )}
        </div>
      </header>

      {/* ── Collection Info ── */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
              🌐 Public Collection
            </span>
            {collection.copyCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-dark-600 text-gray-500 border border-white/6">
                {collection.copyCount} {collection.copyCount === 1 ? 'copy' : 'copies'}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {collection.name}
          </h1>

          {collection.description && (
            <p className="text-base text-gray-400 mb-3">{collection.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <span>By <span className="font-semibold text-gray-400">@{owner.username}</span></span>
            <span>·</span>
            <span>{collection.links.length} link{collection.links.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{timeAgo(collection.createdAt)}</span>
          </div>
        </div>

        {/* ── Links ── */}
        {collection.links.length === 0 ? (
          <div className="text-center py-16 bg-dark-700 border border-white/6 rounded-2xl">
            <p className="text-gray-500">This collection has no links yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collection.links.map((link, i) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-dark-700 border border-white/6
                           rounded-2xl transition-all group block
                           hover:border-white/12 hover:shadow-xl hover:shadow-black/30"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex
                                items-center justify-center font-bold text-sm
                                bg-dark-500 border border-white/6 text-gray-500">
                  {link.thumbnail
                    ? <img src={link.thumbnail} alt="" className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = 'none')} />
                    : getDomain(link.url)?.charAt(0).toUpperCase()
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate group-hover:text-brand-400 transition-colors">
                    {link.title || getDomain(link.url)}
                  </p>
                  <p className="text-xs font-mono text-gray-600 truncate mt-0.5">
                    {getDomain(link.url)}
                  </p>
                  {link.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {truncate(link.description, 100)}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {link.tags?.length > 0 && (
                  <div className="hidden sm:flex gap-1.5 flex-shrink-0">
                    {link.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="tag-pill">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Arrow */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="flex-shrink-0 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            ))}
          </div>
        )}

        {/* ── Sign up CTA for visitors ── */}
        {!user && (
          <div className="mt-10 bg-dark-700 border border-white/6 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-xl
                            flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
            <p className="font-bold text-lg text-white mb-1">Want to save this collection?</p>
            <p className="text-sm text-gray-500 mb-5">
              Create a free LinkVault account to copy all {collection.links.length} links to your own vault.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/register" className="btn-primary">Create Free Account</Link>
              <Link to="/login" className="btn-secondary">Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicCollectionPage