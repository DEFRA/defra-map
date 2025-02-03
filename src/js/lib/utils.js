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

export const getColor = (value, basemap) => {
  const colors = value?.replace(/\s/g, '').split(',').map(f => f.includes(':') ? f : `default:${f}`)
  const color = colors?.length ? (colors.find(f => f.includes(basemap)) || colors[0]).split(':')[1] : null
  return color
}