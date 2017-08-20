const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

const SERVER_PORT = 9000
const APP_DEPENDENCIES = [
  'peerjs',
  'timesync',
]

const getPath = (filePath) => path.resolve(__dirname, filePath)

const extractSassPlugin = new ExtractTextPlugin({
  filename: '[name].css',
})

module.exports = {
  entry: {
    automaton: [
      getPath('./automaton/scripts/index.js'),
    ],
    lib: APP_DEPENDENCIES,
  },
  output: {
    path: getPath('./dist'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].bundle.map',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          getPath('./src'),
        ],
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
    contentBase: getPath('./src/assets'),
    port: SERVER_PORT,
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'lib',
      fileName: 'lib.[hash].js',
      minChunks: Infinity,
    }),
    new webpack.optimize.AggressiveMergingPlugin({}),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      hash: true,
      inject: 'body',
      template: getPath('./automaton/index.html'),
      minify: {
        collapseWhitespace: true,
        minifyJS: true,
        removeComments: true,
      },
    }),
    extractSassPlugin,
  ],
}
