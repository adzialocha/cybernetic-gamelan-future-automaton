import Settings from './Settings'

const ERROR_MESSAGES_LIMIT = 3
const FLASH_DURATION = 1000
const MAIN_VIEW_ID = 'main-view'

const VIEW_IDS = [
  'main-view',
  'settings-view',
]

export default class View {
  constructor() {
    this.elements = {
      allFormInputs: document.querySelectorAll('form input'),
      body: document.body,
      connectButton: document.getElementById('connect-button'),
      connectedPeers: document.getElementById('connected-peers'),
      disconnectButton: document.getElementById('disconnect-button'),
      errorMessages: document.getElementById('error-messages'),
      latencyMonitor: document.getElementById('latency-monitor'),
      loading: document.getElementById('loading'),
      pattern: document.getElementById('pattern'),
      rendererCanvas: document.getElementById('renderer-canvas'),
      resetSettings: document.getElementById('reset-settings'),
      space: document.getElementById('space'),
      spaceStartButton: document.getElementById('space-start'),
      tick: document.getElementById('tick'),
    }

    this.errorMessages = []
    this.committedPattern = null

    // Flash
    this.flashTimeout = null

    // First message
    this.addErrorMessage('Ready')

    // Settings
    this.settings = new Settings()

    // Open initial view
    this.changeView(VIEW_IDS.indexOf(MAIN_VIEW_ID))
  }

  // Setup

  requestPointerLock() {
    this.elements.body.requestPointerLock = (
      this.elements.body.requestPointerLock ||
      this.elements.body.mozRequestPointerLock ||
      this.elements.body.webkitRequestPointerLock
    )

    this.elements.body.requestPointerLock()
  }

  exitPointerLock() {
    document.exitPointerLock = (
      document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock
    )

    document.exitPointerLock()
  }

  requestFullScreen() {
    this.elements.body.requestFullScreen = (
      this.elements.body.requestFullScreen ||
      this.elements.body.mozRequestFullScreen ||
      this.elements.body.webkitRequestFullScreen
    )

    this.elements.body.requestFullScreen()
  }

  // Loading

  startLoading() {
    this.elements.loading.classList.add('space__loading--visible')
  }

  stopLoading() {
    this.elements.space.classList.add('space--ready')
    this.elements.loading.classList.remove('space__loading--visible')
  }

  // Firefox warning

  checkBrowser() {
    if (!navigator.userAgent.includes('Firefox')) {
      this.elements.space.classList.add('space--browser-warning')
    }
  }

  // View navigation

  isMainViewActive() {
    return document
      .getElementById(MAIN_VIEW_ID)
      .classList
      .contains('view--active')
  }

  changeView(viewIndex) {
    if (viewIndex < 0 || viewIndex > VIEW_IDS.length - 1) {
      return
    }

    // Change view
    VIEW_IDS.forEach(viewId => {
      document.getElementById(viewId).classList.remove('view--active')
    })

    const nextViewId = VIEW_IDS[viewIndex]
    document.getElementById(nextViewId).classList.add('view--active')

    // Release from pointer lock and pattern when leaving main screen
    if (!this.isMainViewActive()) {
      this.elements.pattern.blur()
      this.exitPointerLock()
    }
  }

  changeSpaceState(isPointerLocked) {
    this.elements.pattern.disabled = !isPointerLocked

    if (isPointerLocked) {
      this.elements.space.classList.add('space--active')
    } else {
      this.elements.space.classList.remove('space--active')
    }
  }

  // Settings

  changeConnectionState(isLoading, isConnected) {
    this.elements.connectButton.disabled = isLoading || isConnected
    this.elements.disconnectButton.disabled = isLoading || !isConnected

    this.elements.resetSettings.disabled = isLoading || isConnected
    this.elements.spaceStartButton.disabled = isLoading || !isConnected

    for (let i = 0; i < this.elements.allFormInputs.length; i++) {
      this.elements.allFormInputs[i].disabled = isLoading || isConnected
    }
  }

  resetSettings() {
    this.settings.reset()
    this.loadAllSettings()
  }

  getSettings() {
    return this.settings.getConfiguration()
  }

  updateSetting(id, value) {
    return this.settings.update(id, value)
  }

  loadAllSettings() {
    const configuration = this.settings.getConfiguration()

    Object.keys(configuration).forEach(id => {
      const inputent = document.getElementById(id)
      if (inputent) {
        inputent.value = configuration[id]
      }
    })
  }

  tick() {
    this.elements.tick.classList.add('tick--active')

    setTimeout(() => {
      this.elements.tick.classList.remove('tick--active')
    }, 500)
  }

  updateOffset(latency) {
    this.elements.latencyMonitor.innerText = `${latency} ms`
  }

  addErrorMessage(message) {
    this.errorMessages.push({
      timestamp: new Date(),
      message,
    })

    if (this.errorMessages.length > ERROR_MESSAGES_LIMIT) {
      this.errorMessages.shift()
    }

    this.elements.errorMessages.innerHTML = ''

    this.errorMessages.forEach(error => {
      const errorMessage = document.createElement('div')
      const formattedTime = error.timestamp.toISOString()
      errorMessage.innerText = formattedTime + ' ' + error.message

      this.elements.errorMessages.appendChild(errorMessage)
    })
  }

  changeClients(count) {
    this.elements.connectedPeers.innerHTML = ''

    for (let i = 0; i < count; i += 1) {
      const peer = document.createElement('div')
      peer.class = 'connected-peer'
      peer.innerText = `client ${i + 1}`

      this.elements.connectedPeers.appendChild(peer)
    }
  }

  // View

  getRendererCanvas() {
    return this.elements.rendererCanvas
  }

  flash() {
    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout)
    }

    this.elements.space.classList.remove('space--flash-active')
    this.elements.space.classList.add('space--flash')

    setTimeout(() => {
      this.elements.space.classList.add('space--flash-active')
    })

    setTimeout(() => {
      this.elements.space.classList.remove('space--flash-active')
    }, FLASH_DURATION / 2)

    this.flashTimeout = setTimeout(() => {
      this.elements.space.classList.remove('space--flash')
    }, FLASH_DURATION)
  }

  // Pattern

  changePattern(pattern) {
    const isPatternDirty = (
      this.elements.committedPattern &&
      this.elements.committedPattern !== pattern
    )

    if (!this.elements.committedPattern) {
      this.elements.committedPattern = pattern
    }

    this.elements.pattern.value = pattern

    if (isPatternDirty) {
      this.elements.pattern.classList.add('space__input--dirty')
    } else {
      this.elements.pattern.classList.remove('space__input--dirty')
    }
  }

  focusPattern() {
    this.elements.pattern.focus()
  }

  commitPattern(pattern) {
    this.elements.pattern.classList.remove('space__input--dirty')
    this.elements.pattern.classList.add('space__input--commit')

    setTimeout(() => {
      this.elements.pattern.classList.remove('space__input--commit')
    }, 500)

    this.elements.committedPattern = pattern

    this.elements.pattern.blur()
  }

  // Reset

  reset() {
    // Reset pattern
    this.changePattern('')
    this.commitPattern('')
  }
}
