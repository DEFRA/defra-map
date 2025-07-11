export function applyPreventDefaultFix (mapContainer) {
  // Store original preventDefault
  const originalPreventDefault = Event.prototype.preventDefault

  // Override preventDefault only for events targeting our map
  Event.prototype.preventDefault = function () {
    if ((this.type === 'touchmove' || this.type === 'touchstart') && !this.cancelable) {
      // Check if the event target is within our map container
      const mapCanvas = mapContainer.querySelector('.maplibregl-canvas')
      if (mapCanvas && (this.target === mapCanvas || mapCanvas.contains(this.target))) {
        return
      }
    }
    return originalPreventDefault.call(this)
  }
}
