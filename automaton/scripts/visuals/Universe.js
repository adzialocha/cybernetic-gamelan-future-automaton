import {
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PointLight,
  Vector3,
  SphereBufferGeometry,
} from 'three'

import deepAssign from 'deep-assign'

import Landscape from './Landscape'

import {
  mergeRandomlyPlacedObjects,
  randomizeBufferGeometryVertices,
  randomlyPositionObject,
  randomRangePercentage,
  randomRange,
} from './helpers'

import { getColor } from './colors'

const defaultOptions = {
  collections: [],
  landscapes: [],
  lightsColor: 'WHITE',
  lightsCount: 5,
  lightsDistance: 200.0,
  lightsSpeed: 3,
  lightsStrength: 0.8,
  sphereColor: 'CREAM',
  sphereFactor: 0.2,
  sphereSegments: 32,
  sphereSize: 150.0,
}

function drawGeometryLines(geometry, color) {
  return new LineSegments(
    geometry,
    new LineBasicMaterial({
      color,
    })
  )
}

export default class Universe extends Object3D {
  constructor(options) {
    super()

    this.options = deepAssign({}, defaultOptions, options)

    // Main sphere
    const geometry = new SphereBufferGeometry(
      this.options.sphereSize,
      this.options.sphereSegments,
      this.options.sphereSegments
    )
    randomizeBufferGeometryVertices(geometry, this.options.sphereFactor)

    const material = new MeshPhongMaterial({
      color: getColor(this.options.sphereColor),
      side: DoubleSide,
    })

    this.sphere = new Mesh(geometry, material)
    this.add(this.sphere)

    // Add lights to scenery
    this.lights = []
    this.lightsAngle = []
    this.lightsRadius = []

    for (let i = 0; i < this.options.lightsCount; i += 1) {
      const light = new PointLight(
        getColor(this.options.lightsColor),
        this.options.lightsStrength,
        this.options.lightsDistance,
        2
      )

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

    // Add objects to scenery
    this.options.collections.forEach(collection => {
      const mesh = mergeRandomlyPlacedObjects(
        collection.count,
        getGeometry(collection.geometry, collection.attributes),
        new MeshPhongMaterial({
          color: getColor(collection.meshColor),
          specular: getColor(collection.meshSpecular),
          wireframes: collection.hasWireframes,
        }),
        this.options.sphereSize,
        collection.factor
      )

      this.add(mesh)

      if (collection.hasLines) {
        this.add(
          drawGeometryLines(
            mesh.geometry,
            getColor(collection.lineColor)
          )
        )
      }
    })

    // Add landscapes to scenery
    this.options.landscapes.forEach(landscape => {
      const { size, segments, fn } = landscape

      const mesh = drawGeometryLines(
        new Landscape({
          fn,
          segments,
          size,
        }),
        getColor(landscape.color)
      )

      mesh.position.set(
        landscape.position.x,
        landscape.position.y,
        landscape.position.z,
      )

      mesh.rotation.set(
        landscape.rotation.x,
        landscape.rotation.y,
        landscape.rotation.z,
      )

      this.add(mesh)
    })
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
