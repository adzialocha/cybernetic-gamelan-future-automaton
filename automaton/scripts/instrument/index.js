import Gamelan from './gamelan'
import SynthesizerInterface from './SynthesizerInterface'

const DEFAULT_BPM = 120

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60

function bpmToMs(minuteMs = 60000, bpm, duration) {
  return (minuteMs / bpm) * (1 / duration) * 4
}

export default class Instrument {
  constructor(options = {}) {
    const { noteMaterial, preset } = options

    this.tickTimeout = null
    this.sixteenthFrequency = null
    this.lastTickAt = null
    this.bpm = DEFAULT_BPM

    this.synthesizerInterface = new SynthesizerInterface({
      preset,
    })

    this.gamelan = new Gamelan({
      noteMaterial,
      synthesizerInterface: this.synthesizerInterface,
    })
  }

  changePreset(preset) {
    this.synthesizerInterface.changePreset(preset)
  }

  changePattern(pattern, settings) {
    this.bpm = settings.bpm || DEFAULT_BPM

    this.gamelan.changePattern(
      pattern,
      settings
    )
  }

  step() {
    this.tickTimeout = setTimeout(() => {
      this.gamelan.step()
      this.step()
    }, this.sixteenthFrequency)
  }

  tick() {
    // Calculate a minute in our synced network
    const now = new Date().getTime()
    const elasticSecond = (
      this.lastTickAt ? now - this.lastTickAt.getTime() : MS_PER_SECOND
    )
    const elasticMinute = SECONDS_PER_MINUTE * elasticSecond

    // .. and generate 16th note ticks
    this.sixteenthFrequency = bpmToMs(elasticMinute, this.bpm, 16)
    this.lastTickAt = new Date()

    if (!this.tickTimeout) {
      this.step()
    }
  }

  start() {
    this.gamelan.start()
  }

  stop() {
    this.gamelan.stop()

    clearInterval(this.tickTimeout)
    this.tickTimeout = null
  }
}
