import config from './config.json'

const place = ({ NAME1, POPULATED_PLACE, COUNTY_UNITARY, REGION }) => {
  return `${NAME1}${POPULATED_PLACE ? ', ' + POPULATED_PLACE : ''}${COUNTY_UNITARY ? ', ' + COUNTY_UNITARY : ''}, ${REGION}`
}

export const getNearest = async (coord, tokenCallback) => {
  const token = (await tokenCallback()).token
  let url = config.OS_NEAREST_URL
  url = url.replace('{easting}', Math.round(coord[0])).replace('{northing}', Math.round(coord[1]))
  const response = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  const json = await response.json()
  return json.results ? place(json.results[0].GAZETTEER_ENTRY) : null
}
