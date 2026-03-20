const EmptyState = ({ hasFilters, onAddLink }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="w-20 h-20 bg-dark-600 border border-white/6 rounded-2xl flex items-center
                      justify-center mb-6 shadow-xl">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>

      {hasFilters ? (
        <>
          <h3 className="text-white font-bold text-lg mb-2">No links found</h3>
          <p className="text-gray-500 text-sm max-w-xs">
            No links match your current search or filter. Try adjusting your criteria.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-white font-bold text-lg mb-2">Your vault is empty</h3>
          <p className="text-gray-500 text-sm max-w-xs mb-6">
            Start saving links that matter to you. Articles, tools, videos — all in one place.
          </p>
          <button onClick={onAddLink} className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Your First Link
          </button>
        </>
      )}
    </div>
  )
}

export default EmptyState
