import {
  IcosahedronGeometry,
  Color,
  LineBasicMaterial,
  Mesh,
  MeshPhongMaterial,
  LineSegments,
  Object3D,
} from 'three'

import { randomizeGeometryVertices } from './helpers'

export default class MediumObject extends Object3D {
  constructor(factor = 0.2) {
    super()

    const material = new MeshPhongMaterial({ color: new Color(0x3c5a7a) })
    const geometry = new IcosahedronGeometry(8, 2)
    geometry.vertices = randomizeGeometryVertices(geometry.vertices, factor)

    const cube = new Mesh(geometry, material)

    this.add(cube)

    const lineGeometry = new IcosahedronGeometry(15, 0)
    lineGeometry.vertices = randomizeGeometryVertices(lineGeometry.vertices, factor)

    this.add(new LineSegments(
      geometry,
      new LineBasicMaterial({
        color: new Color(0x323a48),
      })
    ))
  }
}
