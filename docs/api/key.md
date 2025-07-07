# key

### `collapse` (**string**)

Values include `collapse` or `expanded`. Defaults to `null`. A value of `collapse` will present the section as a collapsible an set its initial state to collapse. A value of `expanded` will present the section as a collapsible and set its initial state to expanded. The default value is null and the section is displayed as a non-collapsible.

> [!NOTE]
> When the segment or key group is displayd as a collapsible a toggle button is generated containing the heading, a summary of the selected items and show/hide text. The summary will update depending on which radio or checkboxes have been selected.

### `heading` (**string**)

The heading used for the section.

```js
// Example that adds a key section heading
heading: 'National trails'
```

### `items` (**array[[keyItem](./key-item.md)]**)

An array of `keyItem` objects. Key items are displayed as a checkbox group.

### `parentIds` (**array[string]**)

An array of `id's`. This key section will be visible if any parent section with a corresponding `id` is visible. If no parent sections with correspondig `id's` are visible then this section will be hidden.

```js
// Example to ensure section is only visible if parent is visible
parentIds: ['access']
```
