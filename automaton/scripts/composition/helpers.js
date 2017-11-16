import math from 'mathjs'

const WEIGHT_B = -1 / 10000

export function combine(vector, weights) {
  return math.chain(vector)
    .transpose()
    .multiply(weights)
    .done()
}

export function universeCenterWeight(universe) {
  const distanceToSphere = universe.distance - universe.sphereSize

  let weight = 0

  if (distanceToSphere < 0) {
    weight = Math.pow(Math.E, WEIGHT_B * Math.pow(universe.distance, 2))
  }

  if (weight < 0.01) {
    weight = 0
  }

  return weight
}

export function distancesToWeights(values) {
  return values.reduce((acc, universe) => {
    acc.push(universeCenterWeight(universe))
    return acc
  }, [])
}

export function mixEnvelopes(presets, presetNames, weights) {
  // Merge all given values
  const envelopes = presetNames.reduce((acc, name) => {
    const preset = presets[name]

    preset.envelopes.forEach((envelope, index) => {
      preset.envelopes[index].forEach((opItem, opIndex) => {
        acc[index][opIndex].x.push(opItem.x)
        acc[index][opIndex].y.push(opItem.y)
      })
    })

    return acc
  }, [
    [{ x: [], y: [] }, { x: [], y: [] }, { x: [], y: [] }],
    [{ x: [], y: [] }, { x: [], y: [] }, { x: [], y: [] }],
    [{ x: [], y: [] }, { x: [], y: [] }, { x: [], y: [] }],
    [{ x: [], y: [] }, { x: [], y: [] }, { x: [], y: [] }],
  ])

  // Calculate the final weighted values
  envelopes.forEach((envelope, index) => {
    envelope.forEach((opItem, opIndex) => {
      envelopes[index][opIndex].x = combine(opItem.x, weights)
      envelopes[index][opIndex].y = combine(opItem.y, weights)
    })
  })

  return envelopes
}
