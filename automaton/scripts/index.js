import '../styles/index.scss'

import API from './network/API'
import Composition from './composition'
import Network from './network'
import View from './view'
import Visuals from './visuals'

const INPUT_VALID_KEY_CODES = [8, 13, 37, 39]
const IS_DEBUG_MODE = false

const composition = new Composition()
const view = new View()

let isPatternFocussed = false

// Someone or me entered universe
function onUniverseChange() {
  // Change pattern and synth sound
  const pattern = composition.nextPreset()
  view.changePattern(pattern)
  view.commitPattern(pattern)

  // Start words
  view.startWords(composition.getWords())

  // Show a flash as signal
  view.flash()
}

const api = new API({
  onUniverseEnterReceived: () => {
    onUniverseChange()
  },
})

const visuals = new Visuals({
  galaxy: composition.getGalaxy(),
  canvas: view.getRendererCanvas(),
  devicePixelRatio: window.devicePixelRatio,
  initialHeight: window.innerHeight,
  initialWidth: window.innerWidth,
  isDebugMode: IS_DEBUG_MODE,
  onUniverseEntered: () => {
    api.sendUniverseEntered()
    onUniverseChange()
  },
})

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
  view.loadAllSettings()
  view.changeConnectionState(false, false)
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

      if (network.connect(view.getSettings())) {
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
      view.updateSetting(id, value)
    },
  },
  onPointerLockRequested: () => {
    view.requestPointerLock()
  },
  onFullScreenRequested: () => {
    view.requestFullScreen()
  },
  onBlurPattern: () => {
    isPatternFocussed = false
    return true
  },
  onFocusPattern: () => {
    isPatternFocussed = true
    return true
  },
  onKeyUpPattern: event => {
    const { keyCode, key } = event

    if (
      !INPUT_VALID_KEY_CODES.includes(keyCode) &&
      !composition.getValidPatternCharacters().includes(key)
    ) {
      event.preventDefault()
      return
    }

    view.changePattern(event.target.value)
  },
  onKeyDownPattern: event => {
    const { keyCode, key } = event

    if (
      !INPUT_VALID_KEY_CODES.includes(keyCode) &&
      !composition.getValidPatternCharacters().includes(key)
    ) {
      event.preventDefault()
      return
    }

    if (keyCode === 13) {
      const value = event.target.value

      if (composition.instrument.changePattern(value)) {
        view.commitPattern(value)

        event.preventDefault()
        event.stopPropagation()
      }
    }
  },
}

// Main keyboard control strokes
window.addEventListener('keydown', (event) => {
  const { keyCode, shiftKey, metaKey } = event

  // Block everything to avoid browser keys
  if (!isPatternFocussed && view.isMainViewActive()) {
    event.preventDefault()
    event.stopPropagation()
  }

  // Reset button (Cmd + R)
  if (metaKey && keyCode === 82) {
    view.reset()
    composition.reset()
    visuals.reset()
  }

  // Reset only view (Cmd + V)
  if (metaKey && keyCode === 86) {
    visuals.reset()
  }

  // Press number
  if (keyCode >= 49 && keyCode <= 57) {
    const number = keyCode - 49

    if (shiftKey) {
      // Press shift + number
      view.changeView(number)
    } else {
      // Select a word
      view.selectWord(number, composition.getWords())
    }

    return
  }

  switch (keyCode) {
  case 13:
    if (!isPatternFocussed && view.isMainViewActive()) {
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
