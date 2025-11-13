/**
 * Returns the color value appropriate for the given mapStyleId.
 * Supports:
 *  - Single color values (#fff, rgba(...))
 *  - Comma-separated mapStyleId:color pairs (e.g. 'outdoor:#fff,dark:rgba(0,0,0,0.5)')
 *
 * @param {string} colors - Color string or style-mapped color definition
 * @param {string} mapStyleId - Current style/theme identifier
 * @returns {string|null} - The matching color string or null
 */
export const parseColor = (colors, mapStyleId) => {
  if (!colors || typeof colors !== 'string') {
    return null
  }

  // --- Case 1: simple color (not mapped)
  // If there's no colon, it's just a single value (can include rgba with commas)
  if (!colors.includes(':')) {
    return colors.trim()
  }

  // --- Case 2: mapped colors (outdoor:#fff,dark:rgba(255,0,0,0.5))
  // Split on commas *only* that separate mapStyle:color pairs
  const regex = /([^:,]+:)([^,]*\(([^)]*)\)[^,]*|[^,]*)/g
  const matches = colors.match(regex)
  if (!matches) {
    return colors.trim()
  }

  const entries = matches.map(e => {
    const [key, value] = e.split(':')
    return [key.trim(), value.trim()]
  })
  const colorMap = Object.fromEntries(entries)

  // --- Prefer mapStyleId match
  if (mapStyleId && colorMap[mapStyleId]) {
    return colorMap[mapStyleId]
  }

  // --- Fallback: first color defined
  const first = entries[0]
  return first?.[1] || null
}
