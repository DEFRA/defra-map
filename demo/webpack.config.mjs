import webpack from 'webpack'
import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import dotenv from 'dotenv'
import { setupMiddlewares } from './server/main.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env') })

export default {
  entry: {
    main: [
      path.join(__dirname, 'client/main.js'),
      path.join(__dirname, 'client/main.scss')
    ]
  },
  devtool: 'source-map',
  mode: 'development',
  devServer: {
    allowedHosts: 'all',
    static: {
      directory: path.join(__dirname)
    },
    devMiddleware: {
      writeToDisk: true
    },
    // hot: false,
    compress: true,
    setupMiddlewares,
    host: '0.0.0.0',
    port: 3000,
    client: {
      overlay: false
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      chunks () {
        return false
      }
    },
    usedExports: true,
    minimize: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        DEFAULT_URL: JSON.stringify(process.env.DEFAULT_URL),
        DARK_URL: JSON.stringify(process.env.DARK_URL),
        AERIAL_URL: JSON.stringify(process.env.AERIAL_URL),
        DEUTERANOPIA_URL: JSON.stringify(process.env.DEUTERANOPIA_URL),
        TRITANOPIA_URL: JSON.stringify(process.env.TRITANOPIA_URL),
        OS_VTAPI_DEFAULT_URL: JSON.stringify(process.env.OS_VTAPI_DEFAULT_URL),
        OS_VTAPI_DARK_URL: JSON.stringify(process.env.OS_VTAPI_DARK_URL),
        OS_VTAPI_DEFAULT_DRAW_URL: JSON.stringify(process.env.OS_VTAPI_DEFAULT_DRAW_URL),
        OS_VTAPI_DARK_DRAW_URL: JSON.stringify(process.env.OS_VTAPI_DARK_DRAW_URL),
        MAPTILER_API_KEY: JSON.stringify(process.env.MAPTILER_API_KEY)
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
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
      },
      {
        test: /\.jsx?$/,
        use: ['magic-comments-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  ignoreWarnings: [
    {
      /* ignore scss warnings for now */
      module: /main\.scss/
    }
  ],
  target: ['web', 'es5'],
  performance: {
    // hints: false,
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
}
