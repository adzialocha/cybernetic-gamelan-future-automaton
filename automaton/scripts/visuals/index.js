import {
  Clock,
  Color,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'

import Universe from './Universe'

import PointerLockControls from './PointerLockControls'

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
      2500
    )

    // Prepare movement controller
    this.controls = new PointerLockControls(this.camera)

    // Prepare scene
    this.scene = new Scene()
    this.scene.background = new Color(0x111111)
    this.scene.fog = new Fog(0x000000, 50, 300)

    this.scene.add(this.controls.yawObject)

    // Universes
    this.universeSpheres = []
    this.universes = []
    this.currentUniverse = null

    const universe = new Universe(150.0)
    universe.position.set(0, 0, 0)
    this.universeSpheres.push(universe.sphere)
    this.universes.push(universe)

    this.universes.forEach(object => {
      this.scene.add(object)
    })

    // Prepare light scenery
    const light = new HemisphereLight(0xeeeeff, 0xffffff, 0.05)
    light.position.set(0.5, 1, 0.75)
    this.scene.add(light)

    // Raycaster for collision detection
    this.raycaster = new Raycaster(
      new Vector3(),
      new Vector3(0, -1, 0),
      0,
      10
    )

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

    this.universes.forEach(universe => {
      universe.update(this.clock)
    })

    this.raycaster.ray.origin.copy(this.controls.yawObject.position)
    const intersections = this.raycaster.intersectObjects(this.universeSpheres)

    if (intersections.length > 0) {
      const uuid = intersections[0].object.uuid

      if (uuid !== this.currentUniverse) {
        this.currentUniverse = uuid
        console.log('Entered new universe')
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  resize(width, height) {
    this.renderer.setSize(width, height)
  }
}
