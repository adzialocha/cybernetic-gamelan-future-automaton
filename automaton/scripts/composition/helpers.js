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
      s: universe.sphereSize,
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

export function mixEnvelopes(envelopes, weights) {
  // Merge all given values
  const newEnvelopes = envelopes.reduce((acc, envelope) => {
    envelope.forEach((envelopeItem, envelopeIndex) => {
      envelopeItem.forEach((opItem, opIndex) => {
        acc[envelopeIndex][opIndex].x.push(opItem.x)
        acc[envelopeIndex][opIndex].y.push(opItem.y)
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
  newEnvelopes.forEach((envelopeItem, envelopeIndex) => {
    envelopeItem.forEach((opItem, opIndex) => {
      newEnvelopes[envelopeIndex][opIndex].x = combine(opItem.x, weights)
      newEnvelopes[envelopeIndex][opIndex].y = combine(opItem.y, weights)
    })
  })

  return newEnvelopes
}
