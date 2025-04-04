import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import e from 'path'

const t = e.dirname(new URL(import.meta.url).pathname)

export default {
  entry: {
    'flood-map': [
      e.join(t, 'src/flood-map.js'),
      e.join(t, 'src/flood-map.scss')
    ]
  },
  devtool: 'source-map',
  mode: 'production',
  output: {
    path: e.resolve(t, 'dist/es5'),
    filename: '[name].js',
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true  // Enable support for module output
  },
  // externals: [e()],
  target: ['web', 'es5'],
  optimization: {
    splitChunks: {
      chunks () {
        return false
      }
    }
  },
  performance: {
    // hints: false,
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/[name].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules\/(?!event-target-polyfill).+/,
        loader: 'babel-loader'
      },
      {
        test: /\.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  }
}
