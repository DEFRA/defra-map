import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts'
import RemoveFilesPlugin from 'remove-files-webpack-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

const createConfig = (entry, libraryPath, isCore = false, externalPreact = true) => {
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
              method: p => p.endsWith('-full.css')
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

    // Only externalize Preact for plugins
    externals: externalPreact ? {
      'react': 'preactCompat',
      'react-dom': 'preactCompat',
      'react-dom/client': 'preactCompat',
      'react/jsx-runtime': 'preactJsxRuntime',
      'react/jsx-dev-runtime': 'preactJsxRuntime',
      'preact': 'preact',
      'preact/compat': 'preactCompat',
      'preact/hooks': 'preactHooks',
      // All known JSX runtime variants
      'preact/jsx-runtime': 'preactJsxRuntime',
      'preact/jsx-runtime/dist/jsxRuntime.module.js': 'preactJsxRuntime',
      'preact/jsx-runtime/dist/jsxRuntime.umd.js': 'preactJsxRuntime',
      'preact/jsx-runtime/jsx-runtime': 'preactJsxRuntime'
    } : {},

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        'preact': false,
        'preact/compat': false,
        'preact/hooks': false,
        'preact/jsx-runtime': false
      }
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
          exclude: /node_modules/
        },
        {
          test: /\.s[ac]ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        }
      ]
    },

    plugins,

    optimization: {
      splitChunks: {
        chunks() {
          return false
        }
      },
      removeEmptyChunks: true
    }
  }
}

export default [
  // Core UMD build (bundles Preact)
  createConfig(
    { 'index': './src/index.umd.js' },
    'DefraMap',
    true,
    false   // Do NOT externalize Preact for core
  ),

  // Plugin builds (externalize Preact)
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
  )
]
