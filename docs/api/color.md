# color (string)

A single hexidecimal color value or a comma sperated list of key value pairs. Keys must be one of the following `default`, `dark`, `aerial`, `deuteranopia` or `tritanopia` and values must be hexidecimal colors, eg. `#d4351c`.

The color corresponding to the current map style will be applied if the key is included. If the key is not included then the value of the `default` key will be used. If ony a single hexidecimal value is provided, ie no key value pairs then this will be applied to all map styles.

```js
// Example: White for all map styles
'#ffffff'

// Example: Biege for the default style and black for the dark style
// Note: 'default' value will also be used for any other style that is not 'dark'
'default: #f5f5f0, dark: #060606'
```
