const defaultOptions = {
  onUniverseEnterReceived: () => {},
}

export default class Communication {
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

  sendUniverseEntered() {
    this.send('UNIVERSE_ENTER')
  }

  receive(peer, data) {
    if (!data.type) {
      return
    }

    switch (data.type) {
    case 'UNIVERSE_ENTER':
      this.options.onUniverseEnterReceived()
      break
    }
  }

  setNetwork(network) {
    this.network = network
  }
}
