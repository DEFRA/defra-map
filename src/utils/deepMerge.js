export const deepMerge = (base, override) => {
  const result = { ...base }

  for (const key in override) {
    if (typeof override[key] === 'object' && !Array.isArray(override[key]) && override[key] !== null) {
      result[key] = deepMerge(base[key] || {}, override[key])
    } else {
      result[key] = override[key]
    }
  }

  return result
}