import e from 'path'
const t = e.dirname(new URL(import.meta.url).pathname)
export default {
  entry: {
    client: e.join(t, 'src/flood-map.js')
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
  module: {
    rules: [{
      test: /\.jsx?$/i, use: ['babel-loader']
    }]
  }
}
