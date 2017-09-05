/* eslint-disable no-use-before-define */

import '../styles/index.scss'

import API from './network/API'
import Composition from './Composition'
import Network from './network'
import Settings from './Settings'
import View from './View'
import Visuals from './visuals'
import Words from './words'

const IS_DEBUG_MODE = true

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
  isDebugMode: IS_DEBUG_MODE,
  onUniverseEntered: () => {
    view.startWords(words.suggest())
  },
})

const words = new Words()

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

// Pointer lock state changed
function onPointerLockChange() {
  const element = document.pointerLockElement || document.mozPointerLockElement
  const isPointerLocked = element === document.body

  view.changeSpaceState(isPointerLocked)
  visuals.isEnabled = isPointerLocked

  if (isPointerLocked) {
    words.reset()
    composition.start()
  } else {
    composition.stop()
  }
}

if ('onpointerlockchange' in document) {
  document.addEventListener('pointerlockchange', onPointerLockChange, false)
} else if ('onmozpointerlockchange' in document) {
  document.addEventListener('mozpointerlockchange', onPointerLockChange, false)
}

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
  start: () => {
    const element = document.body

    element.requestPointerLock = (
      element.requestPointerLock ||
      element.mozRequestPointerLock ||
      element.webkitRequestPointerLock
    )

    element.requestFullScreen = (
      element.requestFullScreen ||
      element.mozRequestFullScreen ||
      element.webkitRequestFullScreen
    )

    element.requestPointerLock()

    if (!IS_DEBUG_MODE) {
      element.requestFullScreen()
    }
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
      // Select a word
      view.selectWord(number, words.suggest())
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
    visuals.controls.move({ forward: true })
    break
  case 37: // Arrow-Left
  case 65: // A
    visuals.controls.move({ left: true })
    break
  case 40: // Arrow-Down
  case 83: // S
    visuals.controls.move({ backward: true })
    break
  case 39: // Arrow-Right
  case 68: // D
    visuals.controls.move({ right: true })
    break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.keyCode) {
  case 38: // Arrow-Up
  case 87: // W
    visuals.controls.move({ forward: false })
    break
  case 37: // Arrow-Left
  case 65: // A
    visuals.controls.move({ left: false })
    break
  case 40: // Arrow-Down
  case 83: // S
    visuals.controls.move({ backward: false })
    break
  case 39: // Arrow-Right
  case 68: // D
    visuals.controls.move({ right: false })
    break
  }
})

window.addEventListener('contextmenu', event => {
  event.preventDefault()
}, false)
