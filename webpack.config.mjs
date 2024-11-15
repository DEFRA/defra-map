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
  mode: 'development',
  output: {
    path: e.resolve(t, 'dist'),
    library: {
      type: 'commonjs2'
    }
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
      filename: '[name].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i, use: ['babel-loader']
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
  }
}
