import { positionToTickIndex } from '../patternHelpers'

const defaultOptions = {
  maxUnheldNoteTicks: 40,
  synthesizerInterface: null,
}

function preparePattern(data, totalTicksCount, patternCycles, patternTotalTicksCount) {
  // Concert pattern to tick positions
  const pattern = data.pattern.reduce((acc, item) => {
    const tickIndex = positionToTickIndex(
      item.position,
      patternTotalTicksCount
    )
    acc[tickIndex] = item
    return acc
  }, {})

  return pattern
}

export default class Sequencer {
  constructor(customOptions) {
    this.options = Object.assign({}, defaultOptions, customOptions)

    this.currentCycle = 0
    this.data = null
    this.isRunning = false
    this.pattern = null
    this.previousNote = null
  }

  tick(currentTick, totalTicksCount) {
    // Ignore when no pattern is given
    if (!this.isRunning || !this.data) {
      return
    }

    // How many cycles long is our pattern
    const patternCycles = Math.pow(2, -(this.data.bpmLevel))

    // In which cycle is our pattern
    const patternCurrentCycle = this.currentCycle % patternCycles

    // Calculate how many ticks our pattern needs
    const patternTotalTicksCount = totalTicksCount * patternCycles

    // Current pattern tick
    const patternCurrentTick = (
      currentTick + (patternCurrentCycle * totalTicksCount)
    ) % (patternTotalTicksCount + 1)

    if (!this.pattern) {
      this.pattern = preparePattern(
        this.data,
        totalTicksCount,
        patternCycles,
        patternTotalTicksCount
      )
    }

    const { synthesizerInterface } = this.options

    // Get next event in pattern
    const nextNote = this.pattern[patternCurrentTick]

    // No pattern or upcoming event exists
    if (!nextNote) {
      // Stop current note when unheld note is played "too long"
      if (
        this.previousNote &&
        this.previousNote.frequency &&
        !this.previousNote.isHolding &&
        (
          (patternCurrentTick - this.previousNote.playedAtTick) >
          this.options.maxUnheldNoteTicks
        )
      ) {
        synthesizerInterface.noteOff(this.previousNote.frequency)
        this.previousNote = null
      }

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
      playedAtTick: patternCurrentTick,
    }
  }

  cycle(currentCycle, data) {
    // Use new data when given
    if (data) {
      this.reset()

      this.data = data
    }

    this.currentCycle = currentCycle
  }

  reset() {
    this.data = null
    this.options.synthesizerInterface.allNotesOff()
    this.pattern = null
    this.previousNote = null
  }

  start() {
    this.isRunning = true
  }

  stop() {
    this.isRunning = false

    this.reset()
  }
}
