const ERROR_MESSAGES_LIMIT = 3

const VIEW_IDS = [
  'main-view',
  'settings-view',
]

const INITIAL_VIEW = 'settings-view'

export default class View {
  constructor() {
    this.allFormElems = document.querySelectorAll('form input')
    this.connectButtonElem = document.getElementById('connect-button')
    this.connectedPeersElem = document.getElementById('connected-peers')
    this.disconnectButtonElem = document.getElementById('disconnect-button')
    this.errorMessagesElem = document.getElementById('error-messages')
    this.offsetMonitorElem = document.getElementById('offset-monitor')
    this.tickElem = document.getElementById('tick')

    this.errorMessages = []

    this.changeView(VIEW_IDS.indexOf(INITIAL_VIEW))
  }

  changeConnectionState(isLoading, isConnected) {
    this.connectButtonElem.disabled = isLoading || isConnected
    this.disconnectButtonElem.disabled = isLoading || !isConnected

    for (let i = 0; i < this.allFormElems.length; i++) {
      this.allFormElems[i].disabled = isLoading || isConnected
    }
  }

  updateSettings(configuration) {
    Object.keys(configuration).forEach(id => {
      const inputElement = document.getElementById(id)
      if (inputElement) {
        inputElement.value = configuration[id]
      }
    })
  }

  updateOffset(offset) {
    this.offsetMonitorElem.innerText = `${offset.toFixed(1)} ms`
  }

  addErrorMessage(message) {
    this.errorMessages.push({
      timestamp: new Date(),
      message,
    })

    if (this.errorMessages.length > ERROR_MESSAGES_LIMIT) {
      this.errorMessages.shift()
    }

    this.errorMessagesElem.innerHTML = ''

    this.errorMessages.forEach(error => {
      const errorMessageElem = document.createElement('div')
      const formattedTime = error.timestamp.toISOString()
      errorMessageElem.innerText = formattedTime + ' ' + error.message

      this.errorMessagesElem.appendChild(errorMessageElem)
    })
  }

  addRemotePeer(peerId) {
    const peerElem = document.createElement('div')
    peerElem.class = 'connected-peer'
    peerElem.innerText = peerId
    peerElem.id = peerId

    this.connectedPeersElem.appendChild(peerElem)
  }

  removeRemotePeer(peerId) {
    const peerElem = document.getElementById(peerId)
    this.connectedPeersElem.removeChild(peerElem)
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
  }

  tick() {
    this.tickElem.classList.add('tick--active')
    setTimeout(() => {
      this.tickElem.classList.remove('tick--active')
    }, 500)
  }
}
