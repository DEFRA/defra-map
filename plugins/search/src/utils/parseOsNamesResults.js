// src/plugins/search/osNamesUtils.js
import OsGridRef from 'geodesy/osgridref.js'

const POINT_BUFFER = 500
const MAX_RESULTS = 8

const isPostcode = (value) => {
  value = value.replace(/\s/g, '')
  const regex = /^(([A-Z]{1,2}\d[A-Z\d]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?\d[A-Z]{2}|BFPO ?\d{1,4}|(KY\d|MSR|VG|AI)[ -]?\d{4}|[A-Z]{2} ?\d{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/i
  return regex.test(value)
}

const removeNonEngland = (results) =>
  results.filter(r => r.GAZETTEER_ENTRY.COUNTRY.toLowerCase() === 'england')

const removeDuplicates = (results) =>
  Array.from(new Map(results.map(r => [r.GAZETTEER_ENTRY.ID, r])).values())

const removeTenuousResults = (results, query) => {
  const words = query.toLowerCase().replace(/,/g, '').split(' ')
  return results.filter(l => words.some(w => l.GAZETTEER_ENTRY.NAME1.toLowerCase().includes(w) || isPostcode(query)))
}

const markString = (string, find) => {
  const clean = find.replace(/\s+/g, '')
  // Create a pattern where whitespace is optional between every character
  // e.g. "ab12cd" -> "a\s* b\s* 1\s* 2\s* c\s* d"
  const spacedPattern = clean.split('').join('\\s*')
  const reg = new RegExp(`(${spacedPattern})`, 'i')
  return string.replace(reg, '<mark>$1</mark>')
}

// Public functions

const bounds = ({ MBR_XMIN, MBR_YMIN, MBR_XMAX, MBR_YMAX, GEOMETRY_X, GEOMETRY_Y }) => {
  let min, max
  if (MBR_XMIN != null) {
    min = (new OsGridRef(MBR_XMIN, MBR_YMIN)).toLatLon()
    max = (new OsGridRef(MBR_XMAX, MBR_YMAX)).toLatLon()
  } else {
    min = (new OsGridRef(GEOMETRY_X - POINT_BUFFER, GEOMETRY_Y - POINT_BUFFER)).toLatLon()
    max = (new OsGridRef(GEOMETRY_X + POINT_BUFFER, GEOMETRY_Y + POINT_BUFFER)).toLatLon()
  }
  return [min.lon, min.lat, max.lon, max.lat].map(n => Math.round(n * 1e6) / 1e6)
}

const point = ({ GEOMETRY_X, GEOMETRY_Y }) => {
  const p = (new OsGridRef(GEOMETRY_X, GEOMETRY_Y)).toLatLon()
  return [p.lon, p.lat].map(n => Math.round(n * 1e6) / 1e6)
}

const label = (query, { NAME1, COUNTY_UNITARY, DISTRICT_BOROUGH, POSTCODE_DISTRICT, LOCAL_TYPE }) => {
  const qualifier = `${!['City', 'Postcode'].includes(LOCAL_TYPE) ? POSTCODE_DISTRICT + ', ' : ''}${LOCAL_TYPE !== 'City' ? (COUNTY_UNITARY || DISTRICT_BOROUGH) : ''}`
  const text = `${NAME1}${qualifier ? ', ' + qualifier : ''}`
  return {
    text,
    marked: markString(text, query)
  }
}

const parseOsNamesResults = (json, query, crs) => {
  console.log(crs)
  if (!json || json.error || json.header?.totalresults === 0) {
    return []
  }
  let results = json.results
  results = removeTenuousResults(results, query)
  results = removeDuplicates(results)
  results = removeNonEngland(results)
  results = results.slice(0, MAX_RESULTS)

  return results.map(l => ({
    id: l.GAZETTEER_ENTRY.ID,
    bounds: bounds(l.GAZETTEER_ENTRY),
    point: point(l.GAZETTEER_ENTRY),
    ...label(query, l.GAZETTEER_ENTRY),
    type: 'os-names'
  }))
}

export {
  parseOsNamesResults
}