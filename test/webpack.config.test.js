'use strict'

module.exports = {

  mode: 'development',
  optimization: {
    minimize: false
  },
  // Control how source maps are generated
  devtool: 'source-map',
  entry: {
    test: [
      './test/test_.js'
    ]
  },

  module: {
    rules: [
      {
        test: /\.js?/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },

  output: {
    // library: 'redux-localstorage-simple',
    // libraryTarget: 'umd',
    filename: '[name].js',
    path: __dirname
  }

}

