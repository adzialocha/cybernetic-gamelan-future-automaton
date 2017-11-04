import { positionToTickIndex } from '../patternHelpers'

const defaultOptions = {
  maxUnheldNoteTicks: 0,
  synthesizerInterface: null,
  tickTotalCount: 0,
}

export default class Sequencer {
  constructor(customOptions) {
    this.options = Object.assign({}, defaultOptions, customOptions)

    this.currentPatternIndex = 0
    this.currentTickIndex = 0
    this.previousNote = null

    this.pattern = []

    this.isRunning = false
  }

  tick() {
    this.currentTickIndex += 1

    if (this.currentTickIndex > this.options.tickTotalCount) {
      this.currentTickIndex = 0
    }
  }

  step() {
    if (!this.isRunning) {
      return
    }

    if (this.pattern.length === 0) {
      this.tick()
      return
    }

    const { synthesizerInterface } = this.options

    // Get next event in pattern
    const nextNote = this.pattern[this.currentTickIndex]

    // No pattern or upcoming event exists
    if (!nextNote) {
      // Stop current note when note is played "too long"
      if (
        this.previousNote &&
        this.previousNote.frequency &&
        (
          (this.currentTickIndex - this.previousNote.playedAtTick) >
          this.options.maxUnheldNoteTicks
        )
      ) {
        synthesizerInterface.noteOff(this.previousNote.frequency)
        this.previousNote = null
      }

      this.tick()

      return
    }

    const { frequency, isHolding, velocity } = nextNote
    const previousFrequency = this.previousNote && this.previousNote.frequency

    // Stop previous note for upcoming one
    if (
      previousFrequency &&
      (previousFrequency !== frequency || !isHolding)
    ) {
      synthesizerInterface.noteOff(previousFrequency)
    }

    // Play a new note when previous is not held
    if (
      frequency &&
      (frequency !== previousFrequency || !isHolding)
    ) {
      synthesizerInterface.noteOn(
        frequency,
        velocity
      )
    }

    this.previousNote = {
      ... nextNote,
      playedAtTick: this.currentTickIndex,
    }

    this.tick()
  }

  reset() {
    this.pattern = []

    this.currentPatternIndex = 0
    this.currentTickIndex = 0
    this.previousNote = null

    this.options.synthesizerInterface.allNotesOff()
  }

  start() {
    this.isRunning = true
  }

  stop() {
    this.isRunning = false

    this.reset()
  }

  changePattern(pattern) {
    this.reset()

    // Convert pattern note positions to tick index object
    this.pattern = pattern.reduce((acc, item) => {
      const tickIndex = positionToTickIndex(
        item.position,
        this.options.tickTotalCount
      )
      acc[tickIndex] = item
      return acc
    }, {})
  }
}
