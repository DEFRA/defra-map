import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts'
import path from 'path'

const dirname = path.dirname(new URL(import.meta.url).pathname)

export default {
  mode: 'production',
  devtool: 'source-map',
  stats: {
    errorDetails: true
  },
  entry: {
    'flood-map': path.join(dirname, 'src/flood-map.js')
  },
  output: {
    path: path.resolve(dirname, 'dist/js'),
    filename: '[name].js',
    library: {
      name: 'defra',
      type: 'window'
    }
  },
  target: ['web', 'es5'],
  // externals: {
  //   'maplibre-gl': 'maplibregl'
  // },
  optimization: {
    splitChunks: {
      chunks () {
        return false
      }
    },
    removeEmptyChunks: true
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: dirname + '/src/templates',
          from: path.resolve(dirname, 'src/templates/*'),
          to: path.resolve(dirname, 'dist/templates')
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.jsx?$/,
        use: ['magic-comments-loader']
      }
    ]
  },
  ignoreWarnings: [
    {
      module: /flood-map\.scss/
    }
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
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
}
