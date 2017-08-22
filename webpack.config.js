const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

const pkg = require('./package.json')

const SERVER_PORT = 9000
const DIST_FOLDER = 'docs'
const SRC_FOLDER = 'automaton'
const VENDOR_FOLDER_NAME = 'lib'

const getPath = (filePath) => path.resolve(__dirname, filePath)

const extractSassPlugin = new ExtractTextPlugin({
  filename: '[name].css',
})

module.exports = {
  entry: {
    [SRC_FOLDER]: getPath(`./${SRC_FOLDER}/scripts/index.js`),
    [VENDOR_FOLDER_NAME]: Object.keys(pkg.dependencies),
  },
  output: {
    path: getPath(`./${DIST_FOLDER}`),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: getPath(`./${SRC_FOLDER}`),
        loader: 'babel-loader',
      },
      {
        test: /index\.html/,
        loader: 'html-loader',
      },
      {
        test: /\.scss$/,
        use: extractSassPlugin.extract({
          use: [{
            loader: 'css-loader',
            options: {
              minimize: true,
              sourceMap: true,
            },
          }, {
            loader: 'sass-loader',
          }],
          fallback: 'style-loader',
        }),
      },
      {
        test: /\.wav$/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: [
      '.js',
      '.scss',
    ],
  },
  devtool: 'source-map',
  devServer: {
    compress: true,
    port: SERVER_PORT,
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: VENDOR_FOLDER_NAME,
      fileName: '[name].[hash].js',
      minChunks: Infinity,
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: process.env.NODE_ENV === 'production',
    }),
    new webpack.optimize.AggressiveMergingPlugin({}),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      hash: true,
      inject: 'body',
      template: getPath(`./${SRC_FOLDER}/index.html`),
      minify: {
        collapseWhitespace: true,
        minifyJS: true,
        removeComments: true,
      },
    }),
    extractSassPlugin,
  ],
}
