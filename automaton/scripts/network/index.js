import OSC, {
  IS_CLOSED,
  IS_OPEN,
} from 'osc-js'

const defaultOptions = {
  onClientsChanged: () => true,
  onClose: () => true,
  onError: () => true,
  onNextCycle: () => true,
  onOpen: () => true,
  onSyncTick: () => true,
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

    this.osc.on('error', error => {
      this.options.onError(error)
      this.disconnect()
    })

    // osc messages
    this.osc.on('/automaton/tick', message => {
      const [currentTick, totalTicksCount, originalTimestamp] = message.args

      this.options.onSyncTick(
        currentTick,
        totalTicksCount,
        parseInt(originalTimestamp, 10)
      )
    })

    this.osc.on('/automaton/cycle', message => {
      const [currentCycle] = message.args

      this.options.onNextCycle(currentCycle)
    })

    this.osc.on('/automaton/open', message => {
      const [clientsCount] = message.args

      this.options.onClientsChanged(clientsCount)
    })

    this.osc.on('/automaton/close', message => {
      const [clientsCount] = message.args

      this.options.onClientsChanged(clientsCount)
    })
  }

  connect(configuration) {
    if (this.osc.status() === IS_OPEN) {
      this.options.onError(new Error('Connection is already open'))

      return false
    }

    const { serverHost: host } = configuration
    const port = parseInt(configuration.serverPort, 10)
    const secure = window.location.href.includes('https')

    this.osc.open({ host, port, secure })

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
