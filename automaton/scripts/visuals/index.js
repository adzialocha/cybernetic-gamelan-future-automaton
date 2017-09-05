import {
  Clock,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'

import Stats from 'stats.js'

import PointerLockControls from './PointerLockControls'
import Universe from './Universe'

import { WHITE, DARK_GRAY } from './colors'

import galaxy from './galaxy.json'

const HEMISPHERE_LIGHT_INTENSITY = 0.08
const FOG_FAR_DISTANCE = 500

const defaultOptions = {
  canvas: null,
  devicePixelRatio: 0,
  initialHeight: 0,
  initialWidth: 0,
  isDebugMode: false,
  onUniverseEntered: () => {},
}

export default class Visuals {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.isEnabled = false
    this.clock = new Clock()

    if (this.options.isDebugMode) {
      this.stats = new Stats()
      this.stats.showPanel(0)
      document.body.appendChild(this.stats.dom)
    }

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
      20000
    )

    // Prepare scene
    this.scene = new Scene()
    this.scene.background = DARK_GRAY
    // this.scene.fog = new Fog(DARK_GRAY, 0, FOG_FAR_DISTANCE)

    // Prepare movement controller
    this.controls = new PointerLockControls(
      this.camera,
      this.options.isDebugMode
    )

    this.scene.add(this.controls.yawObject)

    // Generate universes from galaxy file
    this.currentUniverse = null

    this.universes = []
    this.universeSpheres = []

    galaxy.forEach(setting => {
      const universe = new Universe(setting)

      universe.position.set(
        setting.position.x,
        setting.position.y,
        setting.position.z
      )

      this.universeSpheres.push(universe.sphere)
      this.universes.push(universe)

      this.scene.add(universe)
    })

    // Prepare light scenery
    const light = new HemisphereLight(WHITE, WHITE, HEMISPHERE_LIGHT_INTENSITY)
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

  animate() {
    if (this.options.isDebugMode) {
      this.stats.begin()
    }

    if (this.isEnabled) {
      // Update controls
      this.controls.update(this.clock.getDelta())

      // Update universes
      this.universes.forEach(universe => {
        universe.update(this.clock)
      })

      // Check for intersections
      this.raycaster.ray.origin.copy(this.controls.yawObject.position)

      const intersections = this.raycaster.intersectObjects(
        this.universeSpheres
      )

      if (intersections.length > 0) {
        const uuid = intersections[0].object.uuid

        if (uuid !== this.currentUniverse) {
          this.currentUniverse = uuid
          this.options.onUniverseEntered(uuid)
        }
      }

      // Renderer loop
      this.renderer.render(this.scene, this.camera)
    }

    if (this.options.isDebugMode) {
      this.stats.end()
    }

    requestAnimationFrame(() => {
      this.animate()
    })
  }

  resize(width, height) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }
}
