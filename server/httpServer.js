/* eslint-disable no-console */

const chalk = require('chalk')
const cors = require('cors')
const express = require('express')
const http = require('http')
const path = require('path')

const defaultOptions = {
  port: 9090,
}

class HTTPServer {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.app = express()

    this.app.use(cors({ origin: '*' }))
    this.app.use(express.static(path.join(__dirname, '..', 'static')))
    this.app.use('/play', express.static(path.join(__dirname, '..', 'dist')))

    this.server = http.createServer(this.app)
  }

  open() {
    const port = process.env.PORT || this.options.port

    this.server.listen(port, () => {
      console.log(chalk.green('HTTP Server is running'), `(port ${port})`)
    })
  }
}

module.exports = HTTPServer
