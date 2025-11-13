const defaults = {
  mapViewParamKey: 'mv',
  behaviour: 'buttonFirst',
  backgroundColor: 'var(--background-color)',
  maxMobileWidth: 640,
  minDesktopWidth: 835,
  containerHeight: '600px',
  mapSize: 'small',
  appColorScheme: 'light',
  autoColorScheme: false,
  mapLabel: 'Interactive map',
  buttonText: 'Map view',
  buttonClass: 'am-c-open-map-button',
  deviceNotSupportedText: 'Your device is not supported. A map is available with a more up-to-date browser or device.',
  genericErrorText: 'There was a problem loading the map. Please try again later.',
  keyboardHintText: '<span class="am-u-visually-hidden">Press </span><kbd>Alt</kbd> + <kbd>K</kbd> <span class="am-u-visually-hidden">to view </span>keyboard shortcuts',
  pageTitle: 'Map view',
  zoomDelta: 1,
  nudgeZoomDelta: 0.1,
  panDelta: 100,
  nudgePanDelta: 5,
  mapProvider: null,
  reverseGeocode: null
}

export default defaults
