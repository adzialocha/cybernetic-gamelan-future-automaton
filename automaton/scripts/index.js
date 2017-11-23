import '../styles/index.scss'

import KeyCode from 'key-code'

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

function hasMode(key) {
  return window.location.href.includes(key)
}

const isDebugMode = hasMode('debug')
const isMinimalMode = hasMode('minimal')
const isVisualsEnabled = !hasMode('novisuals')

let isMoveLocked = false
let isPatternFocussed = false
let isRunning = false

const view = new View()

const composition = new Composition({
  onUniverseEntered: () => {
    view.flash()
  },
})

const visuals = new Visuals({
  canvas: view.getRendererCanvas(),
  devicePixelRatio: window.devicePixelRatio,
  galaxy: composition.getGalaxy(),
  initialHeight: window.innerHeight,
  initialWidth: window.innerWidth,
  isEnabled: isVisualsEnabled,
  isDebugMode,
  isMinimalMode,
  onDistancesUpdated: distances => {
    composition.queueDistances(distances)
  },
})

const network = new Network({
  onOpen: () => {
    view.changeConnectionState(false, true)
  },
  onClose: () => {
    view.changeConnectionState(false, false)
    view.exitPointerLock()
  },
  onClientsChanged: count => {
    view.changeClients(count)
  },
  onSyncTick: (currentTick, totalTicksCount, originalTimestamp) => {
    if (currentTick === 0) {
      view.updateOffset(Date.now() - originalTimestamp)
    }
    composition.tick(currentTick, totalTicksCount)
  },
  onNextCycle: currentCycle => {
    view.tick()
    composition.cycle(currentCycle)
  },
  onError: message => {
    view.addErrorMessage(message)
  },
})

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

      if (composition.instrument.queuePattern(value)) {
        view.commitPattern(value)

        event.preventDefault()
        event.stopPropagation()
      }
    }
  },
}

function initialize() {
  view.loadAllSettings()
  view.changeConnectionState(false, false)
  view.changePattern('')

  setTimeout(() => {
    if (isVisualsEnabled) {
      visuals.createUniverses()
    }

    view.stopLoading()
  })
}

// Main keyboard control strokes
window.addEventListener('keydown', (event) => {
  const { keyCode, shiftKey, altKey, metaKey, key } = event

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
    // Reset view (Cmd + Shift + V)
    if (keyCode === KeyCode.V) {
      visuals.reset()
    }
  }

  // Press number + shift
  if (
    shiftKey && key !== '*' && (
      (keyCode >= KeyCode.ONE && keyCode <= KeyCode.NINE) ||
      (keyCode === 222 || keyCode === 191)
    )
  ) {
    let index

    if (keyCode === 222) {
      index = 1
    } else if (keyCode === 191) {
      index = 6
    } else {
      index = keyCode - KeyCode.ONE
    }

    view.changeView(index)

    return
  }

  if (keyCode === KeyCode.ENTER) {
    if (view.isMainViewActive()) {
      view.focusPattern()
    }
  }

  if (isPatternFocussed || !isRunning || !isVisualsEnabled) {
    return
  }

  switch (keyCode) {
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
  if (isPatternFocussed || !isRunning || !isVisualsEnabled) {
    return
  }

  switch (event.keyCode) {
  case KeyCode.UP:
  case KeyCode.W:
    visuals.controls.move({ forward: isMoveLocked || false })
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

// Pointer lock state changed
function onPointerLockChange() {
  const element = document.pointerLockElement || document.mozPointerLockElement
  const isPointerLocked = element === document.body

  view.changeSpaceState(isPointerLocked)

  if (isVisualsEnabled) {
    visuals.isEnabled = isPointerLocked
  }

  isRunning = isPointerLocked

  if (isPointerLocked) {
    composition.start()
  } else {
    composition.stop()

    if (isVisualsEnabled) {
      visuals.controls.move({
        backward: false,
        forward: false,
        left: false,
        right: false,
      })
    }
  }
}

if ('onpointerlockchange' in document) {
  document.addEventListener('pointerlockchange', onPointerLockChange, false)
} else if ('onmozpointerlockchange' in document) {
  document.addEventListener('mozpointerlockchange', onPointerLockChange, false)
}

window.addEventListener('contextmenu', event => {
  event.preventDefault()
}, false)

// Resize rendered when window size was changed
window.addEventListener('resize', () => {
  visuals.resize(window.innerWidth, window.innerHeight)
}, false)

// Initialize
view.startLoading()

window.addEventListener('load', () => {
  initialize()
})
