import config from './config.json'

const isPostcode = (value) => {
  value = value.replace(/\s/g, '')
  const regex = /^(([A-Z]{1,2}\d[A-Z\d]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?\d[A-Z]{2}|BFPO ?\d{1,4}|(KY\d|MSR|VG|AI)[ -]?\d{4}|[A-Z]{2} ?\d{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/i
  return regex.test(value)
}

// Remove 'England, GBR'
const stripSuffix = (results) => {
  return results.map(r => {
    return {
      ...r,
      text: r.text.replace(', England, GBR', '')
    }
  })
}

// Mark search charcaters in result
const markString = (string, find) => {
  find = find.replace(/,/g, '')
  const patterns = [...new Set([find, ...find.trim().split(/[stn]+/)])].join('|')
  const reg = new RegExp(`(${patterns})`, 'i', 'g', 'gi')
  return { __html: string.replace(reg, '<mark>$1</mark>') }
}

const place = (result) => {
  const { xmin, ymin, xmax, ymax } = result.extent
  const { x, y } = result.location
  const bbox = [xmin, ymin, xmax, ymax].map(n => Math.round(n * 1000000) / 1000000)
  const centre = [x, y].map(n => Math.round(n * 1000000) / 1000000)
  const { PlaceName } = result.attributes

  return {
    id: null,
    text: PlaceName,
    bbox,
    centre
  }
}

const suggestion = (query, { text, magicKey }) => {
  return {
    id: magicKey,
    text,
    marked: markString(text, query)
  }
}

class Provider {
  constructor (tokenCallback) {
    this.tokenCallback = tokenCallback
  }

  async suggest (query) {
    if (!query) {
      return []
    }
    const token = (await this.tokenCallback()).token
    let url = config.SUGGEST_URL.replace('{token}', token)
    url = url.replace('{query}', encodeURI(query)).replace('{maxSuggestions}', isPostcode(query) ? 1 : 8)
    const response = await fetch(url)
    const json = await response.json()
    if (json.error || !json.suggestions?.length) {
      return []
    }
    let results = json.suggestions.filter(r => r.text.toLowerCase().includes('england, gbr'))
    results = stripSuffix(results)
    if (!results.length) {
      return []
    }
    return results.map(r => suggestion(query, r))
  }

  async find (query, id) {
    if (!query) {
      return null
    }
    const token = (await this.tokenCallback()).token
    let url = config.FIND_ADDRESS_CANDIDATES_URL.replace('{token}', token)
    url = url.replace('{query}', encodeURI(query)).replace('{maxLocations}', 8).replace('{magicKey}', id || '')
    const response = await fetch(url)
    const json = await response.json()
    if (json.error || !json.candidates?.length) {
      return null
    }
    const results = json.candidates.filter(r => r.attributes.Region === 'England')
    return results.length ? place(results[0]) : null
  }
}

export default Provider
