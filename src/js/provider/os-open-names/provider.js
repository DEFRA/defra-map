export default {
  load: async () => {
    const module = await import(/* webpackChunkName: "flood-map-geocode-provider" */ './geocode.js')
    return module.default
  }
}
