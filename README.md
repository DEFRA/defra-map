# Flood map

## Useful links
- [API reference](./docs/api.md)
- [Development guide](./docs/development-guide.md)
- [How to publish](./docs/how-to-publish.md)

## Usage

### Installation

Run:

```shell
npm i @defra/flood-map
```

### Client side JavaScript

You will need to initialise flood map in your client side code:

```js
import FloodMap from '@defra/flood-map';
```

### HTML

In your html, will need to add a map placeholder container

```html
<div id="map"></div>
```

And finally, if using buttonFirst or hybrid behaviour, a script tag to prevent the map "flashing" on page load/reload.

```html
    <script>document.body.classList.add('fm-js-hidden')</script>
```

## GOVUK Prototype kit

To follow...
