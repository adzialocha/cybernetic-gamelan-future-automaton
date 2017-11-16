const WSServer = require('ws').Server

const STATUS = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3,
}

const defaultOptions = {
  heartbeatInterval: 30000,
  host: '0.0.0.0',
  onClientClose: () => true,
  onClientOpen: () => true,
  port: 52525,
}

class WebsocketServer {
  constructor(customOptions) {
    this.options = Object.assign({}, defaultOptions, customOptions)

    this.socket = null
    this.socketStatus = STATUS.IS_NOT_INITIALIZED
    this.pingInterval = null

    this.notify = () => {}
  }

  registerNotify(fn) {
    this.notify = fn
  }

  status() {
    return this.socketStatus
  }

  open(customOptions = {}) {
    const options = Object.assign({}, this.options, customOptions)
    const { port, host } = options

    // close socket when already given
    if (this.socket) {
      this.close()
    }

    // create websocket server
    this.socket = new WSServer({ host, port })
    this.socket.binaryType = 'arraybuffer'
    this.socketStatus = STATUS.IS_CONNECTING

    // register events
    this.socket.on('listening', () => {
      this.socketStatus = STATUS.IS_OPEN
      this.notify('open')
      this.startHeartbeat()
    })

    this.socket.on('close', () => {
      this.stopHeartbeat()
    })

    this.socket.on('error', error => {
      this.notify('error', error)
    })

    this.socket.on('connection', (client, req) => {
      client.isAlive = true

      this.options.onClientOpen(client, req)

      client.on('close', () => {
        client.isAlive = false
        this.options.onClientClose(client, req)
      })

      client.on('message', message => {
        this.notify(new Uint8Array(message))
      })

      client.on('pong', () => {
        client.isAlive = true
      })
    })
  }

  close() {
    this.socketStatus = STATUS.IS_CLOSING

    this.socket.close(() => {
      this.socketStatus = STATUS.IS_CLOSED
      this.notify('close')
    })
  }

  send(binary) {
    this.socket.clients.forEach(client => {
      if (client.isAlive) {
        try {
          client.send(binary, { binary: true }, error => {
            if (error) {
              client.terminate()
            }
          })
        } catch (error) {
          client.terminate()
        }
      }
    })
  }

  startHeartbeat() {
    this.pingInterval = setInterval(() => {
      this.socket.clients.forEach(client => {
        if (client.isAlive === false) {
          client.terminate()
          return
        }

        client.isAlive = false

        try {
          client.ping('', false, true)
        } catch (error) {
          client.terminate()
        }
      })
    }, this.options.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
  }
}

module.exports = WebsocketServer
