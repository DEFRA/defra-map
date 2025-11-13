export function attachEvents ({
  mapProvider,
  zoomInButton,
  zoomOutButton,
  zoomDelta,
  nudgeZoomDelta
}) {

  zoomInButton.onClick = () => {
    mapProvider.zoomIn(zoomDelta)
  }

  zoomOutButton.onClick = () => {
    mapProvider.zoomOut(zoomDelta)
  }
}
