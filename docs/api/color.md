# Color (string)

A string containing either a single hexidecimal color value or a comma sperated list of key value pairs. Keys must be one of the following `default`, `dark`, `aerial`, `deuteranopia` or `tritanopia`. Values must be hexidecimal colors, eg. `#d4351c`.

The color correpsonding to the current map style will be applied if it is included. If it is not included then the `default` colour will be used and if ony a single hex color is provided then this will be applied to all map styles.

```js
// Example: White for all map styles
'#ffffff'

// Example: Biege for the default style and black for the dark style
'default: #f5f5f0, dark: #060606'
```