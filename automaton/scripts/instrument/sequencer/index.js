import { positionToTickIndex } from '../patternHelpers'

const defaultOptions = {
  maxUnheldNoteTicks: 0,
  onNextCycle: () => true,
  synthesizerInterface: null,
  tickTotalCount: 0,
}

export default class Sequencer {
  constructor(customOptions) {
    this.options = Object.assign({}, defaultOptions, customOptions)

    this.currentTickIndex = 0
    this.cycleCount = 0
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

    // Cycle callback when reached beginning of new cycle
    if (this.currentTickIndex === 0) {
      this.options.onNextCycle(this.cycleCount)
      this.cycleCount += 1
    }

    // Tick and ignore when no pattern is given
    if (this.pattern.length === 0) {
      this.tick()
      return
    }

    const { synthesizerInterface } = this.options

    // Get next event in pattern
    const nextNote = this.pattern[this.currentTickIndex]

    // No pattern or upcoming event exists
    if (!nextNote) {
      // Stop current note when unheld note is played "too long"
      if (
        this.previousNote &&
        this.previousNote.frequency &&
        !this.previousNote.isHolding &&
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

    const { frequency, velocity } = nextNote
    const previousFrequency = this.previousNote && this.previousNote.frequency

    // Stop previous note for upcoming one
    if (previousFrequency) {
      synthesizerInterface.noteOff(previousFrequency)
    }

    // Play a new note
    if (frequency) {
      synthesizerInterface.noteOn(frequency, velocity)
    }

    // Keep the last played note in memory
    this.previousNote = {
      ... nextNote,
      playedAtTick: this.currentTickIndex,
    }

    this.tick()
  }

  reset() {
    this.currentTickIndex = 0
    this.options.synthesizerInterface.allNotesOff()
    this.pattern = []
    this.previousNote = null
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
