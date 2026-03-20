const Sidebar = ({ activeFilter, onFilterChange, allTags }) => {
  const navItems = [
    {
      id: 'all',
      label: 'All Links',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      ),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
  ]

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {/* Navigation */}
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2">
            Library
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onFilterChange(item.id)}
                className={`sidebar-link w-full ${activeFilter === item.id ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2">
              Tags
            </p>
            <div className="space-y-0.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onFilterChange(`tag:${tag}`)}
                  className={`sidebar-link w-full ${activeFilter === `tag:${tag}` ? 'active' : ''}`}
                >
                  <span className="text-gray-600 font-mono text-xs">#</span>
                  <span className="truncate">{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
