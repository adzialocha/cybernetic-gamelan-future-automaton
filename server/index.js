/* eslint-disable no-console */

const chalk = require('chalk')

const HTTPServer = require('./httpServer')
const Network = require('./network')

const pkg = require('../package.json')

// hello!
console.log(
  chalk.bold.blue('Cybernetic'),
  chalk.bold.red('Gamelan'),
  chalk.bold.green('Future'),
  chalk.bold.magenta('Automaton')
)

console.log(`Version ${pkg.version}`)
console.log()

// initialize
const server = new HTTPServer()
const network = new Network({
  server,
})

server.open()
network.open()
