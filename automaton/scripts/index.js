import '../styles/index.scss'

import KeyCode from 'key-code'

import Communication from './network/Communication'
import Composition from './composition'
import Network from './network'
import View from './view'
import Visuals from './visuals'

const INPUT_VALID_KEY_CODES = [
  KeyCode.BACKSPACE,
  KeyCode.ENTER,
  KeyCode.LEFT,
  KeyCode.RIGHT,
]

const composition = new Composition()
const view = new View()

const isDebugMode = false
let isPatternFocussed = false
let isMoveLocked = false

// Someone or me entered universe
function onUniverseChange(isMe) {
  // Change pattern and synth sound
  const pattern = composition.nextPreset(isMe)
  view.changePattern(pattern)
  view.commitPattern(pattern)
  composition.instrument.changePattern(pattern)

  // Show a flash as signal
  view.flash()
}

const communication = new Communication({
  onUniverseEnterReceived: () => {
    onUniverseChange(false)
  },
})

const visuals = new Visuals({
  galaxy: composition.getGalaxy(),
  canvas: view.getRendererCanvas(),
  devicePixelRatio: window.devicePixelRatio,
  initialHeight: window.innerHeight,
  initialWidth: window.innerWidth,
  isDebugMode,
})

view.startLoading()

setTimeout(() => {
  visuals.createUniverses()
  view.stopLoading()
})

visuals.options.onUniverseEntered = () => {
  communication.sendUniverseEntered()
  onUniverseChange(true)
}

const network = new Network({
  onOpen: () => {
    view.changeConnectionState(false, true)
  },
  onClose: () => {
    view.changeConnectionState(false, false)
    view.exitPointerLock()
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
    communication.receive(peer, data)
  },
  onError: err => {
    view.addErrorMessage(err.message)
  },
})

communication.setNetwork(network)

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
    reset: () => {
      view.resetSettings()
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
  },
  onFocusPattern: () => {
    isPatternFocussed = true
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

    if (keyCode === KeyCode.ENTER) {
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
  const { keyCode, shiftKey, altKey, metaKey } = event

  // Block everything to avoid browser keys
  if (
    !isPatternFocussed &&
    view.isMainViewActive() &&
    (!metaKey && !altKey && keyCode !== KeyCode.I) // Allow inspector
  ) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (metaKey && shiftKey) {
    // Reset button (Cmd + Shift + T)
    if (keyCode === KeyCode.T) {
      view.reset()
      composition.reset()
      visuals.reset()
    }

    // Reset only view (Cmd + Shift + V)
    if (keyCode === KeyCode.V) {
      visuals.reset()
    }

    if (isDebugMode) {
      // Change universe manually (Cmd + Shift + U)
      if (keyCode === KeyCode.U) {
        onUniverseChange()
      }
    }
  }

  // Press number
  if (keyCode >= KeyCode.ONE && keyCode <= KeyCode.NINE) {
    const number = keyCode - KeyCode.ONE

    if (shiftKey) {
      // Press shift + number
      view.changeView(number)
    }

    return
  }

  switch (keyCode) {
  case KeyCode.ENTER:
    if (!isPatternFocussed && view.isMainViewActive()) {
      view.focusPattern()
    }
    break
  case KeyCode.CAPS_LOCK:
    isMoveLocked = !isMoveLocked
    visuals.controls.move({ forward: isMoveLocked })
    break
  case KeyCode.UP:
  case KeyCode.W:
    visuals.controls.move({ forward: true })
    break
  case KeyCode.LEFT:
  case KeyCode.A:
    visuals.controls.move({ left: true })
    break
  case KeyCode.DOWN:
  case KeyCode.S:
    visuals.controls.move({ backward: true })
    break
  case KeyCode.RIGHT:
  case KeyCode.D:
    visuals.controls.move({ right: true })
    break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.keyCode) {
  case KeyCode.UP:
  case KeyCode.W:
    visuals.controls.move({ forward: false })
    break
  case KeyCode.LEFT:
  case KeyCode.A:
    visuals.controls.move({ left: false })
    break
  case KeyCode.DOWN:
  case KeyCode.S:
    visuals.controls.move({ backward: false })
    break
  case KeyCode.RIGHT:
  case KeyCode.D:
    visuals.controls.move({ right: false })
    break
  }
})

window.addEventListener('contextmenu', event => {
  event.preventDefault()
}, false)
