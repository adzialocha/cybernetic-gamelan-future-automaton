import styles from '../styles/index.scss' // eslint-disable-line no-unused-vars

import Instrument from './instrument'
import { PRESETS } from './instrument/presets'

export default class TestInterface {
  constructor() {
    this.instrument = new Instrument({
      preset: PRESETS.BELL,
      noteMaterial: [
        62,
        65,
        70,
        72,
        74,
      ],
    })
  }

  changePattern(notePattern, durationPattern, bpm, velocity, octave) {
    this.instrument.changePattern(
      notePattern,
      durationPattern,
      bpm,
      velocity,
      octave
    )
  }

  start() {
    this.instrument.start()
  }

  stop() {
    this.instrument.stop()
  }

  noteOn(note, velocity) {
    this.instrument.synthesizerInterface.noteOn(note, velocity)
  }

  noteOff(note) {
    this.instrument.synthesizerInterface.noteOff(note)
  }
}
