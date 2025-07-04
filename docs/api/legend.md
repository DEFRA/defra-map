# Legend

### `isVisible` (**boolean**)

If `true` then the key is displayed on load. Defaults to `false`.

### `keyWidth` (**string**)

A CSS width value, eg '400px'. Used to specify the width of the key when visible on a tablet or dekstop. When the key is visible on a mobile it is positioned bottom with a width of 100%.

```js
// Example: Set legend width on tablet and desktop devices
keyWidth: '400px'
```

### `title` (**string**)

A string value. The title of the legend, eg Menu or Key or Legend.

```js
// Example: Set legend width on tablet and desktop devices
title: 'Menu'
```

### `width` (**string**)

A CSS width value, eg '360px'. Used to specify the width of the legend when visible on a tablet or dekstop. When the legend is vislbe on a mobile it has a predetermined width.

```js
// Example: Set legend width on tablet and desktop devices
width: '360px'
```

### `segments` (**array[[segment](./api/segment.md)]**)

An array of segement objects. Segments are used to categories datasets. The are presented within the legend as radio groups along with a heading.
