import Instrument from './instrument'
import { PELOG, pickFromScale } from './instrument/scales'
import { PRESETS } from './instrument/presets'

const BASE_BPM = 80
const INITIAL_PRESET_INDEX = 0
const NOTE_MATERIAL = pickFromScale([6, 1, 2, 4, 5], PELOG)

const PRESET_LIST = [{
  synthesizerPreset: PRESETS.BELL,
  velocity: 0.25,
  volume: 0.5,
  patterns: [
    '_/:-',
    ':-_-',
  ],
}, {
  synthesizerPreset: PRESETS.GLOCKENSPIEL,
  velocity: 0.25,
  volume: 0.5,
  patterns: [
    '_/:-',
    ':-_-',
  ],
}, {
  synthesizerPreset: PRESETS.SPACE,
  velocity: 0.25,
  volume: 0.5,
  patterns: [
    '_/:-',
    ':-_-',
  ],
}, {
  synthesizerPreset: PRESETS.PING,
  velocity: 0.25,
  volume: 0.5,
  patterns: [
    '_/:-',
    ':-_-',
  ],
}]

function pickRandomPattern(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default class Composition {
  constructor() {
    this.instrument = new Instrument({
      baseBpm: BASE_BPM,
      noteMaterial: NOTE_MATERIAL,
    })

    this.currentPresetIndex = INITIAL_PRESET_INDEX
    this.setPreset(this.currentPresetIndex)
  }

  nextPreset() {
    this.currentPresetIndex += 1

    if (this.currentPresetIndex > PRESET_LIST.length - 1) {
      this.currentPresetIndex = 0
    }

    return this.setPreset(this.currentPresetIndex)
  }

  setPreset(index) {
    const preset = PRESET_LIST[index]

    this.currentPresetIndex = index

    this.instrument.changePreset(preset.synthesizerPreset)
    this.instrument.changeVelocity(preset.velocity)

    this.instrument.synthesizerInterface.audio.changeVolume(preset.volume)

    return pickRandomPattern(preset.patterns)
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
