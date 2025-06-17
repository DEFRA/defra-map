export default {
  load: async () => {
    const module = await import(/* webpackChunkName: "flood-map-reverse-geocode-provider" */ './reverse-geocode.js')
    return module.default
  }
}
