import webpack from 'webpack'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { setupMiddlewares } from './demo/server/main.js'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './.env'), quiet: true })

export default {
  mode: 'development',
  target: ['web', 'es5'],
  entry: {
    // Main CSS entry: guarantees it is output first
    main: path.join(__dirname, 'demo/scss/index.scss'),
    // App entry: all JS and plugin dynamic imports
    index: path.join(__dirname, 'demo/js/index.js')
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        // OS Open Zoomstack
        OUTDOOR_URL: JSON.stringify(process.env.OUTDOOR_URL),
        NIGHT_URL: JSON.stringify(process.env.NIGHT_URL),
        DEUTERANOPIA_URL: JSON.stringify(process.env.DEUTERANOPIA_URL),
        TRITANOPIA_URL: JSON.stringify(process.env.TRITANOPIA_URL),
        // OS Vector Tile API
        VTS_OUTDOOR_URL: JSON.stringify(process.env.VTS_OUTDOOR_URL),
        VTS_DARK_URL: JSON.stringify(process.env.VTS_DARK_URL),
        VTS_BLACK_AND_WHITE_URL: JSON.stringify(process.env.VTS_BLACK_AND_WHITE_URL),
        // Aerial photography
        AERIAL_URL: JSON.stringify(process.env.AERIAL_URL),
        // KEYS
        OS_API_KEY: JSON.stringify(process.env.OS_API_KEY),
        OS_CLIENT_ID: JSON.stringify(process.env.OS_CLIENT_ID),
        OS_CLIENT_SECRET: JSON.stringify(process.env.OS_CLIENT_SECRET),
        // OS Names API
        OS_NAMES_URL: JSON.stringify(process.env.OS_NAMES_URL),
        OS_NEAREST_URL: JSON.stringify(process.env.OS_NEAREST_URL),
        // Gridref services
        GRIDREF_SERVICE_URL: JSON.stringify(process.env.GRIDREF_SERVICE_URL),
        // WFS services
        WFS_SERVICE_URL: JSON.stringify(process.env.WFS_SERVICE_URL),
        WFS_DATA_URL: JSON.stringify(process.env.WFS_DATA_URL),
        PARCEL_SERVICE_URL: JSON.stringify(process.env.PARCEL_SERVICE_URL)
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules\/(?!(lucide-react))/
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      }
    ],
  },
  devServer: {
    static: [
    {
      directory: path.join(__dirname, 'demo'),
    },
    {
      directory: path.join(__dirname, 'assets'),
      publicPath: '/assets' // Images served from here as used in both demo and prototype kit plugin
    }
  ],
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    setupMiddlewares
  },
  optimization: {
    splitChunks: {
      chunks () {
        return false
      }
    }
  }
}