import OsGridRef from 'geodesy/osgridref.js'
import config from './config.json'

const isPostcode = (value) => {
  value = value.replace(/\s/g, '')
  const regex = /^(([A-Z]{1,2}\d[A-Z\d]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?\d[A-Z]{2}|BFPO ?\d{1,4}|(KY\d|MSR|VG|AI)[ -]?\d{4}|[A-Z]{2} ?\d{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/i
  return regex.test(value)
}

// Exclude Scotalnd, Wales and Northern Ireland results
const removeNonEngland = (results) => {
  return results.filter(r => r.GAZETTEER_ENTRY.COUNTRY.toLowerCase() === 'england')
}

// Remove duplicates (OS API bug?) eg: 'Newcastle upon Tyne'
const removeDuplicates = (results) => {
  return Array.from(new Map(results.map(result => [result.GAZETTEER_ENTRY.ID, result])).values())
}

// Remove any item that doesnt contain a part of the query in name1
const removeTenuousResults = (results, query) => {
  const words = query.toLowerCase().replace(/,/g, '').split(' ')
  return results.filter(l => words.some(w => l.GAZETTEER_ENTRY.NAME1.toLowerCase().includes(w)))
}

// Mark search charcaters in result
const markString = (string, find) => {
  find = find.replace(/,/g, '')
  const patterns = [...new Set([find, ...find.trim().split(/[stn]+/)])].join('|')
  const reg = new RegExp(`(${patterns})`, 'i', 'g', 'gi')
  return { __html: string.replace(reg, '<mark>$1</mark>') }
}

const place = ({ ID, NAME1, MBR_XMIN, MBR_YMIN, MBR_XMAX, MBR_YMAX, GEOMETRY_X, GEOMETRY_Y }) => {
  const bounds = MBR_XMIN
    ? [
        (new OsGridRef(MBR_XMIN, MBR_YMIN)).toLatLon().lon,
        (new OsGridRef(MBR_XMIN, MBR_YMIN)).toLatLon().lat,
        (new OsGridRef(MBR_XMAX, MBR_YMAX)).toLatLon().lon,
        (new OsGridRef(MBR_XMAX, MBR_YMAX)).toLatLon().lat]
        .map(n => Math.round(n * 1000000) / 1000000)
    : [
        (new OsGridRef(GEOMETRY_X - config.POINT_BUFFER, GEOMETRY_Y - config.POINT_BUFFER)).toLatLon().lon,
        (new OsGridRef(GEOMETRY_X - config.POINT_BUFFER, GEOMETRY_Y - config.POINT_BUFFER)).toLatLon().lat,
        (new OsGridRef(GEOMETRY_X + config.POINT_BUFFER, GEOMETRY_Y + config.POINT_BUFFER)).toLatLon().lon,
        (new OsGridRef(GEOMETRY_X + config.POINT_BUFFER, GEOMETRY_Y + config.POINT_BUFFER)).toLatLon().lat]
        .map(n => Math.round(n * 1000000) / 1000000)
  const center = GEOMETRY_X
    ? [(new OsGridRef(GEOMETRY_X, GEOMETRY_Y)).toLatLon().lon,
        (new OsGridRef(GEOMETRY_X, GEOMETRY_Y)).toLatLon().lat]
        .map(n => Math.round(n * 1000000) / 1000000)
    : null

  return {
    id: ID,
    text: NAME1,
    bounds,
    center
  }
}

const suggestion = (query, { ID, NAME1, COUNTY_UNITARY, DISTRICT_BOROUGH, POSTCODE_DISTRICT, LOCAL_TYPE }) => {
  const qualifier = `${!['City', 'Postcode'].includes(LOCAL_TYPE) ? POSTCODE_DISTRICT + ', ' : ''}${LOCAL_TYPE !== 'City' ? (COUNTY_UNITARY || DISTRICT_BOROUGH) : ''}`
  const text = `${NAME1}${qualifier ? ', ' + qualifier : ''}`

  return {
    id: ID,
    text: `${NAME1}${qualifier ? ', ' + qualifier : ''}`,
    marked: markString(text, query)
  }
}

const parseResults = async (query, transformGeocodeRequest) => {
  if (!query) {
    return []
  }
  let url = config.URL
  url = url.replace('{query}', encodeURI(query)).replace('{maxresults}', isPostcode(query) ? 1 : 100)
  let results = []
  try {
    const response = await fetch(await transformGeocodeRequest(url))
    const json = await response.json()
    if (json.error || json.header.totalresults === 0) {
      return []
    }
    results = removeTenuousResults(json.results, query)
    results = removeDuplicates(results)
    results = removeNonEngland(results)
    results = results.slice(0, 8)
  } catch (err) {
    console.log(err)
  }
  return results
}

class Geocode {
  constructor (transformGeocodeRequest = (u) => u) {
    this.transformGeocodeRequest = transformGeocodeRequest
  }

  async suggest (query) {
    if (!query) {
      return []
    }
    const results = await parseResults(query, this.transformGeocodeRequest)
    return results.map(l => suggestion(query, l.GAZETTEER_ENTRY))
  }

  async find (query) {
    if (!query) {
      return null
    }
    const results = await parseResults(query, this.transformGeocodeRequest)
    return results.length ? place(results[0].GAZETTEER_ENTRY) : null
  }
}

export default Geocode
