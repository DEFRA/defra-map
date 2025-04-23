import config from './config.json'
import { detectCoordinateType } from '../../lib/viewport'
import { LatLon } from 'geodesy/osgridref.js'

const place = ({ NAME1, POPULATED_PLACE, COUNTY_UNITARY, REGION }) => {
  return `${NAME1}${POPULATED_PLACE ? ', ' + POPULATED_PLACE : ''}${COUNTY_UNITARY ? ', ' + COUNTY_UNITARY : ''}, ${REGION}`
}

export default async (zoom, coord, transformGeocodeRequest = (u) => u) => {
  // Need to convert WSG84 to BNG
  if (detectCoordinateType(coord) === 'WSG84') {
    try {
      const bng = (new LatLon(coord[1], coord[0])).toOsGrid()
      coord = [bng.easting, bng.northing]
    } catch (err) {
      console.log(err)
      return null
    }
  }

  let url = config.OS_NEAREST_URL
  url = url.replace('{easting}', Math.round(coord[0])).replace('{northing}', Math.round(coord[1]))
  const response = await fetch(await transformGeocodeRequest(url))
  const json = await response.json()
  return json.results ? place(json.results[0].GAZETTEER_ENTRY) : null
}
