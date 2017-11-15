import math from 'mathjs'

import galaxy from './galaxy.json'
import params from './params.json'
import presets from './presets.json'

import Instrument from '../instrument'
import { SCALES, pickFromScale } from '../instrument/scales'

function isDifferent(oldDistances, newDistances) {
  return oldDistances.some((value, index) => {
    return oldDistances[index].distance !== newDistances[index].distance
  })
}

export default class Composition {
  constructor() {
    // Initialise gamelan instrument
    this.instrument = new Instrument({
      baseBpm: params.instrument.baseBpm,
      noteMaterial: pickFromScale(
        params.instrument.notes,
        SCALES[params.instrument.scale]
      ),
      patternSettings: params.instrument.pattern,
    })

    // Initialise base synthesizer sound
    const { name, velocity, volume } = params.basePreset
    this.instrument.changePreset(presets[name], velocity, volume)

    // New distances
    this.distances = null
    this.isDirty = false
  }

  queueDistances(newDistances) {
    if (!this.distances || isDifferent(newDistances, this.distances)) {
      this.distances = newDistances
      this.isDirty = true
    }
  }

  cycle(currentCycle) {
    this.instrument.cycle(currentCycle)

    if (this.distances && this.isDirty) {
      this.updateSynthesizer(this.distances)
      this.isDirty = false
    }
  }

  updateSynthesizer(distances) {
    const b = -1 / 10000

    // Calculate the weight of every universe
    const weights = distances.reduce((acc, item) => {
      const distanceToSphere = item.distance - item.sphereSize

      let mix = 1

      if (distanceToSphere > 0) {
        mix = Math.pow(Math.E, b * Math.pow(distanceToSphere, 2))
      }

      if (mix < 0.01) {
        mix = 0
      }

      acc.push(mix)

      return acc
    }, [])

    weights.push(1.0 - Math.max(...weights))

    const presetNames = galaxy.reduce((acc, universe) => {
      acc.push(universe.preset.name)
      return acc
    }, [])

    presetNames.push(params.basePreset.name)

    const synthParams = presetNames.reduce((acc, name) => {
      const preset = presets[name]

      acc.coarse.push(preset.coarse)
      acc.feedback.push(preset.feedback)
      acc.fine.push(preset.fine)

      preset.envelopes.forEach((envelope, index) => {
        preset.envelopes[index].forEach((op, opIndex) => {
          acc.envelopes[index][opIndex].x.push(preset.envelopes[index][opIndex].x)
          acc.envelopes[index][opIndex].y.push(preset.envelopes[index][opIndex].y)
        })
      })

      return acc
    }, {
      coarse: [],
      feedback: [],
      fine: [],
      envelopes: [[
        { x: [], y: [] },
        { x: [], y: [] },
        { x: [], y: [] },
      ], [
        { x: [], y: [] },
        { x: [], y: [] },
        { x: [], y: [] },
      ], [
        { x: [], y: [] },
        { x: [], y: [] },
        { x: [], y: [] },
      ], [
        { x: [], y: [] },
        { x: [], y: [] },
        { x: [], y: [] },
      ]],
    })

    synthParams.coarse = math.chain(synthParams.coarse).transpose().multiply(weights).done()
    synthParams.fine = math.chain(synthParams.fine).transpose().multiply(weights).done()
    synthParams.feedback = math.chain([synthParams.feedback]).multiply(weights).done()

    synthParams.envelopes.forEach((item, index) => {
      item.forEach((opItem, opIndex) => {
        synthParams.envelopes[index][opIndex].x = math.chain(synthParams.envelopes[index][opIndex].x).transpose().multiply(weights).done()
        synthParams.envelopes[index][opIndex].y = math.chain(synthParams.envelopes[index][opIndex].y).transpose().multiply(weights).done()
      })
    })

    const maxUniverseIndex = weights.indexOf(Math.max(...weights))
    const leadingPreset = presets[presetNames[maxUniverseIndex]]
    const basePreset = presets[presetNames[4]]

    synthParams.name = basePreset.name
    synthParams.algorithmId = basePreset.algorithmId
    synthParams.isLoop = basePreset.isLoop
    synthParams.isVelocitySensitive = basePreset.isVelocitySensitive

    this.instrument.changePreset(synthParams, 0.5, 1.0)

    console.log('=======')
    console.log(presetNames.reduce((acc, name, index) => {
      acc.push(name + ': ' + (Math.floor(weights[index] * 100 )) + '%')
      return acc
    }, []).join('\n'))
  }

  getGalaxy() {
    return galaxy
  }

  getValidPatternCharacters() {
    const {
      bpmDown,
      bpmUp,
      holdNoteChar,
      notesChar,
      octaveDown,
      octaveUp,
      pauseChar,
    } = params.instrument.pattern

    return [
      bpmDown,
      bpmUp,
      holdNoteChar,
      octaveDown,
      octaveUp,
      pauseChar,
    ].concat(notesChar)
  }

  start() {
    this.instrument.start()
  }

  stop() {
    this.instrument.stop()
  }
}
