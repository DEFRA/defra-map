import e from 'webpack-node-externals'
import { merge as o } from 'webpack-merge'
import r from './webpack.config.mjs'
export default o(r, {
  mode: 'production',
  externals: [e()]
})
