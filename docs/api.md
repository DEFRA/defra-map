# API reference

The **Flood Map** is a customizable mapping interface, designed for specific use cases and with a focus on accessibiity. It is provided as a high-level API that works in conjunction with the MapLibre API. Alternative frameworks can be catererd for through the development of a custom provider.

The `FloodMap` object represents an instance of a flood map on your page. It provides methods and properties that allow you to programmatically modify the map and trigger events as users interact with it.

You create an instance of a `FloodMap` by specifying a `container`, map `options`, and an optional `callback` in the constructor. A Flood Map is then initialized on the page and returns an instance of a `FloodMap` object.

## Constructor

### `container` (**string**)

This parameter is required. The `id` of the html element on the page that will contain the map components

> [!NOTE]
> The default behaviour is to render a view map button into the container. The map, when open, is added to a new element immediately following the container. You can overide this behaviour by specifiying a specifc target for the map within the map options

### `options` ([**Options**](#options))

An object containing initial configuration options. The options object contains FloodMap specific `options` such as whether a button should be rendered to view the map. You can also add options for the framework constructor such as the intial center and zoom.

See [MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/) for a full list of the MapLibre options

```js
// Example that creates a minimal FloodMap
const floodMap = new FloodMap('map', {
    behaviour: 'hybrid', // FloodMap option
    center: [-2.938769, 54.893806], // MapLibre option
    zoom: 12 // MapLibre option
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

### `backgroundColor` (**string[[Color](./api/color.md)]**)

The fill colour of the map container. You can specify a single colour that applies to all map styles or a different colour for each map style. Defaults to `transparent`

```js
// Example: Biege for the default style and black for the dark style
backgroundColor: 'default: #f5f5f0, dark: #060606'
```

### `behaviour` (**string**)

Determines whether a view map button or the map itself should be displayed initially. This can be one of three values, `buttonFirst`, `hybrid` or `inline`. Defaults to `buttonFirst`.

If `buttonFirst` a view map button is displayed. Selecting the button opens the map and it is displayed fullscreen on all devices. An entry is added to the browser history and a back button is displayed within the map interface.

If `hybrid`, behaviour as per buttonFirst on a mobile device. On tablet and desktop devices there is no view map button. The map is displayed inline on the page.

If `inline` there is no view map button. The map is displayed inline on all devices.

```js
// Example: View map button on mobile devices, map inline on tablet and desktop
behaviour: 'hybrid'
```

### `buttonType`  (**string**)

Whether to use a button or anchor link to open the map. Values include `button` or `anchor`. Defaults to `button`. Only applicable if the behaviour is `buttonFirst` or `hybrid`.

```js
// Example: Use an anchor link to open the map
buttonType: 'anchor'
```

### `buttonText`  (**string**)

The button or anchor text used for the view map button. Defaults to 'View map'.

```js
// Example: Custom button text
buttonText: 'View map of main rivers'
```

### `checkMapSupport` (**function () => boolean**)

A function that is run immediately before a demand for the map. A response of `true` will load the map and a response of `false` will show the device compatibility error message. This is useful if you a need to use a modern feature that an older device doesn't support. By default the FloodMap checks device capabiities. It will serve a legacy version if the device has limited capabilities. It will fallback to the device compatibility error message if device does not meet the minimum requirements.

```js
// Example: Testing for popover support
deviceTestCallback: () => {
    const hasPopoverSupport = HTMLElement.prototype.hasOwnProperty('popover')
    return hasPopoverSupport
}
```

### _`draw`_ (**[draw](./api/draw.md)**)

### _`geocodeProvider`_ (GeocodeProvider instance)

An instance of a geocode provider class. Allows replacing the default geocode provider with a custom geocode provider.

### `hasAutoMode`  (**boolean**)

If `true` then a light or dark theme will be used for the map style and interface that corresponds to the current operating system appearance. If the operating appearance is changed the map style and interface will update automatically. If `false` then a light theme will be used for the initial map style and interafce, regardless of operating system appearance.

Selecting a dark basemap if available will always overide the map style and interface.

```js
// Example: Enable autoMode
hasAutoMode: true
```

### `hasGeoLocation`  (**boolean**)

If `true` a 'Use your location' button will be visible. Selecting this button will centre the map on the users current locaton if the website has permission to use location services. Defaults to `false`.

```js
// Example: Enable use your location button
hasGeoLocation: true
```

### `hasReset`  (**boolean**)

If `true` a 'Reset map view' button will be visible. Selecting this button will re-centre the map on initial location. Defaults to `false`.

```js
// Example: Enable reset map view button
hasReset: true
```

### `height`  (**string**)

The height of the map container, eg '600px' or '50%'. Used when the behaviour is inline or behaviour is hybrid and the browser size is desktop. If a percentage is used then an ancestor container will require a height.

```js
// Example: Set container height
height: '600px'
```

### `info`  (**[info](./api/info.md)**)

### `legend` (**[legend](./api/legend.md)**)

### _`mapProvider`_ (MapProvider instance)

An instance of a map provider class. Allows replacing the default map provider with a custom map provider.

### `place` (**string**)

The initial viewport description location. The viewport description includes the words 'Approximate centre `place`'. Defaults to the corresposnding lat lon coordinates if no `place` is provided.

```js
// Example: Set initial viewport description to 'Approximate centre Carlisle '
place: 'Carlisle'
```

### `queryLocation` (**[queryLocation](./api/query-location.md)**)

### `queryFeature` (**[queryFeature](./api/query-feature.md)**)

### _`reverseGeocodeProvider`_ (ReverseGeocodeProvider instance)

An instance of a reverser geocode provider class. Allows replacing the default reverse geocode provider with a custom reverse geocode provider.

### _`scaleBar`_ (**string**)

Adds a scale bar to the map. Values include `metric` or `imperial`. Defaults to `none`.

```js
// Example: Add an imperial scale bar
scaleBar: 'imperial'
```

### `search` (**[search](./api/search.md)**)

### `styles` (**array[[style](./api/style.md)]**)

### `symbols` (**array[string: url]**)

An array of SVG symbol URL's. URL's can be relative or absolute. SVG symbol files are loaded and processed by the map component at run time. They are made available for use on the map and within the key.

```js
// Example: Add a marker symbol for use on the map and or within the legend
symbols: [
    '/assets/images/symbol.svg'
]
```

### `target` (**string**)

The `id` of the html element on the page that will contain map container. Used if you need to render the map container in a custom target. By default the map container is rendered in a new element imediately after the default target. The open map button (when behaviour is set to buttonFirst or hybrid) will always be redered in the default target.

```js
// Example: Use a custom target for the map container
target: 'map-container'
```

### _`transformGeocodeRequest`_ (**function () => [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)**)

A callback run before a geocode or reverse geocode request is made for an external URL. The callback can be used to modify the url, set headers, or set the credentials property for cross-origin requests. Expected to return an instance of a [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object

### _`setupEsriConfig`_ (**function ([config](https://developers.arcgis.com/javascript/latest/api-reference/esri-config.html)) => void**)

A callback run before the underlying MapView is instantiated. This callback can be used to modify the config object such as configure authetication or add interceptors.

> [!NOTE]
> ESRI specific

## Events

To follow...

## Methods

### `setInfo` (**[Info](./api/info.md)**)

To follow...
