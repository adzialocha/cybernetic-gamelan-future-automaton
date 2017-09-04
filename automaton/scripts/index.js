/* eslint-disable no-use-before-define */

import styles from '../styles/index.scss' // eslint-disable-line no-unused-vars

import API from './network/API'
import Composition from './Composition'
import Network from './network'
import Settings from './Settings'
import View from './View'
import Visuals from './visuals'
import Words from './words'

const INPUT_VALID_CHARS = '._-/:<>^°'
const INPUT_VALID_KEY_CODES = [8, 13, 37, 39]

const api = new API()
const composition = new Composition()
const settings = new Settings()
const view = new View()
const visuals = new Visuals({
  canvas: view.getRendererCanvas(),
  devicePixelRatio: window.devicePixelRatio,
  initialHeight: window.innerHeight,
  initialWidth: window.innerWidth,
})
const words = new Words()

view.changeSpaceState(true)
view.showWords(words.suggest())

const network = new Network({
  onOpen: () => {
    view.changeConnectionState(false, true)
    view.changeSpaceState(true)

    composition.start()
  },
  onClose: () => {
    view.changeConnectionState(false, false)
    view.changeSpaceState(false)

    composition.stop()
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

    composition.instrument.syncTick()
  },
  onReceive: (peer, data) => {
    api.receive(peer, data)
  },
  onError: err => {
    view.addErrorMessage(err.message)
  },
})

api.setNetwork(network)

// Initialize
window.addEventListener('load', () => {
  view.changeConnectionState(false, false)
  view.updateSettings(settings.getConfiguration())
  view.changePattern(composition.getCurrentPattern())
})

// Resize rendered when window size was changed
window.addEventListener('resize', () => {
  visuals.resize(window.innerWidth, window.innerHeight)
}, false)

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
  },
  settings: {
    update: event => {
      const { id, value } = event.target
      settings.update(id, value)
    },
  },
  onKeyUpPattern: event => {
    view.changePattern(event.target.value)
  },
  onKeyDownPattern: event => {
    const { keyCode, key } = event

    if (
      !INPUT_VALID_KEY_CODES.includes(keyCode) &&
      !INPUT_VALID_CHARS.includes(key)
    ) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (keyCode === 13) {
      event.preventDefault()
      event.stopPropagation()

      const value = event.target.value

      if (composition.instrument.changePattern(value)) {
        view.commitPattern(value)
      }
    }
  },
}

// Main keyboard control strokes
window.addEventListener('keydown', (event) => {
  const { keyCode, shiftKey } = event

  // Press number
  if (keyCode >= 49 && keyCode <= 57) {
    const number = keyCode - 49

    if (shiftKey) {
      // Press shift + number
      view.changeView(number)
    } else {
      view.selectWord(number + 1)
    }

    return
  }

  switch (keyCode) {
  case 13:
    if (view.getCurrentView() === 'main-view') {
      view.focusPattern()
    }
    break
  case 38: // Arrow-Up
  case 87: // W
    visuals.move({ forward: true })
    break
  case 37: // Arrow-Left
  case 65: // A
    visuals.move({ left: true })
    break
  case 40: // Arrow-Down
  case 83: // S
    visuals.move({ backward: true })
    break
  case 39: // Arrow-Right
  case 68: // D
    visuals.move({ right: true })
    break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.keyCode) {
  case 38: // Arrow-Up
  case 87: // W
    visuals.move({ forward: false })
    break
  case 37: // Arrow-Left
  case 65: // A
    visuals.move({ left: false })
    break
  case 40: // Arrow-Down
  case 83: // S
    visuals.move({ backward: false })
    break
  case 39: // Arrow-Right
  case 68: // D
    visuals.move({ right: false })
    break
  }
})
