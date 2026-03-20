import { useState } from 'react'
import { timeAgo, getDomain, getSiteEmoji } from '../utils/helpers.js'

const LinkCard = ({ link, onEdit, onDelete, onToggleFavorite }) => {
  const [imgError, setImgError] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Delete this link?')) return
    setDeleting(true)
    await onDelete(link._id)
    setDeleting(false)
  }

  return (
    <div className="card group flex flex-col h-[280px] p-5 animate-slide-up">

      {/* ── TOP ── */}
      <div className="flex gap-3 mb-3">
        
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-dark-500
                        border border-white/6 flex items-center justify-center">
          {link.thumbnail && !imgError ? (
            <img
              src={link.thumbnail}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-base font-bold text-gray-400">
              {getSiteEmoji(link.url)}
            </span>
          )}
        </div>

        {/* Title + domain */}
        <div className="flex-1 min-w-0">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold text-sm leading-snug hover:text-brand-400
                       transition-colors duration-150 line-clamp-2 block"
          >
            {link.title || getDomain(link.url)}
          </a>

          <div className="flex items-center gap-1.5 mt-1">
            {link.favicon && (
              <img
                src={link.favicon}
                alt=""
                className="w-3 h-3 rounded-sm flex-shrink-0"
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}
            <span className="text-xs font-mono text-gray-500 truncate">
              {getDomain(link.url)}
            </span>
          </div>
        </div>

        {/* Favorite */}
        <button
          onClick={() => onToggleFavorite(link._id, !link.isFavorite)}
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                      border transition-all duration-150
                      ${link.isFavorite
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-dark-500 border-white/6 text-gray-600 hover:text-amber-400 hover:border-amber-500/20'
                      }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24"
            fill={link.isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* ── MIDDLE ── */}
      <div className="flex-1 min-h-0 overflow-hidden mb-3">
        {link.notes ? (
          <div className="bg-dark-600/50 border border-white/5 rounded-xl px-3 py-2 h-full">
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
              <span className="text-brand-400 font-semibold mr-1">Note:</span>
              {link.notes}
            </p>
          </div>
        ) : link.description ? (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
            {link.description}
          </p>
        ) : (
          <p className="text-xs text-gray-600 italic">No description</p>
        )}
      </div>

      {/* ── TAGS ── */}
      <div className="h-6 overflow-hidden mb-3">
        {link.tags?.length > 0 ? (
          <div className="flex gap-1.5">
            {link.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag-pill text-xs whitespace-nowrap">
                #{tag}
              </span>
            ))}
            {link.tags.length > 4 && (
              <span className="text-xs text-gray-600 font-mono self-center">
                +{link.tags.length - 4}
              </span>
            )}
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs bg-dark-500 text-gray-400 border border-white/6
                           px-2 py-0.5 rounded-md font-medium truncate max-w-[90px]">
            {link.category}
          </span>
          <span className="text-xs text-gray-600 font-mono flex-shrink-0">
            {timeAgo(link.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                        transition-opacity duration-200 flex-shrink-0">

          {/* Open */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg bg-dark-500 hover:bg-dark-400 border border-white/6
                       flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          {/* Edit */}
          <button
            onClick={() => onEdit(link)}
            className="w-7 h-7 rounded-lg bg-dark-500 hover:bg-dark-400 border border-white/6
                       flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            ✏️
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-lg bg-dark-500 hover:bg-red-500/20 border border-white/6
                       hover:border-red-500/30 flex items-center justify-center text-gray-400
                       hover:text-red-400 transition-all disabled:opacity-50"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default LinkCard