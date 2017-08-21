import { convertPattern } from './patternHelpers'

const defaultSettings = {
  velocity: 1.0,
  octave: 0,
}

const defaultOptions = {
  noteMaterial: [],
  onPatternBegin: () => {},
}

export default class Gamelan {
  constructor(options, synthesizerInterface) {
    this.options = Object.assign({}, defaultOptions, options)
    this.settings = defaultSettings

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

    if (this.currentStepIndex === 0) {
      this.options.onPatternBegin()
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
    if (this.isRunning) {
      throw new Error('Gamelan is already running')
    }

    this.isRunning = true
  }

  stop() {
    this.isRunning = false
    this.resetCurrentStep()
  }

  resetCurrentStep() {
    this.currentStepIndex = 0
    this.previousStep = null
    this.synthesizerInterface.allNotesOff()
  }

  changePattern(pattern, settings = {}) {
    this.settings = Object.assign({}, this.settings, settings)

    const convertedPattern = convertPattern(
      pattern,
      this.settings,
      this.options.noteMaterial
    )

    if (!convertedPattern) {
      return false
    }

    this.pattern = convertedPattern

    if (this.isRunning) {
      if (this.currentStepIndex > this.pattern.length - 1) {
        this.currentStepIndex = 0
      }
      this.previousStep = null
      this.synthesizerInterface.allNotesOff()
    }

    return true
  }
}
