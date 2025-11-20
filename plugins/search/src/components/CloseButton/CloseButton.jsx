// src/plugins/search/CloseButton.jsx
export const CloseButton = ({ onClick, CloseIcon }) => {
  return (
    <button
      aria-label="Close search"
      className="dm-c-map-button dm-c-search-close-button"
      type="button"
      onClick={onClick}
    >
      <CloseIcon aria-hidden="true" focusable="false" />
    </button>
  )
}
