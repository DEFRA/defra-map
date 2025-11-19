import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts'
import RemoveFilesPlugin from 'remove-files-webpack-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

const createUMDConfig = (entryName, entryPath, libraryPath, outDir, isCore = false, externalPreact = true) => {
  const distRoot = path.resolve(__dirname, outDir, '..')
  const cssFolder = path.resolve(__dirname, outDir, '../css') // Plugin-specific CSS folder

  // Ensure CSS folder exists before Webpack runs
  if (!fs.existsSync(cssFolder)) {
    fs.mkdirSync(cssFolder, { recursive: true })
  }

  const plugins = [
    new RemoveEmptyScriptsPlugin(),

    // Clean this plugin's CSS folder BEFORE anything
    new RemoveFilesPlugin({
      before: { include: [cssFolder] }
    }),

    new MiniCssExtractPlugin({
      filename: `../css/${entryName}.css`
    }),

    // Clean the UMD JS folder
    new RemoveFilesPlugin({
      before: { include: [path.resolve(__dirname, outDir)] }
    })
  ]

  // Core: remove "-full.css" after build
  if (isCore) {
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

  const libraryName = Array.isArray(libraryPath)
    ? ['defra', ...libraryPath]
    : ['defra', libraryPath]

  return {
    mode: 'production',

    entry: { [entryName]: entryPath },

    output: {
      path: path.resolve(__dirname, outDir),
      filename: '[name].js',
      chunkFilename: '[name].js',
      library: {
        name: libraryName,
        type: 'umd',
        export: 'default',
        umdNamedDefine: true
      },
      globalObject: 'this',
      chunkLoadingGlobal: 'webpackChunkdefra_DefraMap'
    },

    externalsType: 'var',
    externalsPresets: { web: true },

    externals: externalPreact
      ? {
          react: 'preactCompat',
          'react-dom': 'preactCompat',
          'react-dom/client': 'preactCompat',
          'react/jsx-runtime': 'preactJsxRuntime',
          'react/jsx-dev-runtime': 'preactJsxRuntime',
          preact: 'preact',
          'preact/compat': 'preactCompat',
          'preact/hooks': 'preactHooks',
          'preact/jsx-runtime': 'preactJsxRuntime'
        }
      : {},

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        preact: false,
        'preact/compat': false,
        'preact/hooks': false,
        'preact/jsx-runtime': false
      }
    },

    module: {
      rules: [
        { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
        { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
        { test: /\.s[ac]ss$/i, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] }
      ]
    },

    plugins,

    optimization: {
      splitChunks: { chunks: () => false },
      removeEmptyChunks: true
    }
  }
}

export default [
  // Core UMD
  createUMDConfig('index', './src/index.umd.js', 'DefraMap', 'dist/umd', true, false),

  // Providers
  createUMDConfig('index', './providers/maplibre/src/index.js', 'maplibreProvider', 'providers/maplibre/dist/umd'),
  createUMDConfig('index', './providers/open-names/src/index.js', 'openNamesProvider', 'providers/open-names/dist/umd'),

  // Plugins
  createUMDConfig('index', './plugins/scale-bar/src/index.js', 'scaleBarPlugin', 'plugins/scale-bar/dist/umd'),
  createUMDConfig('index', './plugins/zoom-controls/src/index.js', 'zoomControlsPlugin', 'plugins/zoom-controls/dist/umd'),
  createUMDConfig('index', './plugins/search/src/index.js', 'searchPlugin', 'plugins/search/dist/umd'),
  createUMDConfig('index', './plugins/select/src/index.js', 'selectPlugin', 'plugins/select/dist/umd'),
  createUMDConfig('index', './plugins/data-layers-ml/src/index.js', 'dataLayersMLPlugin', 'plugins/data-layers-ml/dist/umd'),
  createUMDConfig('index', './plugins/menu-data-layers/src/index.js', 'menuDataLayersPlugin', 'plugins/menu-data-layers/dist/umd'),
  createUMDConfig('index', './plugins/map-styles/src/index.js', 'mapStylesPlugin', 'plugins/map-styles/dist/umd'),
  createUMDConfig('index', './plugins/draw-polygon-ml/src/index.js', 'drawPolygonMLPlugin', 'plugins/draw-polygon-ml/dist/umd')
]
