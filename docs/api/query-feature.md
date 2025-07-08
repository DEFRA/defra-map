# queryFeature

### layers  (**array[string: [id](https://maplibre.org/maplibre-style-spec/layers/#id)]**)

An array of mapbox style spec layer `id's`. Query feature functionality will be enabled for any corresponding layer that exists within the map. Query feature functionality includes selecting point and polygon features using touch, mouse or keyboard. After selecting a feature a `query` event is dispatched containing all rendered feature information.
