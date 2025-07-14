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

export const getColor = (value, style) => {
  const colors = value?.replace(/\s/g, '').split(',').map(f => f.includes(':') ? f : `default:${f}`)
  const color = colors?.length ? (colors.find(f => f.includes(style)) || colors[0]).split(':')[1] : null
  return color
}
