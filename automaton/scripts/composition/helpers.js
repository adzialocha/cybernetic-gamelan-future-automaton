import math from 'mathjs'

export function combine(matrix, weightsVector) {
  return math.chain(matrix)
    .transpose()
    .multiply(weightsVector)
    .done()
}

export function universeCenterWeight(universe, distanceFunction) {
  const distanceToSphere = universe.distance - universe.sphereSize

  let weight = 0

  if (distanceToSphere <= 0) {
    weight = math.eval(distanceFunction, {
      x: universe.distance,
      e: Math.E,
    })
  }

  return weight < 0.01 ? 0 : weight
}

export function currentUniverseIndex(values) {
  return values.findIndex(universe => {
    return universe.distance - universe.sphereSize <= 0
  })
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
