export default class Sequencer {
  constructor(synthesizerInterface) {
    this.synthesizerInterface = synthesizerInterface

    this.currentStep = null
    this.currentStepIndex = 0
    this.previousStep = null

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
    } = this.pattern[this.currentStepIndex]

    const previousNote = this.previousStep && this.previousStep.note

    if (previousNote && (previousNote !== note || !isHolding)) {
      this.synthesizerInterface.noteOff(previousNote)
    }

    if (note && (note !== previousNote || !isHolding)) {
      this.synthesizerInterface.noteOn(
        note,
        velocity
      )
    }

    this.previousStep = this.pattern[this.currentStepIndex]

    this.currentStepIndex += 1

    if (this.currentStepIndex > this.pattern.length - 1) {
      this.currentStepIndex = 0
    }
  }

  start() {
    this.isRunning = true
  }

  stop() {
    this.isRunning = false

    this.currentStepIndex = 0
    this.previousStep = null
    this.synthesizerInterface.allNotesOff()
  }

  changePattern(pattern) {
    this.pattern = pattern

    if (this.isRunning) {
      if (this.currentStepIndex > this.pattern.length - 1) {
        this.currentStepIndex = 0
      }
      this.previousStep = null
      this.synthesizerInterface.allNotesOff()
    }
  }
}
