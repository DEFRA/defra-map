# API reference

The **Flood Map** is a customizable mapping interface designed for specific use cases, with a focus on accessibility. It is provided as a high-level API that works in conjunction with the MapLibre API.

The `FloodMap` object represents an instance of a flood map on your page. It provides methods and properties that allow you to programmatically modify the flood map and trigger events as users interact with it.

You create an instance of a `FloodMap` by specifying a `container`, map `options`, and an optional `callback` in the constructor. The Flood Map is then initialized on the page and returns an instance of a `FloodMap` object.

## Constructor

### `container` (**string**)

This parameter is required. This `id` of the html element on the page that will contain the map components

> [!NOTE]
> With the default behaviour a map open button is rendered into the container and the map, when open, is added to a new element immediately following the container. You can overide this behaviour by specifiying a specifc target for the map within the map options

### `options` ([**Options**](#options))

An object containing initial configuration options. The options object contains FloodMap specific `options` such as whether a button should be rendered to view the map. You can also add options for the framework map constructor such as the intial center and zoom.

See also [MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/) for a full list of the MapLibre options

```js
// Example that creates a minimal FloodMap
const floodMap = new FloodMap('map', {
    behaviour: 'hybrid',
    center: [-2.938769, 54.893806],
    zoom: 12
})
```

### `callback` (**function (provider: Provider) => void**)

An optional function that runs custom code immediately after the underlying map has been created. An example use case would be to add a custom event listener early in the render cycle. The callback maybe useful as the flood map is loaded on demand, for example when clicking the open map button. 

The callback has the single parameter `provider`. This contains framework references such as the map instance.

```js
// Exmaple that includes a callback
const floodMap = new FloodMap('map', options, (provider) => {
    console.log(provider)
})
```

## Options

### `backgroundColor` (**string[color]**)

### `behaviour` (**string**)

### `buttonType`  (**string**)

### `framework`  (**string**)

### `hasAutoMode`  (**boolean**)

### `hasGeoLocation`  (**boolean**)

### `hasReset`  (**boolean**)

### `height`  (**string**)

### `info`  (**[InfoObject](./docs/api/info-object.md)**)

### `legend` (**LegendObject**)

### `place` (**string**)

### `queryArea` (**QueryAreaObject**)

### `queryLocation` (**QueryLocationObject**)

### `queryFeature` (**QueryFeatureObject**)

### `search` (**SearchObject**)

### `styles` (**array[StyleObject]**)

### `symbols` (**array[string]**)

### `transformSearchRequest` (**function**)

## Events

To follow...

## Methods

### `setInfo` (**[InfoObject](./docs/api/info-object.md)**)

To follow...