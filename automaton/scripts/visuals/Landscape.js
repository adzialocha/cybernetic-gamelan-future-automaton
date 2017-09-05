import {
  PlaneBufferGeometry,
} from 'three'

import math from 'mathjs'

const defaultOptions = {
  size: 180,
  segments: 50,
  fn: '(i / 1000) * sin(i) * 10.0',
}

export default class Landscape extends PlaneBufferGeometry {
  constructor(customOptions) {
    const options = Object.assign({}, defaultOptions, customOptions)

    super(
      options.size,
      options.size,
      options.segments,
      options.segments
    )

    const vertices = this.attributes.position.array

    for (let i = 0, j = 0, l = vertices.length; i < l; i += 1, j += 3) {
      vertices[j + 2] = math.eval(this.options.fn, { i })
    }
  }
}
