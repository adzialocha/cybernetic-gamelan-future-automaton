import Instrument from './instrument'

import { PELOG, pickFromScale } from './instrument/gamelan/scales'
import { PRESETS } from './instrument/presets'

const NOTE_MATERIAL = pickFromScale([6, 1, 2, 4, 5], PELOG)

const INITIAL_BPM = 80
const INITIAL_PATTERN = ',.-#+,.-#++#-.,'
const INITIAL_PRESET = PRESETS.BELL
const INITIAL_VELOCITY = 0.25

const defaultOptions = {
  onPatternBegin: () => {},
}

export default class Composition {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.instrument = new Instrument({
      bpm: INITIAL_BPM,
      noteMaterial: NOTE_MATERIAL,
      preset: INITIAL_PRESET,
      onPatternBegin: () => {
        this.options.onPatternBegin()
      },
    })

    this.instrument.changePattern(INITIAL_PATTERN, {
      velocity: INITIAL_VELOCITY,
    })
  }

  getCurrentPattern() {
    return this.instrument.gamelan.pattern
  }
}
