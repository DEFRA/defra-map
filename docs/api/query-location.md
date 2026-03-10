# queryLocation

### layers  (**array[string: [id](https://maplibre.org/maplibre-style-spec/layers/#id)]**)

An array of mapbox style spec layer `id's`. Query location functionality will be enabled for any corresponding layer that exists within the map. Query location functionality includes identifying a point on the map using touch, mouse or keyboard. After identifying a point, a `query` event is dispatched containing all rendered feature information from the corresponding layers at this point.
