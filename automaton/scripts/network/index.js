import OSC, {
  IS_CLOSED,
  IS_OPEN,
} from 'osc-js'

const TICK_INTERVAL = 16
const TOTAL_TICKS = 120

const defaultOptions = {
  isStandaloneMode: false,
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

    this.standaloneInterval = null
    this.standaloneCurrentTick = 0
    this.standaloneCurrentCycle = 0

    this.osc = new OSC()

    // osc events
    this.osc.on('open', () => {
      this.options.onOpen()
    })

    this.osc.on('close', () => {
      this.options.onClose()
    })

    this.osc.on('error', () => {
      this.options.onError('Websocket error')
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
    if (this.options.isStandaloneMode) {
      this.startStandalone()
      return true
    }

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
    if (this.options.isStandaloneMode) {
      this.stopStandalone()
      return
    }

    if (this.osc.status() === IS_CLOSED) {
      this.options.onError(new Error('Connection is already closed'))
    }

    this.osc.close()
  }

  startStandalone() {
    this.standaloneCurrentTick = 0
    this.standaloneCurrentCycle = 0

    this.standaloneInterval = setInterval(() => {
      this.options.onSyncTick(
        this.standaloneCurrentTick,
        TOTAL_TICKS,
        Date.now()
      )

      this.standaloneCurrentTick += 1

      if (this.standaloneCurrentTick > TOTAL_TICKS) {
        this.standaloneCurrentTick = 0
        this.standaloneCurrentCycle += 1

        this.options.onNextCycle(this.standaloneCurrentCycle)
      }
    }, TICK_INTERVAL)

    setTimeout(() => {
      this.options.onOpen()
    })
  }

  stopStandalone() {
    if (this.standaloneInterval) {
      clearInterval(this.standaloneInterval)
    }

    setTimeout(() => {
      this.options.onClose()
    })
  }
}
