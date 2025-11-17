export default {
  load: async () => {
    const module = await import(/* webpackChunkName: "dm-reverse-geocode" */ './reverseGeocode.js')
    return module.reverseGeocode
  }
}
