export function attachAppEvents (map, eventBus) {
  const handleSetMapStyle = (mapStyle) => {
    map.setStyle(mapStyle.url, { diff: false })
  }

  const handleSetPixelRatio = (pixelRatio) => {
    map.setPixelRatio(pixelRatio)
  }

  eventBus.on('map:setmapstyle', handleSetMapStyle)
  eventBus.on('map:setpixelratio', handleSetPixelRatio)

  return {
    remove () {
      eventBus.off('map:setmapstyle', handleSetMapStyle)
      eventBus.off('map:setpixelratio', handleSetPixelRatio)
    }
  }
}
