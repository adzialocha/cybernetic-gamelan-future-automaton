const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconsPlugin = require('favicons-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')

const SERVER_PORT = 9000
const DIST_FOLDER = 'dist'
const SRC_FOLDER = 'automaton'

function getPath(filePath) {
  return path.resolve(__dirname, filePath)
}

module.exports = (env, options) => {
  const isProduction = options.mode === 'production'

  const plugins = [
    new HtmlPlugin({
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
    new FaviconsPlugin({
      logo: getPath(`./${SRC_FOLDER}/favicon.png`),
      persistentCache: false,
      prefix: '',
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        firefox: false,
      },
    }),
    new ExtractTextPlugin({
      filename: '[name].css',
    }),
  ]

  return {
    entry: getPath(`./${SRC_FOLDER}/scripts/index.js`),
    output: {
      path: getPath(`./${DIST_FOLDER}/play`),
      filename: '[name].js',
    },
    resolve: {
      modules: [
        'node_modules',
      ],
      alias: {
        'osc-js': getPath('./node_modules/osc-js/lib/osc.browser.js'),
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  minimize: isProduction,
                  sourceMap: false,
                },
              },
              {
                loader: 'sass-loader',
              },
            ],
          }),
        },
      ],
    },
    devtool: isProduction ? false : 'source-map',
    devServer: {
      compress: true,
      port: SERVER_PORT,
    },
    plugins,
  }
}
