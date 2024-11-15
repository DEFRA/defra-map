import { merge } from 'webpack-merge'
import common from './webpack.config.mjs'

export default merge(common, {
  mode: 'production',
  devServer: {
    hot: false
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  }
})
