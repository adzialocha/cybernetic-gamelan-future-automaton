/* eslint-disable no-console */

const chalk = require('chalk')
const cors = require('cors')
const express = require('express')
const path = require('path')

const defaultOptions = {
  port: 9090,
}

class HTTPServer {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.server = express()

    this.server.set('port', process.env.PORT || this.options.port)
    this.server.use(cors({ origin: '*' }))
    this.server.use(express.static(path.join(__dirname, '..', 'dist')))
  }

  open() {
    const port = this.server.get('port')

    this.server.listen(port, () => {
      console.log(chalk.green('HTTP Server is running'), `(port ${port})`)
    })
  }
}

module.exports = HTTPServer
