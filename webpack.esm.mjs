import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts'
import RemoveFilesPlugin from 'remove-files-webpack-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

const createESMConfig = (entryName, entryPath, outDir, isCore = false) => {
  // Ensure plugin CSS folder exists
  const cssFolder = path.resolve(__dirname, outDir, '../css')
  if (!fs.existsSync(cssFolder)) {
    fs.mkdirSync(cssFolder, { recursive: true })
  }

  const plugins = [
    new RemoveEmptyScriptsPlugin(),

    new MiniCssExtractPlugin({
      filename: '../css/[name].css'
    }),

    // Clean ONLY this plugin's esm folder before build
    new RemoveFilesPlugin({
      before: {
        include: [path.resolve(__dirname, outDir)]
      }
    })
  ]

  // Core must also clean the shared dist/css BEFORE **anything**
  if (isCore) {
    // Insert cleanup BEFORE all other plugins
    plugins.unshift(
      new RemoveFilesPlugin({
        before: {
          include: [path.resolve(__dirname, 'dist/css')]
        }
      })
    )

    // Core removes `-full.css` afterwards
    plugins.push(
      new RemoveFilesPlugin({
        after: {
          test: [
            {
              folder: path.resolve(__dirname, 'dist/css'),
              method: p => p.endsWith('-full.css')
            }
          ]
        }
      })
    )
  }

  return {
    mode: 'production',

    entry: { [entryName]: entryPath },

    experiments: { outputModule: true },

    output: {
      path: path.resolve(__dirname, outDir, '../css'),

      // JS goes into dist/esm
      filename: '../esm/[name].js',
      chunkFilename: '../esm/[name].js',

      library: { type: 'module' }
    },

    resolve: {
      extensions: ['.js', '.jsx'],
      alias: isCore
        ? {
            react: 'preact/compat',
            'react-dom': 'preact/compat',
            'react/jsx-runtime': 'preact/jsx-runtime'
          }
        : {}
    },

    externals: isCore
      ? {}
      : {
          react: 'react',
          'react-dom': 'react-dom',
          'react/jsx-runtime': 'react/jsx-runtime',
          preact: 'preact',
          'preact/compat': 'preact/compat',
          'preact/hooks': 'preact/hooks',
          'preact/jsx-runtime': 'preact/jsx-runtime'
        },

    module: {
      rules: [
        { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
        { test: /\.s[ac]ss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] }
      ]
    },

    plugins,

    optimization: {
      chunkIds: 'named',
      moduleIds: 'named',
      splitChunks: false
    }
  }
}

export default [
  // Core ESM
  createESMConfig('index', './src/index.js', 'dist/esm', true),

  // Providers
  createESMConfig('index', './providers/maplibre/src/index.js', 'providers/maplibre/dist/esm'),
  createESMConfig('index', './providers/open-names/src/index.js', 'providers/open-names/dist/esm'),

  // Plugins
  createESMConfig('index', './plugins/scale-bar/src/index.js', 'plugins/scale-bar/dist/esm'),
  createESMConfig('index', './plugins/zoom-controls/src/index.js', 'plugins/zoom-controls/dist/esm'),
  createESMConfig('index', './plugins/search/src/index.js', 'plugins/search/dist/esm'),
  createESMConfig('index', './plugins/select/src/index.js', 'plugins/select/dist/esm'),
  createESMConfig('index', './plugins/data-layers-ml/src/index.js', 'plugins/data-layers-ml/dist/esm'),
  createESMConfig('index', './plugins/menu-data-layers/src/index.js', 'plugins/menu-data-layers/dist/esm'),
  createESMConfig('index', './plugins/map-styles/src/index.js', 'plugins/map-styles/dist/esm'),
  createESMConfig('index', './plugins/draw-polygon-ml/src/index.js', 'plugins/draw-polygon-ml/dist/esm')
]
