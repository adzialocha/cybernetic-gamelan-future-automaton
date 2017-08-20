import styles from '../styles/index.scss' // eslint-disable-line no-unused-vars

import Debug from './Debug'
import Network from './network'
import Settings from './Settings'
import View from './View'

const debug = new Debug()
const settings = new Settings()
const view = new View()

const network = new Network({
  onOpen: () => {
    view.changeConnectionState(false, true)
  },
  onClose: () => {
    view.changeConnectionState(false, false)
  },
  onOpenRemote: peerId => {
    view.addRemotePeer(peerId)
  },
  onCloseRemote: peerId => {
    view.removeRemotePeer(peerId)
  },
  onSyncTick: offset => {
    view.updateOffset(offset)
    view.tick()
  },
  // onReceive: (peer, data) => {
  //   console.log('receive', peer, data)
  // },
  onError: err => {
    view.addErrorMessage(err.message)
  },
})

// Initialize
window.addEventListener('load', () => {
  view.changeConnectionState(false, false)
  view.updateSettings(settings.getConfiguration())
})

// Expose some interfaces to the view
window.automaton = window.automaton || {
  network: {
    connect: (event) => {
      event.preventDefault()

      view.changeConnectionState(true, false)
      network.connect(settings.getConfiguration())
    },
    disconnect: (event) => {
      event.preventDefault()

      view.changeConnectionState(true, true)
      network.disconnect()
    },
    send: (data) => {
      network.sendToAll(data)
    },
  },
  settings: {
    update: (event) => {
      const { id, value } = event.target
      settings.update(id, value)
    },
  },
  debug,
}

// Main keyboard control strokes
window.addEventListener('keydown', (event) => {
  const { keyCode, metaKey } = event
  if (metaKey) {
    view.changeView(keyCode - 49)
  }
})
