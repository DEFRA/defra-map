export function attachAppEvents (map, eventBus) {
  // App sets map style
  const handleSetMapStyle = (mapStyle) => {
    map.setStyle(mapStyle.url, { diff: false })
  }
  eventBus.on('map:setmapstyle', handleSetMapStyle)

  // App sets map size
  const handleSetPixelRatio = (pixelRatio) => {
    map.setPixelRatio(pixelRatio)
  }
  eventBus.on('map:setpixelratio', handleSetPixelRatio)
}
