export function attachAppEvents ({ baseTileLayer, eventBus }) {
  // App sets map style
  const handleSetMapStyle = (mapStyle) => {
    baseTileLayer.loadStyle(mapStyle.url)
  }
  eventBus.on('map:setmapstyle', handleSetMapStyle)
}
