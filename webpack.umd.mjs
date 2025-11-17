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

  const config = {
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
      chunkLoadingGlobal: 'webpackChunkdefra_DefraMap'
    },
    externalsType: 'var',
    externalsPresets: { web: true },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {}
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

  // KEY CHANGE: Core bundles Preact but ALSO externalizes it for src/index.js
  if (isCore) {
    // The wrapper (index.umd.js) bundles preact/hooks/compat
    // But we want to externalize them when webpack processes src/index.js
    // So we use a custom external function
    config.externals = [
      function({ request }, callback) {
        // Bundle these in index.umd.js
        if (request === 'preact' || 
            request === 'preact/hooks' || 
            request === 'preact/compat' ||
            request === 'preact/jsx-runtime') {
          // If we're in index.umd.js, bundle it
          if (this.context && this.context.includes('index.umd.js')) {
            return callback()
          }
          // If we're in any other file (like index.js), externalize it
          const externals = {
            'preact': 'preact',
            'preact/hooks': 'preactHooks',
            'preact/compat': 'preactCompat',
            'preact/jsx-runtime': 'preactJsxRuntime'
          }
          return callback(null, externals[request])
        }
        // For react aliases, always externalize
        if (request.startsWith('react')) {
          const externals = {
            'react': 'preactCompat',
            'react-dom': 'preactCompat',
            'react-dom/client': 'preactCompat',
            'react/jsx-runtime': 'preactJsxRuntime',
            'react/jsx-dev-runtime': 'preactJsxRuntime'
          }
          return callback(null, externals[request])
        }
        callback()
      }
    ]
  } else {
    // Plugins: always use external Preact
    config.externals = {
      'react': 'preactCompat',
      'react-dom': 'preactCompat',
      'react-dom/client': 'preactCompat',
      'react/jsx-runtime': 'preactJsxRuntime',
      'react/jsx-dev-runtime': 'preactJsxRuntime',
      'preact': 'preact',
      'preact/compat': 'preactCompat',
      'preact/hooks': 'preactHooks',
      'preact/jsx-runtime': 'preactJsxRuntime'
    }
  }

  return config
}

export default [
  // Core - bundle Preact in wrapper, externalize for library code
  createConfig(
    { 'index': './src/index.umd.js' },
    'DefraMap',
    true
  ),
  // Plugins - use external Preact
  createConfig(
    { 'maplibre-provider': './providers/maplibre/src/index.js' },
    'maplibreProvider'
  ),
  createConfig(
    { 'open-names-provider': './providers/open-names/src/index.js' },
    'openNamesProvider'
  ),
  createConfig(
    { 'draw-polygon-ml-plugin': './plugins/drawPolygonML/src/index.js' },
    'drawPolygonMLPlugin'
  ),
  createConfig(
    { 'search-plugin': './plugins/search/src/index.js' },
    'searchPlugin'
  ),
  createConfig(
    { 'select-plugin': './plugins/select/src/index.js' },
    'selectPlugin'
  ),
  createConfig(
    { 'data-layers-ml-plugin': './plugins/dataLayersML/src/index.js' },
    'dataLayersMLPlugin'
  ),
  createConfig(
    { 'menu-data-layers-plugin': './plugins/menuDataLayers/src/index.js' },
    'menuDataLayersPlugin'
  ),
  createConfig(
    { 'map-styles-plugin': './plugins/mapStyles/src/index.js' },
    'mapStylesPlugin'
  ),
  createConfig(
    { 'zoom-controls-plugin': './plugins/zoomControls/src/index.js' },
    'zoomControlsPlugin'
  ),
  createConfig(
    { 'scale-bar-plugin': './plugins/scaleBar/src/index.js' },
    'scaleBarPlugin'
  ),
]