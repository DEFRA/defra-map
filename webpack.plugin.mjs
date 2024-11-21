import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts'

const dirname = path.dirname(new URL(import.meta.url).pathname)

export default {
  mode: 'production',
  devtool: 'source-map',
  stats: {
    errorDetails: true
  },
  entry: {
    'flood-map': path.join(dirname, 'src/flood-map.js'),
    css: path.join(dirname, 'src/flood-map.scss')
  },
  output: {
    path: path.resolve(dirname, 'plugin'),
    filename: 'js/[name].js',
    library: {
      name: 'defraMap',
      type: 'window'
    }
  },
  target: ['web', 'es5'],
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
    new MiniCssExtractPlugin({
      filename: 'css/flood-map.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: dirname + '/src/templates',
          from: path.resolve(dirname, 'src/templates/*'),
          to: path.resolve(dirname, 'plugin/templates')
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules\/(?!(maplibre-gl)\/).*/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.s?css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true
            }
          },
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: 'url-loader'
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
