import galaxy from './galaxy.json'
import params from './params.json'
import presets from './presets.json'

import Instrument from '../instrument'
import { SCALES, pickFromScale } from '../instrument/scales'

function pickRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default class Composition {
  constructor() {
    this.instrument = new Instrument({
      baseBpm: params.instrument.baseBpm,
      noteMaterial: pickFromScale(
        params.instrument.notes,
        SCALES[params.instrument.scale]
      ),
      patternSettings: params.instrument.pattern,
    })

    this.reset()
  }

  nextPreset(isMe) {
    this.currentPresetIndex += 1

    if (this.currentPresetIndex > params.instrument.presets.length - 1) {
      this.currentPresetIndex = 0
    }

    return this.setPreset(this.currentPresetIndex, isMe)
  }

  setPreset(index, isMe) {
    const preset = params.instrument.presets[index]

    this.currentPresetIndex = index

    if (isMe) {
      this.instrument.changePreset(presets[preset.synthesizerPreset])
      this.instrument.synthesizerInterface.audio.changeVolume(preset.volume)
    }

    return pickRandomItem(preset.patterns)
  }

  getGalaxy() {
    return galaxy
  }

  getValidPatternCharacters() {
    const {
      bpmDown,
      bpmUp,
      holdNoteChar,
      notesChar,
      octaveDown,
      octaveUp,
      pauseChar,
    } = params.instrument.pattern

    return [
      bpmDown,
      bpmUp,
      holdNoteChar,
      octaveDown,
      octaveUp,
      pauseChar,
    ].concat(notesChar)
  }

  start() {
    this.instrument.start()
  }

  stop() {
    this.instrument.stop()
  }

  reset() {
    this.currentPresetIndex = params.instrument.initialPresetIndex

    const preset = params.instrument.presets[this.currentPresetIndex]

    this.instrument.changePreset(presets[preset.synthesizerPreset])
    this.instrument.synthesizerInterface.audio.changeVolume(preset.volume)
  }
}
