export default {
  load: async () => {
    const module = await import(/* webpackChunkName: "am-reverse-geocode" */ './reverseGeocode.js')
    return module.reverseGeocode
  }
}
