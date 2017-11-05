/* eslint-disable no-console */

const chalk = require('chalk')
const cors = require('cors')
const express = require('express')
const OSC = require('osc-js')
const path = require('path')

const pkg = require('../package.json')

const MS_PER_MINUTE = 60000

const options = {
  httpPort: 9090,
  websocketPort: 52525,
  address: 'automaton',
  bpm: 120,
  ticksPerSecond: 120,
}

function bpmToMs(bpm, duration) {
  return (MS_PER_MINUTE / bpm) * (1 / duration) * 4
}

function bpmToMsTicksPerSecond(bpm, duration) {
  return bpmToMs(bpm, duration) / 2
}

console.log(
  chalk.bold.blue('Cybernetic'),
  chalk.bold.red('Gamelan'),
  chalk.bold.green('Future'),
  chalk.bold.magenta('Automaton')
)

console.log(`Version ${pkg.version}`)
console.log()

const app = express()

app.set('port', process.env.PORT || options.httpPort)

app.use(cors({ origin: '*' }))
app.use(express.static(path.join(__dirname, '..', 'dist')))

app.listen(app.get('port'), () => {
  console.log(
    chalk.green('HTTP Server is running'),
    `(port ${app.get('port')})`
  )
})

// Websocket OSC handler
const osc = new OSC({ plugin: new OSC.WebsocketServerPlugin() })

osc.on('error', error => {
  console.error(chalk.red('OSC Error occurred'), error)
})

let currentCycleTick = 0
let currentCycle = 0

function tick() {
  osc.send(
    new OSC.Message(
      [options.address, 'tick'],
      currentCycleTick,
      options.ticksPerSecond
    )
  )

  currentCycleTick += 1

  if (currentCycleTick > options.ticksPerSecond) {
    currentCycleTick = 0

    osc.send(
      new OSC.Message(
        [options.address, 'cycle'],
        currentCycle
      )
    )

    currentCycle += 1
  }
}

osc.on('open', () => {
  console.log(
    chalk.green('Websocket Server is running'),
    `(port ${options.websocketPort})`
  )

  setInterval(tick, bpmToMsTicksPerSecond(options.bpm, options.ticksPerSecond))
})

osc.open({
  host: '0.0.0.0',
  port: options.websocketPort,
})
