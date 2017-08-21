import Instrument from './instrument'

import { PELOG, pickFromScale } from './instrument/scales'
import { PRESETS } from './instrument/presets'

const NOTE_MATERIAL = pickFromScale([6, 1, 2, 4, 5], PELOG)

const BASE_BPM = 80
const PRESET = PRESETS.BELL
const VELOCITY = 0.25

const POSSIBLE_OCTAVES = [
  0,
  1,
]

const defaultOptions = {}

function pickRandom(collection) {
  return collection[Math.floor(Math.random() * collection.length)]
}

export default class Composition {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.instrument = new Instrument({
      baseBpm: BASE_BPM,
      noteMaterial: NOTE_MATERIAL,
    })

    this.instrument.changePreset(PRESET)
    this.instrument.changeVelocity(VELOCITY)

    this.interval = null
  }

  getCurrentPattern() {
    return this.instrument.settings.patternString
  }

  start() {
    this.instrument.start()

    // For testing
    this.interval = setInterval(() => {
      if (Math.random() < 0.5) {
        return
      }

      this.instrument.changeOctave(pickRandom(POSSIBLE_OCTAVES))
    }, 10000)
  }

  stop() {
    this.instrument.stop()

    clearInterval(this.interval)
  }
}
