import styles from '../styles/index.scss' // eslint-disable-line no-unused-vars

import Network from './network'
import Settings from './Settings'
import TestInterface from './TestInterface'

const settings = new Settings()

const network = new Network({
  onOpen: () => {
    console.log('open')
  },
  onClose: () => {
    console.log('close')
  },
  onOpenRemote: peer => {
    console.log('open', peer)
  },
  onCloseRemote: peer => {
    console.log('close', peer)
  },
  onSyncTick: () => {
    console.log('tick', new Date().getTime())
  },
  onReceive: (peer, data) => {
    console.log('receive', peer, data)
  },
  onError: err => {
    console.log(err)
  },
})

// Expose some interfaces to the view
window.automaton = window.automaton || {
  network: {
    connect: (event) => {
      event.preventDefault()
      network.connect(settings.getConfiguration())
    },
    disconnect: (event) => {
      event.preventDefault()
      network.disconnect()
    },
    send: (data) => {
      network.sendToAll(data)
    },
  },
  settings: {
    update: (event) => {
      const { id, value } = event.target
      settings.update(id, value)
    },
  },
  test: new TestInterface(),
}
