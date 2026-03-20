import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

const Navbar = ({ onAddLink }) => {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + LinkVault Text */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">LinkVault</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Add Link Button */}
          <button onClick={onAddLink} className="btn-primary text-sm flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Link
          </button>

          {/* Collections Link */}
          <Link
            to="/collections"
            className="btn-ghost text-sm hidden sm:flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Collections
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown((p) => !p)}
              className="flex items-center gap-2.5 bg-dark-600 hover:bg-dark-500 border border-white/8
                         px-3 py-2 rounded-xl transition-all duration-200"
            >
              <div className="w-7 h-7 bg-brand-500/20 border border-brand-500/30 rounded-lg
                              flex items-center justify-center text-brand-400 font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 font-medium hidden sm:block">
                {user?.name?.split(' ')[0]}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-12 z-20 w-52 bg-dark-700 border border-white/8
                                rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 font-mono truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { logout(); setShowDropdown(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400
                                 hover:bg-red-500/10 transition-all duration-150 text-sm font-medium"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar