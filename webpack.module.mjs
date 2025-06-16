import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'

const dirname = path.dirname(new URL(import.meta.url).pathname)

export default {
  entry: {
    'flood-map': [
      path.join(dirname, 'src/flood-map.js'),
      path.join(dirname, 'src/flood-map.scss')
    ]
  },
  devtool: 'source-map',
  mode: 'production',
  output: {
    path: path.resolve(dirname, 'dist/es5'),
    filename: '[name].js',
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true // Enable support for module output
  },
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
    }),
    new webpack.NormalModuleReplacementPlugin(
      /esri\/provider\.js$/,
      path.resolve(dirname, 'src/js/provider/esri/provider.stub.js')
    )
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
      'react/jsx-runtime': 'preact/jsx-runtime',
      'esri/provider.js': path.join(dirname, 'src/js/provider/esri/provider.stub.js')
    }
  }
}
