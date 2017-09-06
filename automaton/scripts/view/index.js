import Settings from './Settings'

const ERROR_MESSAGES_LIMIT = 3

const VIEW_IDS = [
  'main-view',
  'settings-view',
]

const MAIN_VIEW_ID = 'main-view'

const WORDS_FADE_DURATION = 20000
const MAX_WORDS_COUNT = 5

export default class View {
  constructor() {
    this.elements = {
      allFormInputs: document.querySelectorAll('form input'),
      body: document.body,
      connectButton: document.getElementById('connect-button'),
      connectedPeers: document.getElementById('connected-peers'),
      disconnectButton: document.getElementById('disconnect-button'),
      errorMessages: document.getElementById('error-messages'),
      offsetMonitor: document.getElementById('offset-monitor'),
      pattern: document.getElementById('pattern'),
      rendererCanvas: document.getElementById('renderer-canvas'),
      resetSettings: document.getElementById('reset-settings'),
      space: document.getElementById('space'),
      tick: document.getElementById('tick'),
      wordsOptions: document.getElementById('words-options'),
      wordsSelection: document.getElementById('words-selection'),
    }

    this.errorMessages = []
    this.committedPattern = null

    this.words = []
    this.selectedWords = []
    this.wordsTimeout = null

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

  updateOffset(offset) {
    this.elements.offsetMonitor.innerText = `${offset.toFixed(1)} ms`
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

  addRemotePeer(peerId) {
    const peer = document.createElement('div')
    peer.class = 'connected-peer'
    peer.innerText = peerId
    peer.id = peerId

    this.elements.connectedPeers.appendChild(peer)
  }

  removeRemotePeer(peerId) {
    const peer = document.getElementById(peerId)
    this.elements.connectedPeers.removeChild(peer)
  }

  // View

  getRendererCanvas() {
    return this.elements.rendererCanvas
  }

  flash() {
    // @TODO
  }

  // Words

  updateWords() {
    this.elements.wordsOptions.innerHTML = ''

    this.words.forEach(word => {
      const wordElem = document.createElement('div')
      wordElem.classList.add('words__item')
      wordElem.innerText = word

      this.elements.wordsOptions.appendChild(wordElem)
    })

    this.elements.wordsSelection.innerHTML = ''

    this.selectedWords.forEach(word => {
      const wordElem = document.createElement('div')
      wordElem.classList.add('words__item')
      wordElem.innerText = word

      this.elements.wordsSelection.appendChild(wordElem)
    })
  }

  startWords(words) {
    this.selectedWords = []
    this.words = words

    if (this.wordsTimeout) {
      clearTimeout(this.wordsTimeout)
      this.wordsTimeout = null
    }

    this.updateWords()
  }

  selectWord(index, words) {
    if (index > this.words.length - 1) {
      return
    }

    this.selectedWords.push(this.words[index])

    if (this.selectedWords.length === MAX_WORDS_COUNT) {
      this.words = []

      this.wordsTimeout = setTimeout(() => {
        this.selectedWords = []
      }, WORDS_FADE_DURATION)
    } else {
      this.words = words
    }

    this.updateWords()
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

    // Reset words
    this.words = []
    this.selectedWords = []

    if (this.wordsTimeout) {
      clearTimeout(this.wordsTimeout)
    }

    this.wordsTimeout = null

    this.updateWords()
  }
}
