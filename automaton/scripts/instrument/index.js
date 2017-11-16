import mergeOptions from 'merge-options'

import Sequencer from './sequencer'
import SynthesizerInterface from './SynthesizerInterface'
import { convertString } from './patternHelpers'

const UNHELD_NOTE_MAX_DURATION = 8

const defaultOptions = {
  noteMaterial: [],
  patternSettings: {
    bpmDown: '<',
    bpmUp: '>',
    holdNoteChar: '*',
    maxBpmLevel: 2,
    maxOctaveLevel: 1,
    minBpmLevel: -3,
    minOctaveLevel: -1,
    notesChar: ['.', '-', '_', ':', '/'],
    octaveDown: '°',
    octaveUp: '^',
    pauseChar: ' ',
  },
}

export default class Instrument {
  constructor(options = {}) {
    this.options = mergeOptions({}, defaultOptions, options)

    this.synthesizerInterface = new SynthesizerInterface()

    this.sequencer = new Sequencer({
      maxUnheldNoteTicks: UNHELD_NOTE_MAX_DURATION,
      synthesizerInterface: this.synthesizerInterface,
    })

    this.waitingCommit = null
    this.velocity = 1.0
  }

  changePreset(preset, velocity) {
    this.synthesizerInterface.changePreset(preset)
    this.velocity = velocity
  }

  queuePattern(patternString) {
    // Translate string to sequencer pattern
    const result = convertString(
      this.options.patternSettings,
      patternString,
      this.velocity,
      this.options.noteMaterial
    )

    if (!result) {
      return false
    }

    // Prepare pattern for next cycle
    this.waitingCommit = result

    return true
  }

  cycle(currentCycle) {
    // Finally commit the new pattern when waiting for it
    this.sequencer.cycle(currentCycle, this.waitingCommit)
    this.waitingCommit = null
  }

  tick(currentTick, ticksTotalCount) {
    this.sequencer.tick(currentTick, ticksTotalCount)
  }

  start() {
    this.sequencer.start()
  }

  stop() {
    this.sequencer.stop()
  }
}
