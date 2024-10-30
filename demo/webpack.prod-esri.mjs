import webpack from 'webpack'
import path from 'path'
import dotenv from 'dotenv'
import { mergeWithCustomize } from 'webpack-merge'
import common from './webpack.config.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env') })

export default mergeWithCustomize({
  customizeObject (a, b, key) {
    if (key === 'entry') {
      return b
    }
    return undefined
  }
})(common, {
  mode: 'production',
  devServer: {
    hot: false
  },
  entry: {
    main: [
      path.join(__dirname, 'client/planning.js'),
      path.join(__dirname, 'client/main.scss')
    ],
    'long-term': [
      path.join(__dirname, 'client/long-term.js')
    ]
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /js\/provider\/os-maplibre\/provider\.js/,
      './js/provider/esri-sdk/provider.js'
    )
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  }
})
