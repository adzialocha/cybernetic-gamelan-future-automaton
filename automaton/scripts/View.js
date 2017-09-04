const ERROR_MESSAGES_LIMIT = 3

const VIEW_IDS = [
  'main-view',
  'settings-view',
]

const INITIAL_VIEW = 'main-view'

export default class View {
  constructor() {
    this.elements = {
      allFormInputs: document.querySelectorAll('form input'),
      connectButton: document.getElementById('connect-button'),
      connectedPeers: document.getElementById('connected-peers'),
      disconnectButton: document.getElementById('disconnect-button'),
      errorMessages: document.getElementById('error-messages'),
      offsetMonitor: document.getElementById('offset-monitor'),
      pattern: document.getElementById('pattern'),
      rendererCanvas: document.getElementById('renderer-canvas'),
      space: document.getElementById('space'),
      tick: document.getElementById('tick'),
      wordsOptions: document.getElementById('words-options'),
      wordsSelection: document.getElementById('words-selection'),
    }

    this.errorMessages = []
    this.committedPattern = null

    this.words = []
    this.selectedWords = []

    // Open initial view
    this.changeView(VIEW_IDS.indexOf(INITIAL_VIEW))
  }

  // View navigation

  getCurrentView() {
    return document.querySelector('.view--active').id
  }

  changeView(viewIndex) {
    if (viewIndex < 0 || viewIndex > VIEW_IDS.length - 1) {
      return
    }

    VIEW_IDS.forEach(viewId => {
      document.getElementById(viewId).classList.remove('view--active')
    })

    const nextViewId = VIEW_IDS[viewIndex]
    document.getElementById(nextViewId).classList.add('view--active')

    this.elements.pattern.blur()
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

    for (let i = 0; i < this.elements.allFormInputs.length; i++) {
      this.elements.allFormInputs[i].disabled = isLoading || isConnected
    }
  }

  updateSettings(configuration) {
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

  // Words

  updateWords() {
    this.elements.wordsOptions.innerHTML = ''

    this.words.forEach(item => {
      const wordElem = document.createElement('div')
      wordElem.classList.add('words__item')
      wordElem.innerText = `${item.id} ${item.word}`

      this.elements.wordsOptions.appendChild(wordElem)
    })

    this.elements.wordsSelection.innerHTML = ''

    this.selectedWords.forEach(item => {
      const wordElem = document.createElement('div')
      wordElem.classList.add('words__item')
      wordElem.innerText = item.word

      this.elements.wordsSelection.appendChild(wordElem)
    })
  }

  showWords(words) {
    this.words = words.map((word, index) => {
      return {
        id: index + 1,
        word,
      }
    })

    this.updateWords()
  }

  selectWord(id) {
    const index = this.words.findIndex(item => {
      return item.id === id
    })

    if (index === -1) {
      return
    }

    this.selectedWords.push(this.words[index])
    this.words.splice(index, 1)

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
}
