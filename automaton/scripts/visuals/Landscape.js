import {
  Color,
  LineBasicMaterial,
  LineSegments,
  Object3D,
  PlaneBufferGeometry,
} from 'three'

export default class Landscape extends Object3D {
  constructor() {
    super()

    const geometry = new PlaneBufferGeometry(
      180,
      180,
      50,
      50
    )

    const vertices = geometry.attributes.position.array

    for (let i = 0, j = 0, l = vertices.length; i < l; i += 1, j += 3) {
      vertices[j + 2] = (i / 1000) * Math.sin(i) * 10.0
    }

    const mesh = new LineSegments(
      geometry,
      new LineBasicMaterial({
        color: new Color(0x999999),
      })
    )

    this.add(mesh)
  }
}
