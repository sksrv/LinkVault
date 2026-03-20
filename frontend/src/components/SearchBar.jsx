import { useState, useEffect } from 'react'
import { debounce } from '../utils/helpers.js'
import { useAuth } from '../context/AuthContext.jsx'

const SearchBar = ({ onSearch, onFilter }) => {
  const { allCategories } = useAuth() 

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showFavs, setShowFavs] = useState(false)

  // Debounced search
  useEffect(() => {
    const handler = debounce(() => {
      onSearch(search)
    }, 350)
    handler()
  }, [search])

  const handleCategory = (cat) => {
    const val = cat === 'All' ? '' : cat
    setCategory(val)
    onFilter({ category: val, favorite: showFavs })
  }

  const handleFavs = () => {
    const next = !showFavs
    setShowFavs(next)
    onFilter({ category, favorite: next })
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        <input
          type="text"
          placeholder="Search links, notes, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11 pr-4"
        />

        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Favorites toggle */}
        <button
          onClick={handleFavs}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border
            transition-all duration-150
            ${showFavs
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-dark-600 border-white/6 text-gray-400 hover:text-white'
            }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={showFavs ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Favorites
        </button>

        {/* All + dynamic categories */}
        <div className="flex gap-1.5 flex-wrap">
          {['All', ...allCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`text-xs px-3 py-2 rounded-xl border transition-all duration-150 font-medium
                ${(cat === 'All' && !category) || category === cat
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                  : 'bg-dark-600 border-white/6 text-gray-400 hover:text-white'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchBar