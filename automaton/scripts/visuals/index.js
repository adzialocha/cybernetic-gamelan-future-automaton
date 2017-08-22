import {
  Clock,
  Color,
  Face3,
  Fog,
  Geometry,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'

import FirstPersonControls from './FirstPersonControls'
import { ConvexGeometry } from './ConvexGeometry'

const defaultOptions = {
  canvas: null,
  devicePixelRatio: 0,
  initialHeight: 0,
  initialWidth: 0,
}

export default class Visuals {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.clock = new Clock()

    // Prepare renderer
    this.renderer = new WebGLRenderer({
      canvas: this.options.canvas,
    })

    this.renderer.setSize(
      this.options.initialWidth,
      this.options.initialHeight
    )
    this.renderer.setPixelRatio(this.options.devicePixelRatio)

    // Prepare camera
    this.camera = new PerspectiveCamera(
      75,
      this.options.initialWidth / this.options.initialHeight,
      1,
      10000
    )

    // Prepare movement controller
    this.controls = new FirstPersonControls(this.camera)
    this.controls.movementSpeed = 10
    this.controls.lookSpeed = 0.2

    // Prepare scene
    this.scene = new Scene()
    this.scene.background = new Color(0x111111)
    this.scene.fog = new Fog(0x000000, 0, 750)

    // Prepare test objects
    const generateRandomPoints = (min = 0.1, max = 1.0, num = 10) => {
      const points = []

      for (let i = 0; i <= num; i += 1) {
        const x = Math.floor(Math.random() * (max - min + 1)) + min
        const y = Math.floor(Math.random() * (max - min + 1)) + min
        const z = Math.floor(Math.random() * (max - min + 1)) + min

        points.push(new Vector3(x, y, z))
      }

      return points
    }

    const generateRandomObject = (lineColor, meshColor, size = 50.0, complexity = 50) => {
      const geometry = new ConvexGeometry(generateRandomPoints(0.1, size, complexity))

      geometry.computeVertexNormals()
      geometry.computeMorphNormals()

      const material = new MeshPhongMaterial({
        color: meshColor,
        morphTargets: true,
        morphNormals: true,
      })

      const mesh = new Mesh(geometry, material)

      mesh.add(new LineSegments(
        geometry,
        new LineBasicMaterial({
          color: lineColor,
        })
      ))

      this.scene.add(mesh)

      mesh.position.x = Math.random() * 15 * size
      mesh.position.y = Math.random() * 15 * size
      mesh.position.z = Math.random() * 15 * size
    }

    for (let i = 0; i < 100; i += 1) {
      generateRandomObject(
        new Color(0x000000),
        new Color(0xffe68c),
        50.0,
      )

      generateRandomObject(
        new Color(0xffffff),
        new Color(0x4c8da6),
        1.0,
        10
      )

      generateRandomObject(
        new Color(0x4c8da6),
        new Color(0xd8c571),
        25.0,
        10
      )
    }

    // Prepare light scenery
    const light = new HemisphereLight(0xeeeeff, 0x777788, 0.75)
    light.position.set(0.5, 1, 0.75)
    this.scene.add(light)

    // Start animation
    this.animate()
  }

  move(directions) {
    this.controls.move(directions)
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate()
    })

    this.controls.update(this.clock.getDelta())
    this.renderer.render(this.scene, this.camera)
  }

  resize(width, height) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.controls.handleResize()

    this.renderer.setSize(width, height)
  }
}
