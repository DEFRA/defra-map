import { defaults } from  '../store/constants'

export const parseAttribute = a => {
  try {
    return JSON.parse(a)
  } catch (e) {
    return a
  }
}

export const isSame = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const getQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

export const hasQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.has(name)
}

export const getImagePos = (style) => {
  return { default: '0 0', dark: '0 -120px', aerial: '0 -240px', deuteranopia: '0 -360px', tritanopia: '0 -480px' }[style]
}

export const getBasemap = (styles) => {
  const validStyles = defaults.STYLES.map(s => styles[s + 'Url'] && s).filter(b => !!b)
  const basemap = window.localStorage.getItem('basemap') || 'default'
  const isValid = validStyles.includes(basemap)
  return isValid ? basemap : 'default'
}
