import Gamelan from './gamelan'
import SynthesizerInterface from './SynthesizerInterface'

export default class Instrument {
  constructor(options = {}) {
    const { noteMaterial, preset } = options

    this.synthesizerInterface = new SynthesizerInterface({
      preset,
    })

    this.gamelan = new Gamelan({
      noteMaterial,
      synthesizerInterface: this.synthesizerInterface,
    })
  }

  changePreset(preset) {
    this.synthesizerInterface.preset = preset
  }

  changePattern(notePattern, durationPattern, bpm, velocity, octave) {
    this.gamelan.changePattern(notePattern, durationPattern, {
      bpm,
      octave,
      velocity,
    })
  }

  start() {
    this.gamelan.start()
  }

  stop() {
    this.gamelan.stop()
  }
}
