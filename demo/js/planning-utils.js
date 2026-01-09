const hideMenu = function (defraMap) {
  var menu = document.querySelector('#map-panel-menu')
  if (menu?.getAttribute('aria-modal') === 'true') {
    defraMap.hidePanel('menu')
  }
}

const getShape = function (geometry) {
  return 'square'
}

export {
  hideMenu,
  getShape
}