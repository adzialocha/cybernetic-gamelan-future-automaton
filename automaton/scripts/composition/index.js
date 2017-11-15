import galaxy from './galaxy.json'
import params from './params.json'
import presets from './presets.json'

import Instrument from '../instrument'
import { SCALES, pickFromScale } from '../instrument/scales'

export default class Composition {
  constructor() {
    // Initialise gamelan instrument
    this.instrument = new Instrument({
      baseBpm: params.instrument.baseBpm,
      noteMaterial: pickFromScale(
        params.instrument.notes,
        SCALES[params.instrument.scale]
      ),
      patternSettings: params.instrument.pattern,
    })

    // Initialise base synthesizer sound
    const { name, velocity, volume } = params.basePreset
    this.instrument.changePreset(presets[name], velocity, volume)
  }

  updateDistances(distances) {

  }

  cycle(currentCycle) {
    this.instrument.cycle(currentCycle)
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
}
