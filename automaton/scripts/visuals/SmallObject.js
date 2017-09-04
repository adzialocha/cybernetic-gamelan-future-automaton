import {
  BoxGeometry,
  Color,
  LineBasicMaterial,
  Mesh,
  MeshPhongMaterial,
  LineSegments,
  Object3D,
} from 'three'

import { randomizeGeometryVertices } from './helpers'

export default class SmallObject extends Object3D {
  constructor(factor = 0.2) {
    super()

    const material = new MeshPhongMaterial({ color: new Color(0x0fbcab) })
    const geometry = new BoxGeometry(2, 2, 2)
    geometry.vertices = randomizeGeometryVertices(geometry.vertices, factor)

    const cube = new Mesh(geometry, material)

    this.add(cube)

    const lineGeometry = new BoxGeometry(15, 0)
    lineGeometry.vertices = randomizeGeometryVertices(lineGeometry.vertices, factor)

    this.add(new LineSegments(
      geometry,
      new LineBasicMaterial({
        color: new Color(0xffffff),
      })
    ))
  }
}
