const defaultOptions = {
  onPatternBeginReceived: () => {},
  onStartReceived: () => {},
}

export default class CommunicationInterface {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)
    this.network = null
  }

  send(type, value) {
    if (!this.network) {
      return
    }

    const payload = {
      type,
    }

    if (typeof value !== 'undefined') {
      payload.value = value
    }

    this.network.sendToAll(payload)
  }

  receive(peer, data) {
    if (!data.type) {
      return
    }

    switch (data.type) {
    case 'START':
      this.options.onStartReceived()
      break
    case 'PATTERN_BEGIN':
      this.options.onPatternBeginReceived(peer)
      break
    }
  }

  setNetwork(network) {
    this.network = network
  }

  sendStartSignal() {
    this.send('START')
  }

  sendPatternBegin() {
    this.send('PATTERN_BEGIN')
  }
}
