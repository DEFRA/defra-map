import webpack from 'webpack'
import { merge } from 'webpack-merge'

import common from './webpack.plugin.mjs'

export default merge(common, {
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /js\/provider\/os-maplibre\/provider\.js/,
      './js/provider/esri-sdk/provider.js'
    )
  ]
})
