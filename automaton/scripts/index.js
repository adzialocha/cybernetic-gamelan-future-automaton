import styles from '../styles/index.scss' // eslint-disable-line no-unused-vars

import Instrument from './instrument'
import Network from './network'
import Settings from './Settings'
import View from './View'

import { PRESETS } from './instrument/presets'

const pattern = '1.2. 1--- 3... 1---'
// const pattern = '1--- ---- 2--- ----'

const noteMaterial = [
  62,
  65,
  70,
  72,
  74,
]

const settings = new Settings()
const view = new View()

const instrument = new Instrument({
  preset: PRESETS.BELL,
  noteMaterial,
})

const network = new Network({
  onOpen: () => {
    view.changeConnectionState(false, true)

    instrument.start()
  },
  onClose: () => {
    view.changeConnectionState(false, false)

    instrument.stop()
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

    instrument.tick()
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

  instrument.changePattern(pattern, {
    octave: 0,
    velocity: 0.25,
  })
})

// Expose some interfaces to the view
window.automaton = window.automaton || {
  network: {
    connect: (event) => {
      event.preventDefault()

      if (network.connect(settings.getConfiguration())) {
        view.changeConnectionState(true, false)
      }
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
}

// Main keyboard control strokes
window.addEventListener('keydown', (event) => {
  const { keyCode, shiftKey } = event
  if (shiftKey) {
    view.changeView(keyCode - 49)
  }
})
