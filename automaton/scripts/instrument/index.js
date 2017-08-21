import Gamelan from './gamelan'
import SynthesizerInterface from './SynthesizerInterface'
import { PRESETS } from './presets'

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60

const SMALLEST_BAR_DIVIDE = 16 // 16th note

const defaultOptions = {
  bpm: 120,
  noteMaterial: [],
  preset: PRESETS.BELL,
  onPatternBegin: () => {},
}

function bpmToMs(minuteMs = 60000, bpm, duration) {
  return (minuteMs / bpm) * (1 / duration) * 4
}

export default class Instrument {
  constructor(options = {}) {
    this.options = Object.assign({}, defaultOptions, options)

    this.lastTickSyncAt = null
    this.stepFrequency = null
    this.tickTimeout = null

    this.synthesizerInterface = new SynthesizerInterface({
      preset: this.options.preset,
    })

    this.gamelan = new Gamelan({
      noteMaterial: this.options.noteMaterial,
      onPatternBegin: () => {
        this.options.onPatternBegin()
      },
    }, this.synthesizerInterface)
  }

  isRunning() {
    return this.gamelan.isRunning
  }

  changePreset(preset) {
    this.synthesizerInterface.changePreset(preset)
  }

  changePattern(pattern, settings = {}) {
    if (settings.bpm) {
      this.options.bpm = settings.bpm
    }

    return this.gamelan.changePattern(
      pattern,
      settings
    )
  }

  step() {
    this.tickTimeout = setTimeout(() => {
      this.gamelan.step()
      this.step()
    }, this.stepFrequency)
  }

  syncTick() {
    // Calculate a minute in our synced network
    const now = new Date().getTime()
    const elasticSecond = (
      this.lastTickSyncAt ? now - this.lastTickSyncAt.getTime() : MS_PER_SECOND
    )
    const elasticMinute = SECONDS_PER_MINUTE * elasticSecond

    // .. and generate 16th note ticks
    this.stepFrequency = bpmToMs(
      elasticMinute,
      this.options.bpm,
      SMALLEST_BAR_DIVIDE
    )
    this.lastTickSyncAt = new Date()

    if (!this.tickTimeout) {
      this.step()
    }
  }

  syncPattern() {
    this.gamelan.resetCurrentStep()
  }

  start() {
    this.gamelan.start()
  }

  stop() {
    this.gamelan.stop()

    clearTimeout(this.tickTimeout)

    this.tickTimeout = null
    this.lastTickSyncAt = null
    this.lastPatternSyncAt = null
    this.stepFrequency = null
  }
}
