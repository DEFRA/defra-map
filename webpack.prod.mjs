import { merge } from 'webpack-merge'
import common from './webpack.dev.mjs'
import CompressionPlugin from 'compression-webpack-plugin'
import zlib from 'zlib'

export default merge(common, {
  mode: 'production',
  target: ['web', 'es5'],
  devServer: {
    hot: false
  },
  plugins: [
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
    })
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  },
  performance: {
    hints: false,
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
})