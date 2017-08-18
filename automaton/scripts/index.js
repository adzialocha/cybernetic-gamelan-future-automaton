import styles from '../styles/index.scss' // eslint-disable-line no-unused-vars

import { PRESETS } from './instrument/presets'

import Instrument from './instrument'

const instrument = new Instrument({
  preset: PRESETS.BELL,
})

// For testing only
window.noteOn = (note, velocity) => {
  instrument.noteOn(note, velocity)
}

window.noteOff = () => {
  instrument.noteOff()
}
