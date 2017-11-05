import OSC, {
  IS_CLOSED,
  IS_OPEN,
} from 'osc-js'

const defaultOptions = {
  onClose: () => {},
  onError: () => {},
  onOpen: () => {},
  onSyncTick: () => {},
  onNextCycle: () => {},
}

export default class Network {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.osc = new OSC()

    // osc events

    this.osc.on('open', () => {
      this.options.onOpen()
    })

    this.osc.on('close', () => {
      this.options.onClose()
    })

    this.osc.on('error', err => {
      this.options.onError(err)
      this.disconnect()
    })

    // osc messages

    this.osc.on('/automaton/tick', message => {
      const [currentTick, totalTicksCount] = message.args
      this.options.onSyncTick(currentTick, totalTicksCount)
    })

    this.osc.on('/automaton/cycle', message => {
      const [currentCycle] = message.args
      this.options.onNextCycle(currentCycle)
    })
  }

  connect(configuration) {
    if (this.osc.status() === IS_OPEN) {
      this.options.onError(new Error('Connection is already open'))

      return false
    }

    const { serverHost: host } = configuration
    const port = parseInt(configuration.serverPort, 10)

    this.osc.open({ host, port })

    return true
  }

  disconnect() {
    if (this.osc.status() === IS_CLOSED) {
      this.options.onError(new Error('Connection is already closed'))
    }

    this.osc.close()
  }

  sendToAll() {
    // const message = new OSC.Message(address)
    // osc.send(message)
  }
}
