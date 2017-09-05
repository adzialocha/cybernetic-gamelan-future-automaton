import {
  DoubleSide,
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PointLight,
  Vector3,
  SphereBufferGeometry,
  IcosahedronGeometry,
} from 'three'

import Landscape from './Landscape'

import {
  mergeRandomlyPlacedObjects,
  randomizeBufferGeometryVertices,
  randomlyPositionObject,
  randomRangePercentage,
  drawGeometryLines,
  randomRange,
} from './helpers'

import {
  CREAM,
  DARK_BLUE,
  DARKER_BLUE,
  GREEN,
  LIGHT_GRAY,
  WHITE,
} from './colors'

const defaultOptions = {
  lightsCount: 5,
  lightsSpeed: 3,
  lightsStrength: 200.0,
  sphereColor: CREAM,
  sphereSize: 150.0,
}

export default class Universe extends Object3D {
  constructor(options) {
    super()

    this.options = Object.assign({}, defaultOptions, options)

    // Main sphere
    const geometry = new SphereBufferGeometry(this.options.sphereSize, 32, 32)
    randomizeBufferGeometryVertices(geometry, 0.2)

    const material = new MeshPhongMaterial({
      color: this.options.sphereColor,
      side: DoubleSide,
    })

    this.sphere = new Mesh(geometry, material)
    this.add(this.sphere)

    // Add lights to scenery
    this.lights = []
    this.lightsAngle = []
    this.lightsRadius = []

    for (let i = 0; i < this.options.lightsCount; i += 1) {
      const light = new PointLight(WHITE, 0.8, this.options.lightsStrength, 2)
      randomlyPositionObject(light, this.options.sphereSize)

      this.lightsAngle.push(
        new Vector3(
          randomRangePercentage(0.3, 0.8),
          randomRangePercentage(0.3, 0.8),
          randomRangePercentage(0.3, 0.8)
        )
      )

      const radius = randomRange(10, this.options.sphereSize / 2)
      this.lightsRadius.push(new Vector3(radius, radius + 10, radius - 10))

      this.lights.push(light)
    }

    this.lights.forEach(light => {
      this.add(light)
    })

    const smallObjects = mergeRandomlyPlacedObjects(
      1000,
      new BoxGeometry(2, 2, 2),
      new MeshPhongMaterial({
        color: GREEN,
        specular: WHITE,
      }),
      this.options.sphereSize,
      0.8
    )

    this.add(smallObjects)
    this.add(drawGeometryLines(smallObjects.geometry, WHITE))

    const mediumObjects = mergeRandomlyPlacedObjects(
      350,
      new IcosahedronGeometry(8, 2),
      new MeshPhongMaterial({
        color: DARK_BLUE,
        specular: DARKER_BLUE,
      }),
      this.options.sphereSize,
    )

    this.add(mediumObjects)
    this.add(drawGeometryLines(mediumObjects.geometry, DARKER_BLUE))

    // Place landscape
    const landscape = new Landscape()
    this.add(drawGeometryLines(landscape, LIGHT_GRAY))
  }

  update(clock) {
    const time = clock.elapsedTime / this.options.lightsSpeed

    this.lights.forEach((light, index) => {
      const angle = this.lightsAngle[index]
      const radius = this.lightsRadius[index]

      light.position.x = Math.sin(time * angle.x) * radius.x
      light.position.y = Math.cos(time * angle.y) * radius.y
      light.position.z = Math.cos(time * angle.z) * radius.z
    })
  }
}
