export function attachAppEvents ({ baseTileLayer, eventBus }) {
  const handleSetMapStyle = mapStyle => {
    baseTileLayer.loadStyle(mapStyle.url).then(() => {
      eventBus.emit('map:stylechange', mapStyle)
    })
  }

  eventBus.on('map:setmapstyle', handleSetMapStyle)

  return {
    remove () {
      eventBus.off('map:setmapstyle', handleSetMapStyle)
    }
  }
}
