import {
  BufferGeometry,
  Geometry,
  Mesh,
  Vector3,
} from 'three'

export function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomRangePercentage(min = 0.0, max = 1.0) {
  return randomRange(min * 100, max * 100) / 100.0
}

export function randomRangeWithNegative(range) {
  return randomRange(0, range) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1)
}

export function mergeRandomlyPlacedObjects(count, baseGeometry, material, sphereSize, maxFactor = 0.03) {
  const mergedGeometry = new Geometry()

  for (let i = 0; i < count; i += 1) {
    const geometry = baseGeometry
    const factor = randomRangePercentage(0, maxFactor)
    geometry.vertices = randomizeGeometryVertices(geometry.vertices, factor)

    const mesh = new Mesh(geometry)
    randomlyPositionObject(mesh, sphereSize)

    mergedGeometry.merge(mesh.geometry, mesh.matrix)
  }

  return new Mesh(
    new BufferGeometry().fromGeometry(mergedGeometry),
    material
  )
}

export function randomlyPositionObject(object, sphereSize) {
  object.position.set(
    randomRangeWithNegative(sphereSize),
    randomRangeWithNegative(sphereSize),
    randomRangeWithNegative(sphereSize),
  )

  object.rotation.set(
    randomRangePercentage(),
    randomRangePercentage(),
    randomRangePercentage(),
  )

  const scale = randomRange(25, 500) / 100.0

  object.scale.set(
    scale, scale, scale
  )

  object.updateMatrix()
}

export function randomizeGeometryVertices(vertices, factor = 0.2) {
  return vertices.map(vertice => {
    return new Vector3(
      vertice.x + (randomRangeWithNegative(vertice.x) * factor),
      vertice.y + (randomRangeWithNegative(vertice.y) * factor),
      vertice.z + (randomRangeWithNegative(vertice.z) * factor),
    )
  })
}

export function randomizeBufferGeometryVertices(geometry, factor = 0.2) {
  const vertices = geometry.attributes.position.array

  for (let i = 0; i < vertices.length; i += 1) {
    vertices[i] = vertices[i] + (randomRangeWithNegative(vertices[i]) * factor)
  }
}
