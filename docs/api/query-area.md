# queryArea

### `heading` (**string**)

The heading used within the legend.

### `submitLabel` (**string**)

The label used got the submit query button. When query area has been defined a button is added to run the query. Clicking the button will trigger a query event which includes details of the 'rendewred' features within the area.

### `helpLabel` (**string**)

The label used for the help button. Visible only in mobile and tablet.

### `keyLabel` (**string**)

The label text displayed in the key against the drawn feature.

### `html` (**string**)

A string of HTML. Provide help text instructions for using the drawing tools.

### `styles` (**array[[style](./style.md)]**)

An array of map style objects. Provides an option to swap map styles when the map the interface switches to draw mode to enable flexibility with different implementation licenses. For example, use a default open style when overlaying data and switch to a more detailed style when drawing features.
