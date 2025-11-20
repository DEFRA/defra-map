// src/plugins/search/OpenButton.jsx
export const OpenButton = ({ id, isExpanded, onClick, buttonRef, SearchIcon }) => {
  return (
    <button
      aria-label="Open search"
      className="dm-c-map-button"
      onClick={onClick}
      aria-controls={`${id}-search-form`}
      ref={buttonRef}
      style={isExpanded ? { display: 'none' } : undefined}
    >
      <SearchIcon aria-hidden="true" focusable="false" />
    </button>
  )
}
