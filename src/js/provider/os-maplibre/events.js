import { getDetail, addMapHoverBehaviour } from './query'
import { loadSymbols, addHighlightedLabelLayer, amendLineSymbolLayers, addShortcutMarkers, addSelectedLayers } from './symbols'

export const handleLoad = async (provider) => {
  await loadSymbols(provider)
  provider.isLoaded = true
  provider.dispatchEvent(new CustomEvent('load', {
    detail: {
      framework: { map: provider.map }
    }
  }))
}

export const handleStyleLoad = async (provider) => {
  const { map } = provider
  // Store ref to baselayers when a new style is loaded
  provider.baseLayers = map.getStyle().layers
  // Amend symbol-placement prop to so labels have a coordinate
  amendLineSymbolLayers(map)
  // Add highlighted label layer and source
  addHighlightedLabelLayer(provider)
  // Change cursor type on feature hover
  addMapHoverBehaviour(provider)
  if (provider.isLoaded) {
    await loadSymbols(provider)
    const { basemap } = provider
    provider.dispatchEvent(new CustomEvent('style', {
      detail: {
        type: 'basemap',
        basemap
      }
    }))
  }
}

export const handleIdle = async (provider) => {
  if (provider.map) {
    const { paddingBox, selectedId, scale } = provider
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = paddingBox
    const { offsetTop: parentOffsetTop, offsetLeft: parentOffsetLeft } = paddingBox.parentNode
    const pixel = [offsetLeft + parentOffsetLeft + (offsetWidth / 2), offsetTop + parentOffsetTop + (offsetHeight / 2)].map(c => c / scale)
    const detail = await getDetail(provider, selectedId ? null : pixel)
    addShortcutMarkers(provider, detail?.features?.featuresInViewport)
    provider.dispatchEvent(new CustomEvent('update', {
      detail
    }))
  }
}

export const handleMoveStart = (provider, e) => {
  provider.hideLabel()
  provider.dispatchEvent(new CustomEvent('movestart', {
    detail: {
      isUserInitiated: e.isUserInitiated || !!e.originalEvent
    }
  }))
}

export const handleStyleData = (provider, e) => {
  if (provider.baseLayers.length) {
    const { map, basemap, selectedId } = provider
    const featureLayers = e.target.getStyle().layers.filter(l => provider.featureLayers.includes(l.id))
    const selectedLayers = map.getStyle().layers.filter(l => l.id.includes('selected'))
    if (selectedLayers.length !== featureLayers.length) {
      const isDarkBasemap = ['dark', 'aerial'].includes(basemap)
      provider.selectedLayers = addSelectedLayers(map, featureLayers, selectedId, isDarkBasemap)
    }
  }
}

export const handleError = (_provider, _err) => {
  // console.log(err)
}
