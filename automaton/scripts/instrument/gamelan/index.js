import { symbolsToPattern } from './patternHelpers'

const defaultSettings = {
  bpm: 120,
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
    this.pattern = []

    this.timeout = null
    this.isRunning = false
  }

  playNext() {
    if (this.pattern.length === 0) {
      return
    }

    const {
      duration,
      note,
      velocity,
    } = this.pattern[this.currentPartIndex]

    if (note) {
      this.synthesizerInterface.noteOn(
        note,
        velocity
      )
    }

    this.timeout = setTimeout(() => {
      if (!this.isRunning) {
        return
      }

      if (this.pattern.length === 0) {
        return
      }

      if (note) {
        this.synthesizerInterface.noteOff(note)
      }

      this.currentPartIndex += 1

      if (this.currentPartIndex >= this.pattern.length - 1) {
        this.currentPartIndex = 0
      }

      this.playNext()
    }, duration)
  }

  start() {
    if (this.isRunning) {
      throw new Error('Gamelan is already running')
    }

    this.currentPartIndex = 0
    this.isRunning = true

    this.playNext()
  }

  stop() {
    if (!this.isRunning) {
      throw new Error('Gamelan is already stopped')
    }

    clearTimeout(this.timeout)

    this.synthesizerInterface.allNotesOff()

    this.timeout = null
    this.isRunning = false
  }

  changePattern(notePattern, durationPattern, settings = {}) {
    this.settings = Object.assign({}, this.settings, settings)

    this.pattern = symbolsToPattern(
      notePattern,
      durationPattern,
      this.settings,
      this.noteMaterial
    )

    if (this.isRunning) {
      clearTimeout(this.timeout)

      this.currentPartIndex = 0
      this.synthesizerInterface.allNotesOff()

      this.playNext()
    }
  }
}
