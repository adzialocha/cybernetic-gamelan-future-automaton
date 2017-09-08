const STORAGE_KEY = 'automaton'

function loadFromStorage() {
  const storage = window.localStorage.getItem(STORAGE_KEY)
  return storage ? JSON.parse(storage) : {}
}

function saveToStorage(configuration) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configuration))
}

function resetStorage() {
  window.localStorage.setItem(STORAGE_KEY, null)
}

const defaultConfiguration = {
  clientsNumber: 4,
  peerId: 1,
  // serverHost: 'cybernetic-gamelan-automaton.herokuapp.com',
  // serverKey: '',
  // serverPath: '/api',
  // serverPort: 80,
  serverHost: '0.peerjs.com',
  serverKey: 'gs5wl7sq2cblnmi',
  serverPath: '/',
  serverPort: 9000,
}

export default class Settings {
  constructor() {
    this.configuration = Object.assign(
      {},
      defaultConfiguration,
      loadFromStorage()
    )
  }

  update(id, value) {
    this.configuration[id] = value
    saveToStorage(this.configuration)
  }

  getConfiguration() {
    return this.configuration
  }

  reset() {
    this.configuration = Object.assign({}, defaultConfiguration)
    resetStorage()
  }
}
