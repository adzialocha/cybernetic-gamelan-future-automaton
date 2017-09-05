import {
  PlaneBufferGeometry,
} from 'three'

export default class Landscape extends PlaneBufferGeometry {
  constructor() {
    super(180, 180, 50, 50)

    const vertices = this.attributes.position.array

    for (let i = 0, j = 0, l = vertices.length; i < l; i += 1, j += 3) {
      vertices[j + 2] = (i / 1000) * Math.sin(i) * 10.0
    }
  }
}
