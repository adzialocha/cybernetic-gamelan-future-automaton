import Instrument from './instrument'

import { PELOG, pickFromScale } from './instrument/scales'
import { PRESETS } from './instrument/presets'

const NOTE_MATERIAL = pickFromScale([6, 1, 2, 4, 5], PELOG)

const BASE_BPM = 80
const PRESET = PRESETS.BELL
const VELOCITY = 0.25

const defaultOptions = {}

export default class Composition {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.instrument = new Instrument({
      baseBpm: BASE_BPM,
      noteMaterial: NOTE_MATERIAL,
    })

    this.instrument.changePreset(PRESET)
    this.instrument.changeVelocity(VELOCITY)
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
