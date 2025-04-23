import webpack from 'webpack'
import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import dotenv from 'dotenv'
import { setupMiddlewares } from './server/main.js'
import CompressionPlugin from 'compression-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import zlib from 'zlib'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env') })

export default {
  entry: {
    main: [
      path.join(__dirname, 'client/main.js'),
      path.join(__dirname, 'client/main.scss')
    ],
    draw: [
      path.join(__dirname, 'client/draw.js')
    ]
  },
  devtool: 'source-map',
  mode: 'development',
  devServer: {
    allowedHosts: 'all',
    static: [{
      directory: path.resolve(__dirname),
      publicPath: '/',
    },
    {
      directory: path.resolve(__dirname, 'dist'),
      publicPath: '/dist/'
    },
    {
      directory: path.resolve(__dirname, '../dist'),
      publicPath: '/public/'
    }],
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
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  optimization: {
    splitChunks: {
      chunks () {
        return false
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        DEFAULT_URL: JSON.stringify(process.env.DEFAULT_URL),
        DARK_URL: JSON.stringify(process.env.DARK_URL),
        AERIAL_URL: JSON.stringify(process.env.AERIAL_URL),
        DEUTERANOPIA_URL: JSON.stringify(process.env.DEUTERANOPIA_URL),
        TRITANOPIA_URL: JSON.stringify(process.env.TRITANOPIA_URL),
        TILE_SERVER_URL: JSON.stringify(process.env.TILE_SERVER_URL),
        OS_VTAPI_DEFAULT_URL: JSON.stringify(process.env.OS_VTAPI_DEFAULT_URL),
        OS_VTAPI_DARK_URL: JSON.stringify(process.env.OS_VTAPI_DARK_URL),
        OS_VTAPI_DEFAULT_DRAW_URL: JSON.stringify(process.env.OS_VTAPI_DEFAULT_DRAW_URL),
        OS_VTAPI_DARK_DRAW_URL: JSON.stringify(process.env.OS_VTAPI_DARK_DRAW_URL),
        MAPTILER_API_KEY: JSON.stringify(process.env.MAPTILER_API_KEY),
        MAPBOX_API_KEY: JSON.stringify(process.env.MAPBOX_API_KEY),
        CFF_WARNING_POLYGONS: JSON.stringify(process.env.CFF_WARNING_POLYGONS),
        CFF_WARNING_CENTROIDS: JSON.stringify(process.env.CFF_WARNING_CENTROIDS),
        CFF_STATION_CENTROIDS: JSON.stringify(process.env.CFF_STATION_CENTROIDS)
      }
    }),
    new HtmlWebpackPlugin({
      template: './counties.html',
      filename: 'counties.html',
      inject: false,
      templateParameters: process.env
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
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
    }),
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
