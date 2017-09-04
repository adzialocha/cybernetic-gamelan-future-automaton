export function randomRange(max) {
  let num = Math.floor(Math.random() * max)
  num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1

  return num
}

export function randomizeGeometryVertices(vertices, factor = 0.2) {
  return vertices.map(vertice => {
    return {
      x: vertice.x + (randomRange(vertice.x) * factor),
      y: vertice.y + (randomRange(vertice.y) * factor),
      z: vertice.z + (randomRange(vertice.z) * factor),
    }
  })
}
