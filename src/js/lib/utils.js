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

export const getScale = (size) => {
  return { small: 1, medium: 1.5, large: 2 }[size]
}

export const getPoint = (el, e, scale) => {
  const { left, top } = el.getBoundingClientRect()
  const { clientX, clientY } = e.nativeEvent
  const x = clientX - left
  const y = clientY - top
  return [x / scale, y / scale]
}
