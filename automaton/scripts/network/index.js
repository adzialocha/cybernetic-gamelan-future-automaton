import Peer from 'peerjs'
import { create as createTimesync } from 'timesync'

const CHECK_MISSING_PEERS_FREQUENCY = 10000
const PEER_ID_KEY = 'automaton-peer'

function getPeerString(id) {
  return `${PEER_ID_KEY}-${id}`
}

function getAllPeers(clientsNumber, ownId) {
  const peers = []

  for (let id = 1; id < clientsNumber + 1; id += 1) {
    if (ownId !== id) {
      peers.push(getPeerString(id))
    }
  }

  return peers
}

function getOpenConnection(connections) {
  return connections && connections.filter(remoteConnection => {
    return remoteConnection.open
  })[0]
}

const defaultOptions = {
  onAllOnline: () => {},
  onClose: () => {},
  onCloseRemote: () => {},
  onError: () => {},
  onOpen: () => {},
  onOpenRemote: () => {},
  onReceive: () => {},
  onSyncTick: () => {},
  syncInterval: 500,
  syncStepsDelay: 100,
  syncTickFrequency: 1,
}

export default class Network {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.lastCheckedDate = new Date()
    this.offset = 0
    this.peer = null
    this.peers = []
    this.sync = null
    this.syncInterval = null
    this.syncTickInterval = null
  }

  isAlone() {
    return this.peers.filter(id => {
      if (getOpenConnection(this.peer.connections[id])) {
        return true
      }
      return false
    }).length === 0
  }

  connect(configuration) {
    if (this.peer && this.peer.open) {
      this.options.onError(
        new Error('Connection is already open')
      )
      return false
    }

    const {
      serverHost,
      serverKey,
    } = configuration

    const peerId = parseInt(configuration.peerId, 10)
    const clientsNumber = parseInt(configuration.clientsNumber, 10)
    const serverPort = parseInt(configuration.serverPort, 10)

    if (peerId < 1 || peerId > clientsNumber) {
      this.options.onError(
        new Error('Invalid peer id')
      )
      return false
    }

    this.peers = getAllPeers(clientsNumber, peerId)
    this.lastCheckedDate = new Date()

    const setupConnection = (connection) => {
      if (this.peer.connections[connection.id]) {
        const isAlreadyOpen = this.peer.connections[connection.id]
          .find(remoteConnection => {
            return remoteConnection.open
          })

        if (isAlreadyOpen) {
          return
        }
      }

      connection
        .on('open', () => {
          this.options.onOpenRemote(connection.peer)

          const onlinePeers = this.peers
            .filter(id => {
              if (getOpenConnection(this.peer.connections[id])) {
                return true
              }
              return false
            })

          if (onlinePeers.length === this.peers.length) {
            this.options.onAllOnline()
          }
        })
        .on('data', data => {
          if (data.jsonrpc) {
            this.sync.receive(connection.peer, data)
          } else {
            this.options.onReceive(connection.peer, data)
          }
        })
        .on('close', () => {
          this.options.onCloseRemote(connection.peer)
        })
        .on('error', err => {
          this.options.onError(err)
        })
    }

    const connectToPeers = () => {
      this.peers
        .filter(id => {
          return !(id in this.peer.connections)
        })
        .forEach(id => {
          const connection = this.peer.connect(id, {
            serialization: 'json',
          })
          setupConnection(connection)
        })
    }

    this.peer = new Peer(getPeerString(peerId), {
      host: serverHost,
      key: serverKey,
      port: serverPort,
      secure: window.location.protocol === 'https:',
    })

    this.peer.on('open', () => {
      connectToPeers()
      this.options.onOpen()
    })

    this.peer.on('connection', connection => {
      setupConnection(connection)
    })

    this.peer.on('disconnected', () => {
      this.peer.destroy()
      this.sync.destroy()
    })

    this.peer.on('close', () => {
      this.options.onClose()
    })

    this.peer.on('error', err => {
      this.options.onError(err)

      if (err.type !== 'disconnected' && err.type !== 'peer-unavailable') {
        this.disconnect(true)
      }
    })

    // Time synchronization between peers
    this.sync = createTimesync({
      delay: this.options.syncStepsDelay,
      interval: this.options.syncInterval,
      peers: [],
      timeout: 10000,
    })

    this.sync.send = (id, data) => {
      this.send(id, data)
    }

    this.sync.on('sync', state => {
      if (state === 'start') {
        const openConnections = Object.keys(this.peer.connections)
          .filter(id => {
            return this.peer.connections[id].some(connection => {
              return connection.open
            })
          })

        this.sync.options.peers = openConnections
      } else if (state === 'end') {
        this.sync.options.peers = []
      }
    })

    this.sync.on('change', offset => {
      this.offset = offset
    })

    // Check for missing connections
    this.syncInterval = setInterval(
      connectToPeers,
      CHECK_MISSING_PEERS_FREQUENCY
    )

    // Start synchronized ticking
    this.syncTickInterval = setInterval(
      () => {
        const syncDate = new Date(this.sync.now())
        if (syncDate.getSeconds() !== this.lastCheckedDate.getSeconds()) {
          this.options.onSyncTick(this.offset)
          this.lastCheckedDate = syncDate
        }
      }, this.options.syncTickFrequency
    )

    return true
  }

  disconnect(isForced = false) {
    if (!isForced && (!this.peer || !this.peer.open)) {
      throw new Error('Connection is already closed')
    }

    this.peer.disconnect()

    clearInterval(this.syncInterval)
    clearInterval(this.syncTickInterval)

    this.syncTickInterval = null
    this.syncInterval = null
  }

  sendToAll(data) {
    this.peers.forEach(id => {
      this.send(id, data)
    })
  }

  send(id, data) {
    const connection = getOpenConnection(this.peer.connections[id])

    if (connection) {
      connection.send(data)
    }
  }
}
