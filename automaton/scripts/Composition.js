import Instrument from './instrument'

import { PELOG, pickFromScale } from './instrument/scales'
import { PRESETS } from './instrument/presets'

const NOTE_MATERIAL = pickFromScale([6, 1, 2, 4, 5], PELOG)

const INITIAL_BPM = 80
const INITIAL_PRESET = PRESETS.BELL
const INITIAL_VELOCITY = 0.25

const defaultOptions = {}

export default class Composition {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.instrument = new Instrument({
      noteMaterial: NOTE_MATERIAL,
    })

    this.instrument.changePreset(INITIAL_PRESET)
    this.instrument.changeBpm(INITIAL_BPM)
    this.instrument.changeVelocity(INITIAL_VELOCITY)
  }

  getCurrentPattern() {
    return this.instrument.settings.patternString
  }

  start() {
    this.instrument.start()
  }

  stop() {
    this.instrument.stop()
  }
}
