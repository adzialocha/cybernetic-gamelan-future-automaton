import deepAssign from 'deep-assign'

import Sequencer from './sequencer'
import SynthesizerInterface from './SynthesizerInterface'
import { convertString } from './patternHelpers'

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const TICKS_PER_SECOND = 120
const UNHELD_NOTE_MAX_DURATION = 8
const VARIANCE_TRESHOLD = 100

const defaultOptions = {
  baseBpm: 120,
  noteMaterial: [],
  patternSettings: {
    bpmDown: '<',
    bpmUp: '>',
    holdNoteChar: '*',
    maxBpmLevel: 1,
    maxOctaveLevel: 1,
    minBpmLevel: -3,
    minOctaveLevel: -1,
    notesChar: ['.', '-', '_', ':', '/'],
    octaveDown: '°',
    octaveUp: '^',
    pauseChar: ' ',
  },
}

function bpmToMs(minuteMs = 60000, bpm, duration) {
  return (minuteMs / bpm) * (1 / duration) * 4
}

function bpmToMsTicksPerSecond(minuteMs = 60000, bpm, duration) {
  return bpmToMs(minuteMs, bpm, duration) / 2
}

export default class Instrument {
  constructor(options = {}) {
    this.options = deepAssign({}, defaultOptions, options)

    this.lastTickSyncAt = null
    this.stepFrequency = null
    this.tickTimeout = null

    this.settings = {
      bpm: this.options.baseBpm,
      octave: 0,
      patternString: '',
      velocity: 1.0,
    }

    this.synthesizerInterface = new SynthesizerInterface()

    this.sequencer = new Sequencer({
      maxUnheldNoteTicks: Math.floor(
        TICKS_PER_SECOND / UNHELD_NOTE_MAX_DURATION
      ),
      synthesizerInterface: this.synthesizerInterface,
      tickTotalCount: TICKS_PER_SECOND,
      onNextCycle: cycleCount => {
        // Change pattern and bpm on next cycle when given
        if (this.nextWaitingPattern) {
          this.sequencer.changePattern(this.nextWaitingPattern)
          this.nextWaitingPattern = null
        }

        if (this.nextWaitingBpm) {
          console.log(`bpm: ${this.nextWaitingBpm}`)
          this.changeBpm(this.nextWaitingBpm)
          this.nextWaitingBpm = null
        }
      },
    })

    this.nextWaitingPattern = null
    this.nextWaitingBpm = null
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
    const result = convertString(
      this.options.patternSettings,
      this.settings.patternString,
      this.settings.velocity,
      this.options.noteMaterial
    )

    if (!result) {
      return false
    }

    // Prepare BPM and pattern for next cycle
    const newBpm = this.options.baseBpm * Math.pow(2, result.bpmLevel)
    this.nextWaitingBpm = newBpm
    this.nextWaitingPattern = result.pattern

    return true
  }

  step() {
    this.sequencer.step()

    this.tickTimeout = setTimeout(() => {
      this.step()
    }, this.stepFrequency)
  }

  syncTick() {
    // Calculate a second in our synced network
    const now = new Date().getTime()
    let elasticSecond = (
      this.lastTickSyncAt ? now - this.lastTickSyncAt.getTime() : MS_PER_SECOND
    )

    if (Math.abs(elasticSecond) - MS_PER_SECOND > VARIANCE_TRESHOLD) {
      elasticSecond = MS_PER_SECOND
      console.warn('Warning: out of sync!')
    }

    const elasticMinute = SECONDS_PER_MINUTE * elasticSecond

    // .. and generate ticks
    this.stepFrequency = bpmToMsTicksPerSecond(
      elasticMinute,
      this.settings.bpm,
      TICKS_PER_SECOND
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
