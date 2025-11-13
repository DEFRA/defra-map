import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts'
import RemoveFilesPlugin from 'remove-files-webpack-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

const createConfig = (entry, libraryPath, isCore = false) => {
  const plugins = [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: '../css/[name].css'
    }),
  ]

  if (isCore) {
    plugins.push(
      new RemoveFilesPlugin({
        before: {
          include: [
            path.resolve(__dirname, 'dist/umd'),
            path.resolve(__dirname, 'dist/css')
          ]
        },
        after: {
          test: [
            {
              folder: path.resolve(__dirname, 'dist/css'),
              method: (p) => p.endsWith('-full.css')
            }
          ]
        }
      })
    )
  } else {
    plugins.push(
      new RemoveFilesPlugin({
        after: {
          test: [
            {
              folder: path.resolve(__dirname, 'dist/css'),
              method: (p) => p.endsWith('-full.css')
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
    entry,
    output: {
      path: path.resolve(__dirname, 'dist/umd'),
      filename: '[name].js',
      library: {
        name: libraryName,
        type: 'umd',
        export: 'default',
        umdNamedDefine: true
      },
      globalObject: 'this',
      chunkFilename: '[name].js',
      // CRITICAL: Tell webpack where to find externals for chunks
      chunkLoadingGlobal: 'webpackChunkdefra_DefraMap'
    },
    // CRITICAL: Set externalsType for proper external resolution
    externalsType: 'var',
    externalsPresets: { web: true },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      // NO aliases - we use external Preact for everything
      alias: {}
    },
    // Make Preact external for ALL bundles (core and plugins)
    // Using 'var' type means: 'react' becomes window.preactCompat
    externals: {
      'react': 'preactCompat',
      'react-dom': 'preactCompat',
      'react-dom/client': 'preactCompat',
      'react/jsx-runtime': 'preactJsxRuntime',
      'react/jsx-dev-runtime': 'preactJsxRuntime',
      'preact': 'preact',
      'preact/compat': 'preactCompat',
      'preact/hooks': 'preactHooks',
      'preact/jsx-runtime': 'preactJsxRuntime'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
      ],
    },
    plugins,
    optimization: {
      splitChunks: {
        chunks() {
          return false
        }
      },
      removeEmptyChunks: true
    },
  }
}

export default [
  // Core - now treats Preact as external
  createConfig(
    { 'defra-map': './src/defraMap.js' },
    'DefraMap',
    true
  ),
  // Plugins
  createConfig(
    { 'maplibre-provider': './src/providers/maplibre/index.js' },
    'maplibreProvider'
  ),
  createConfig(
    { 'open-names-provider': './src/providers/open-names/index.js' },
    'openNamesProvider'
  ),
  createConfig(
    { 'draw-polygon-ml-plugin': './src/plugins/drawPolygonML/index.js' },
    'drawPolygonMLPlugin'
  ),
  createConfig(
    { 'search-plugin': './src/plugins/search/index.js' },
    'searchPlugin'
  ),
  createConfig(
    { 'select-plugin': './src/plugins/select/index.js' },
    'selectPlugin'
  ),
  createConfig(
    { 'data-layers-ml-plugin': './src/plugins/dataLayersML/index.js' },
    'dataLayersMLPlugin'
  ),
  createConfig(
    { 'menu-data-layers-plugin': './src/plugins/menuDataLayers/index.js' },
    'menuDataLayersPlugin'
  ),
  createConfig(
    { 'map-styles-plugin': './src/plugins/mapStyles/index.js' },
    'mapStylesPlugin'
  ),
  createConfig(
    { 'zoom-controls-plugin': './src/plugins/zoomControls/index.js' },
    'zoomControlsPlugin'
  ),
  createConfig(
    { 'scale-bar-plugin': './src/plugins/scaleBar/index.js' },
    'scaleBarPlugin'
  ),
]