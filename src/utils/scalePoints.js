export const scalePoints = (obj, scaleFactor) => {
  return Object.entries(obj).reduce((scaled, [side, value]) => {
    scaled[side] = Math.round(value / scaleFactor)
    return scaled
  }, {})
}
