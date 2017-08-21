import Sequencer from './sequencer'
import SynthesizerInterface from './SynthesizerInterface'
import { stringToSequencerPattern } from './patternHelpers'

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SMALLEST_BAR_DIVIDE = 16 // 16th note

const defaultOptions = {
  noteMaterial: [],
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

    this.settings = {
      bpm: 120,
      octave: 0,
      patternString: '',
      velocity: 1.0,
    }

    this.synthesizerInterface = new SynthesizerInterface()
    this.sequencer = new Sequencer(this.synthesizerInterface)
  }

  isRunning() {
    return this.sequencer.isRunning
  }

  changePreset(preset) {
    this.synthesizerInterface.changePreset(preset)
  }

  changeBpm(bpm) {
    this.settings.bpm = bpm
  }

  changeOctave(octave) {
    this.settings.octave = octave
  }

  changeVelocity(velocity) {
    this.settings.velocity = velocity
  }

  changePattern(patternString) {
    this.settings.patternString = patternString

    // Translate string to sequencer pattern
    const sequencerPattern = stringToSequencerPattern(
      this.settings.patternString,
      this.settings.octave,
      this.settings.velocity,
      this.options.noteMaterial
    )

    if (!sequencerPattern) {
      return false
    }

    // Give new pattern to sequencer when no problem occurred
    this.sequencer.changePattern(sequencerPattern)

    return true
  }

  step() {
    this.sequencer.step()

    this.tickTimeout = setTimeout(() => {
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
      this.settings.bpm,
      SMALLEST_BAR_DIVIDE
    )
    this.lastTickSyncAt = new Date()

    if (!this.tickTimeout) {
      this.step()
    }
  }

  start() {
    this.sequencer.start()
  }

  stop() {
    this.sequencer.stop()

    clearTimeout(this.tickTimeout)

    this.tickTimeout = null
    this.lastTickSyncAt = null
    this.lastPatternSyncAt = null
    this.stepFrequency = null
  }
}
