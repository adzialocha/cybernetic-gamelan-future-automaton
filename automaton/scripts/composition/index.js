import mergeOptions from 'merge-options'

import galaxy from './galaxy.json'
import params from './params.json'
import presets from './presets.json'

import Instrument from '../instrument'
import { SCALES, pickFromScale } from '../instrument/scales'

import { distancesToWeights, mixEnvelopes } from './helpers'

const VOLUME_CHANGE_SILENCE = 250
const VOLUME_CHANGE_DURATION = 2

function isDifferent(oldDistances, newDistances) {
  return oldDistances.some((value, index) => {
    return oldDistances[index].distance !== newDistances[index].distance
  })
}

const defaultOptions = {
  onUniverseEntered: () => {},
}

export default class Composition {
  constructor(options) {
    this.options = mergeOptions({}, defaultOptions, options)

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

    // Used preset names in this composition
    const presetNames = galaxy.reduce((acc, universe) => {
      acc.push(universe.preset.name)
      return acc
    }, [])

    presetNames.push(params.basePreset.name)

    this.presetNames = presetNames
    this.currentUniverse = params.basePreset.name
  }

  queueDistances(newDistances) {
    if (!this.distances || isDifferent(newDistances, this.distances)) {
      this.distances = newDistances
      this.isDirty = true
    }
  }

  tick(currentTick, totalTicksCount) {
    this.instrument.tick(currentTick, totalTicksCount)

    if (this.distances && this.isDirty) {
      this.updateSynthesizer(this.distances)
      this.isDirty = false
    }
  }

  cycle(currentCycle) {
    this.instrument.cycle(currentCycle)
  }

  updateSynthesizer(distances) {
    // Calculate the weight of every universe
    const weights = distancesToWeights(distances)
    const currentWeight = Math.max(...weights)

    let presetInfo

    if (currentWeight === 0) {
      // No planet was entered, use the galaxy base preset
      presetInfo = params.basePreset
    } else {
      // We entered a universe
      presetInfo = galaxy[weights.indexOf(currentWeight)].preset
    }

    const { velocity, volume, name } = presetInfo
    const preset = mergeOptions({}, presets[name])

    // Color the sound depending on the players position in universe
    if (currentWeight > 0) {
      const presetWeight = [1.0 - currentWeight, currentWeight]

      const newEnvelopes = mixEnvelopes(
        presets,
        [name, params.basePreset.name],
        presetWeight
      )

      preset.envelopes = newEnvelopes
    }

    // Call when we entered a new universe
    if (this.currentUniverse !== name) {
      this.currentUniverse = name

      // Ramp the volume change for a smooth transition
      this.instrument.synthesizerInterface.audio.changeVolume(0.01)

      setTimeout(() => {
        this.instrument.synthesizerInterface.audio.changeVolume(
          volume,
          true,
          VOLUME_CHANGE_DURATION
        )
      }, VOLUME_CHANGE_SILENCE)

      this.options.onUniverseEntered(name)
    }

    this.instrument.changePreset(preset, velocity)
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
