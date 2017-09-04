import {
  Color,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PointLight,
  SphereGeometry,
} from 'three'

import Landscape from './Landscape'
import MediumObject from './MediumObject'
import SmallObject from './SmallObject'

import { randomRange, randomizeGeometryVertices } from './helpers'

export default class Universe extends Object3D {
  constructor(size = 150.0) {
    super()

    // Main sphere
    const geometry = new SphereGeometry(size, 32, 32)
    geometry.vertices = randomizeGeometryVertices(geometry.vertices, 0.2)

    const material = new MeshPhongMaterial({
      color: 0xf8eed8,
      side: DoubleSide,
    })

    this.sphere = new Mesh(geometry, material)
    this.add(this.sphere)

    // Center light
    this.lights = []
    for (let i = 0; i < 5; i += 1) {
      const light = new PointLight(new Color(0xffffff), 1, 200.0, 2)

      light.position.set(
        Math.random() * size,
        Math.random() * size,
        Math.random() * size
      )

      this.add(light)
      this.lights.push(light)
    }

    // Place small objects
    for (let i = 0; i < 1000; i += 1) {
      const object = new SmallObject(Math.random())
      object.position.set(
        randomRange(size),
        randomRange(size),
        randomRange(size),
      )

      this.add(object)
    }

    // Place medium objects
    for (let i = 0; i < 500; i += 1) {
      const object = new MediumObject(Math.random())
      object.position.set(
        randomRange(size),
        randomRange(size),
        randomRange(size),
      )

      this.add(object)
    }

    // Place landscape
    const landscape = new Landscape()
    this.add(landscape)
  }

  update(clock) {
    const time = clock.elapsedTime / 3

    this.lights.forEach(light => {
      light.position.x = Math.sin(time * 0.7) * 30
      light.position.y = Math.cos(time * 0.5) * 40
      light.position.z = Math.cos(time * 0.3) * 30
    })
  }
}
