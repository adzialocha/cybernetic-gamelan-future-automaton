/* eslint-disable no-use-before-define */

import styles from '../styles/index.scss' // eslint-disable-line no-unused-vars

import CommunicationInterface from './network/CommunicationInterface'
import Instrument from './instrument'
import Network from './network'
import Settings from './Settings'
import View from './View'

import { PELOG, pickFromScale } from './instrument/gamelan/scales'

const ALONE_START_DELAY = 1000

const NOTE_MATERIAL = pickFromScale([6, 1, 2, 4, 5], PELOG)

const INITIAL_PATTERN = ',.-#+,.-#++#-.,'
const INITIAL_BPM = 80
const INITIAL_VELOCITY = 0.25

let isMaster = false

const settings = new Settings()
const view = new View()

view.changePattern(INITIAL_PATTERN)

const instrument = new Instrument({
  bpm: INITIAL_BPM,
  noteMaterial: NOTE_MATERIAL,
  onPatternBegin: () => {
    if (isMaster) {
      communication.sendPatternBegin()
    }
  },
})

const communication = new CommunicationInterface({
  onPatternBeginReceived: peer => {
    if (!instrument.isRunning()) {
      instrument.start()
    } else {
      instrument.syncPattern(peer)
    }
  },
})

const network = new Network({
  onOpen: () => {
    view.changeConnectionState(false, true)

    setTimeout(() => {
      if (network.isAlone()) {
        isMaster = true
        instrument.start()
      }
    }, ALONE_START_DELAY)
  },
  onClose: () => {
    isMaster = false
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

    instrument.syncTick()
  },
  onReceive: (peer, data) => {
    communication.receive(peer, data)
  },
  onError: err => {
    view.addErrorMessage(err.message)
  },
})

communication.setNetwork(network)

// Initialize
window.addEventListener('load', () => {
  view.changeConnectionState(false, false)
  view.updateSettings(settings.getConfiguration())

  instrument.changePattern(INITIAL_PATTERN, {
    velocity: INITIAL_VELOCITY,
  })
})

// Expose some interfaces to the view
window.automaton = window.automaton || {
  network: {
    connect: event => {
      event.preventDefault()

      if (network.connect(settings.getConfiguration())) {
        view.changeConnectionState(true, false)
      }
    },
    disconnect: event => {
      event.preventDefault()

      view.changeConnectionState(true, true)
      network.disconnect()
    },
    send: (data) => {
      network.sendToAll(data)
    },
  },
  settings: {
    update: event => {
      const { id, value } = event.target
      settings.update(id, value)
    },
  },
  onChangePattern: event => {
    view.changePattern(event.target.value)
  },
  onKeyDownPattern: event => {
    if (event.keyCode === 13) {
      event.preventDefault()
      event.stopPropagation()

      const value = event.target.value

      if (instrument.changePattern(value)) {
        view.commitPattern(value)
      }
    }

    return true
  },
}

// Main keyboard control strokes
window.addEventListener('keydown', (event) => {
  const { keyCode, shiftKey } = event
  if (shiftKey) {
    view.changeView(keyCode - 49)
  }

  if (keyCode === 13) {
    if (view.getCurrentView() === 'main-view') {
      view.focusPattern()
    }
  }
})
