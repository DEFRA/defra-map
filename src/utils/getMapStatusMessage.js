export const getMapStatusMessage = {
  moved: ({ direction }) =>
    `Map moved ${direction}.`,
  zoomed: ({ from, to, areaDimensions, isAtMaxZoom, isAtMinZoom }) =>
    `Map zoomed ${to > from ? 'in' : 'out'}${isAtMaxZoom ? ' (Maximum zoom)' : ''}${isAtMinZoom ? ' (Minimum zoom)' : ''}. New area approximately ${areaDimensions}.`,
  newArea: ({ areaDimensions, isAtMaxZoom, isAtMinZoom }) =>
    `New area approximately ${areaDimensions}${isAtMaxZoom ? ' (Maximum zoom)' : ''}${isAtMinZoom ? ' (Minimum zoom)' : ''}.`,
  noChange: ({ isAtMaxZoom, isAtMinZoom }) =>
    `No change, ${isAtMaxZoom ? 'maximum zoom reached' : ''}${isAtMinZoom ? 'minimum zoom reached' : ''}.`
}
