import {
  BoxGeometry,
  ConeGeometry,
  DoubleSide,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Object3D,
  ParametricGeometry,
  PointLight,
  SphereBufferGeometry,
  TorusKnotGeometry,
  Vector3,
} from 'three'

import deepAssign from 'deep-assign'

import Landscape from './Landscape'

import { mobius3d } from './parametricGeometries'

import {
  mergeRandomlyPlacedObjects,
  randomizeBufferGeometryVertices,
  randomlyPositionObject,
  randomRangePercentage,
  randomRange,
} from './helpers'

import { getColor } from './colors'

function drawGeometryLines(geometry, color) {
  return new LineSegments(
    geometry,
    new LineBasicMaterial({
      color,
    })
  )
}

function getGeometry(name, attributes) {
  switch (name) {
  case 'BoxGeometry':
    return new BoxGeometry(...attributes)
  case 'IcosahedronGeometry':
    return new IcosahedronGeometry(...attributes)
  case 'TorusKnotGeometry':
    return new TorusKnotGeometry(...attributes)
  case 'ParametricGeometry':
    return new ParametricGeometry(mobius3d, ...attributes)
  case 'ConeGeometry':
    return new ConeGeometry(...attributes)
  }

  return null
}

export default class Universe extends Object3D {
  constructor(options) {
    super()

    const defaultOptions = {
      collections: [],
      landscapes: [],
      lightsColor: 'WHITE',
      lightsCount: 5,
      lightsDistance: 200.0,
      lightsSpeed: 3,
      lightsStrength: 1.0,
      sphereColor: 'CREAM',
      sphereFactor: 0.2,
      sphereHasWireframes: false,
      sphereSegments: 32,
      sphereSize: 150.0,
    }

    this.options = deepAssign({}, defaultOptions, options)

    // Main sphere
    const geometry = new SphereBufferGeometry(
      this.options.sphereSize,
      this.options.sphereSegments,
      this.options.sphereSegments
    )
    randomizeBufferGeometryVertices(geometry, this.options.sphereFactor)

    const material = new MeshLambertMaterial({
      color: getColor(this.options.sphereColor),
      side: DoubleSide,
      wireframe: this.options.sphereHasWireframes,
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
      let meshMaterial

      if (collection.material === 'phong') {
        meshMaterial = new MeshPhongMaterial({
          color: getColor(collection.meshColor),
          specular: getColor(collection.meshSpecular),
          wireframe: collection.hasWireframes,
        })
      } else {
        meshMaterial = new MeshBasicMaterial({
          color: getColor(collection.meshColor),
          wireframe: collection.hasWireframes,
        })
      }

      const mesh = mergeRandomlyPlacedObjects(
        collection.count,
        getGeometry(collection.geometry, collection.attributes),
        meshMaterial,
        this.options.sphereSize,
        collection.factor
      )

      this.add(mesh)

      if (collection.hasLines) {
        this.add(
          drawGeometryLines(
            mesh.geometry,
            getColor(collection.linesColor)
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
