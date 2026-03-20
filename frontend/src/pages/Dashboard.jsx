import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import LinkCard from '../components/LinkCard.jsx'
import AddLinkModal from '../components/AddLinkModal.jsx'
import SearchBar from '../components/SearchBar.jsx'
import StatsBar from '../components/StatsBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Toast, { showToast } from '../components/Toast.jsx'
import { getLinks, deleteLink, updateLink, getStats } from '../api/links.js'

const Dashboard = () => {
  const [links, setLinks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editLink, setEditLink] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOptions, setFilterOptions] = useState({ category: '', favorite: false })

  // Collect all unique tags from current links
  const allTags = [...new Set(links.flatMap((l) => l.tags))].sort()

  // ── Fetch links 
  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}

      if (searchQuery) params.search = searchQuery
      if (filterOptions.category) params.category = filterOptions.category
      if (filterOptions.favorite) params.favorite = 'true'

      // Sidebar filter overrides
      if (activeFilter === 'favorites') params.favorite = 'true'
      if (activeFilter.startsWith('tag:')) params.tag = activeFilter.replace('tag:', '')

      const res = await getLinks(params)
      setLinks(res.data.links)
    } catch (err) {
      showToast('Failed to load links', 'error')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterOptions, activeFilter])

  // ── Fetch stats 
  const fetchStats = useCallback(async () => {
    try {
      const res = await getStats()
      setStats(res.data.stats)
    } catch {
      // Non-critical, fail silently
    }
  }, [])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // ── Handlers 
  const handleDelete = async (id) => {
    try {
      await deleteLink(id)
      setLinks((prev) => prev.filter((l) => l._id !== id))
      fetchStats()
      showToast('Link deleted')
    } catch {
      showToast('Failed to delete link', 'error')
    }
  }

  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      await updateLink(id, { isFavorite })
      setLinks((prev) =>
        prev.map((l) => (l._id === id ? { ...l, isFavorite } : l))
      )
      fetchStats()
      showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites')
    } catch {
      showToast('Failed to update', 'error')
    }
  }

  const handleEdit = (link) => {
    setEditLink(link)
    setModalOpen(true)
  }

  const handleAddNew = () => {
    setEditLink(null)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    fetchLinks()
    fetchStats()
    showToast(editLink ? 'Link updated!' : 'Link saved!')
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    // Reset search/category filters when changing sidebar
    setSearchQuery('')
    setFilterOptions({ category: '', favorite: false })
  }

  const hasFilters = searchQuery || filterOptions.category || filterOptions.favorite || activeFilter !== 'all'

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar onAddLink={handleAddNew} />

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          allTags={allTags}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Stats */}
          <StatsBar stats={stats} />

          {/* Search + Filter */}
          <SearchBar
            onSearch={(q) => {
              setSearchQuery(q)
              setActiveFilter('all')
            }}
            onFilter={(opts) => {
              setFilterOptions(opts)
              setActiveFilter('all')
            }}
          />

          {/* Links Grid / States */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="card p-5 h-48 animate-pulse"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 bg-dark-500 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-dark-500 rounded-full w-3/4" />
                      <div className="h-2 bg-dark-500 rounded-full w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-dark-500 rounded-full" />
                    <div className="h-2 bg-dark-500 rounded-full w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : links.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onAddLink={handleAddNew} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 font-mono">
                  {links.length} link{links.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {links.map((link, i) => (
                  <div key={link._id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <LinkCard
                      link={link}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      <AddLinkModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditLink(null) }}
        onSuccess={handleModalSuccess}
        editLink={editLink}
      />

      {/* Toast */}
      <Toast />
    </div>
  )
}

export default Dashboard
