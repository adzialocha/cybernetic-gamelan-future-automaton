import { ALGORITHMS } from './algorithms'

import {
  calculatePhaseIncrement,
  calculateRatioFrequency,
  convertOperatorSettings,
} from './helpers'

import Operator from './Operator'

const DEFAULT_SAMPLE_RATE = 16000

export default class Synthesizer {
  constructor(options = {}) {
    if (!options || !options.preset) {
      throw new Error('Preset option is not set')
    }

    this.sampleRate = options.sampleRate || DEFAULT_SAMPLE_RATE

    this.velocity = 1.0
    this.feedback = 0.0

    this.algorithmId = 0
    this.operators = []

    for (let i = 0; i < 4; i += 1) {
      this.operators.push(new Operator())
    }

    this.changePreset(options.preset)
  }

  generateAudio(left, right) {
    const numSamples = left.length
    const algorithm = ALGORITHMS[this.algorithmId]

    for (let sampleIndex = 0; sampleIndex < numSamples; sampleIndex += 1) {
      let mainOutput = 0

      for (let op = this.operators.length - 1; op >= 0; op -= 1) {
        let modOutput = 0
        const operator = this.operators[op]

        this.operators.forEach((item, index) => {
          modOutput += algorithm[op][index] * this.operators[index]._output
        })

        modOutput *= 10

        if (op === 3) {
          modOutput += operator._output * this.feedback * 3
        }

        const amp = operator.envelope.amp
        operator._output = Math.sin(operator._phase + modOutput) * amp * amp

        if (operator.isVelocitySensitive) {
          operator._output *= this.velocity
        }

        operator._phase += operator._phaseIncrement

        mainOutput += operator._output * algorithm[4][op]
      }

      right[sampleIndex] = left[sampleIndex] = mainOutput

      this.operators.forEach(operator => {
        operator.next()
      })
    }
  }

  noteOn(note, velocity) {
    this.velocity = velocity

    this.operators.forEach(operator => {
      const frequency = calculateRatioFrequency(
        operator.coarse,
        operator.fine
      )

      operator._phaseIncrement = calculatePhaseIncrement(
        note,
        this.sampleRate
      ) * frequency

      operator._phase = 0.0
      operator._output = 0.0
    })

    this.operators.forEach(operator => {
      operator.noteOn()
    })
  }

  noteOff() {
    return new Promise(resolve => {
      let counter = this.operators.length

      this.operators.forEach(operator => {
        operator.envelope.onRelease = () => {
          counter -= 1
          if (counter === 0) {
            resolve()
          }
        }

        operator.noteOff()
      })
    })
  }

  changeOperator(index, setting) {
    if (index < 0 || index > this.operators.length - 1) {
      return
    }

    this.operators[index].coarse = setting.coarse
    this.operators[index].fine = setting.fine

    this.operators[index].isFixed = setting.isFixed
    this.operators[index].isVelocitySensitive = setting.isVelocitySensitive

    this.operators[index].changeEnvelope(setting.envelope)
  }

  changePreset(preset) {
    const convertedPreset = convertOperatorSettings(
      preset,
      this.sampleRate
    )

    this.feedback = convertedPreset.feedback
    this.algorithmId = convertedPreset.algorithmId

    convertedPreset.operators.forEach((setting, index) => {
      this.changeOperator(index, setting)
    })
  }
}
