# Flood map

## Useful Links
- [Development Guide](./docs/development-guide.md)
- [How to Publish](./docs/how-to-publish.md)

## Usage

### Installation

Run:

```shell
npm i @defra/flood-map
```

### Client Side Javascript

You will need to initialise flood map in your client side code:

```js
import FloodMap from '@defra/flood-map';
```

### HTML

In your html, will need to add a map placeholder container

```html
<div id="map"></div>
```

And finally a script tag, to prevent the floodmap widget "flashing" on page load/reload.

```html
<script>
    if (location.search.indexOf('view=map') >= 0) {
        if (window.matchMedia('(max-width: 640px)').matches) { // Condition need for Hybrid
          document.body.classList.add('fm-js-hidden')
        }
      }
</script>
```

## GOVUK Prototype kit

Add a .env file if you havent already got one and add the following keys

```
OS_API_KEY=[YOUR_OS_API_KEY]
DEFAULT_URL=[YOUR_DEFAULT_URL]
DARK_URL=[YOUR_DARK_URL]
AERIAL_URL=[YOUR_AERIAL_URL]
DEUTERANOPIA_URL=[YOUR_DEUTERANOPIA_URL]
TRITANOPIA_URL=[YOUR_TRITANOPIA_URL]
```

Add this code to app/routes.js

```js
router.use((req, res, next) => {
    res.locals.env = process.env
    next()
})
```
