/* eslint-disable no-console */

const chalk = require('chalk')
const OSC = require('osc-js')

const WebsocketServer = require('./wsServer')
const Sync = require('./sync')

const defaultOptions = {
  address: 'automaton',
  host: '0.0.0.0',
  onClose: () => true,
  onOpen: () => true,
  port: 52525,
  server: null,
}

class Network {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.clientsCount = 0

    this.osc = new OSC({
      plugin: new WebsocketServer({
        server: this.options.server,
        onClientOpen: (client, req) => {
          this.clientsCount += 1
          const ip = req.connection.remoteAddress
          console.log(`Client (${ip}) joined (total ${this.clientsCount})`)

          this.send('open', [this.clientsCount])
        },
        onClientClose: (client, req) => {
          this.clientsCount -= 1
          const ip = req.connection.remoteAddress

          console.log(`Client (${ip}) left (total ${this.clientsCount})`)

          this.send('close', [this.clientsCount])
        },
      }),
    })

    this.sync = new Sync({
      onTick: (currentTick, totalTicksCount) => {
        const latencyTimestamp = Date.now().toString()
        this.send('tick', [currentTick, totalTicksCount, latencyTimestamp])
      },
      onCycle: currentCycle => {
        this.send('cycle', [currentCycle])
      },
    })

    this.osc.on('error', error => {
      console.error(chalk.red('OSC error occurred'), error.message)
    })

    this.osc.on('open', () => {
      console.log(
        chalk.green('Websocket Server is running'),
        `(port ${this.options.port})`
      )

      this.options.onOpen()

      this.sync.start()
    })

    this.osc.on('close', () => {
      this.options.onClose()

      this.sync.stop()
    })
  }

  open() {
    const { port, host } = this.options
    this.osc.open({ host, port })
  }

  send(address, values) {
    const message = new OSC.Message([
      this.options.address,
      address,
    ])

    if (values) {
      values.forEach(value => {
        message.add(value)
      })
    }

    this.osc.send(message)
  }
}

module.exports = Network

