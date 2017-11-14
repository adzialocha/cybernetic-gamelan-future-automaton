const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

const SERVER_PORT = 9000
const DIST_FOLDER = 'dist'
const SRC_FOLDER = 'automaton'
const VENDOR_FOLDER_NAME = 'lib'

const APP_DEPENDENCIES = [
  'deep-assign',
  'key-code',
  'mathjs',
  'osc-js',
  'stats.js',
  'three',
]

const isProduction = process.env.NODE_ENV === 'production'

const getPath = filePath => path.resolve(__dirname, filePath)

const extractSassPlugin = new ExtractTextPlugin({
  filename: '[name].css',
})

const plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: VENDOR_FOLDER_NAME,
    fileName: '[name].[hash].js',
    minChunks: Infinity,
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
]

if (isProduction) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    sourceMap: false,
  }))
}

module.exports = {
  entry: {
    [SRC_FOLDER]: [
      getPath(`./${SRC_FOLDER}/scripts/index.js`),
    ],
    [VENDOR_FOLDER_NAME]: APP_DEPENDENCIES,
  },
  output: {
    path: getPath(`./${DIST_FOLDER}`),
    filename: '[name].js',
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
              minimize: isProduction,
              sourceMap: false,
            },
          }, {
            loader: 'sass-loader',
          }],
          fallback: 'style-loader',
        }),
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
    alias: {
      'osc-js': getPath('./node_modules/osc-js/lib/osc.browser.js'),
    },
  },
  devtool: isProduction ? false : 'source-map',
  devServer: {
    compress: true,
    port: SERVER_PORT,
  },
  plugins,
}
