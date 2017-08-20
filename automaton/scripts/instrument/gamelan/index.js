import { convertPattern } from './patternHelpers'

const defaultSettings = {
  velocity: 1.0,
  octave: 0,
}

export default class Gamelan {
  constructor(options) {
    const { noteMaterial, synthesizerInterface } = options

    this.noteMaterial = noteMaterial
    this.synthesizerInterface = synthesizerInterface

    this.settings = defaultSettings

    this.currentPartIndex = 0
    this.currentPart = null
    this.previousPart = null
    this.pattern = []

    this.isRunning = false
  }

  step() {
    if (!this.isRunning) {
      return
    }

    if (this.pattern.length === 0) {
      return
    }

    const {
      isHolding,
      note,
      velocity,
    } = this.pattern[this.currentPartIndex]

    const previousNote = this.previousPart && this.previousPart.note

    if (previousNote && (previousNote !== note || !isHolding)) {
      this.synthesizerInterface.noteOff(previousNote)
    }

    if (note && (note !== previousNote || !isHolding)) {
      this.synthesizerInterface.noteOn(
        note,
        velocity
      )
    }

    this.previousPart = this.pattern[this.currentPartIndex]

    this.currentPartIndex += 1

    if (this.currentPartIndex >= this.pattern.length - 1) {
      this.currentPartIndex = 0
    }
  }

  start() {
    if (this.isRunning) {
      throw new Error('Gamelan is already running')
    }

    this.currentPartIndex = 0
    this.isRunning = true
  }

  stop() {
    if (!this.isRunning) {
      throw new Error('Gamelan is already stopped')
    }

    this.synthesizerInterface.allNotesOff()
    this.isRunning = false
  }

  changePattern(pattern, settings = {}) {
    this.settings = Object.assign({}, this.settings, settings)

    this.pattern = convertPattern(
      pattern,
      this.settings,
      this.noteMaterial
    )

    if (this.isRunning) {
      this.currentPartIndex = 0
      this.synthesizerInterface.allNotesOff()
    }
  }
}
