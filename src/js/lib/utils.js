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
  return {
    default: '0 0',
    dark: '0 -120px',
    aerial: '0 -240px',
    deuteranopia: '0 -360px',
    tritanopia: '0 -480px',
    'high-contrast': '0 -600px',
    small: '0 -720px',
    large: '0 -840px'
  }[style]
}