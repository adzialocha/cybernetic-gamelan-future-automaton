import {
  Clock,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'

import mergeOptions from 'merge-options'
import Stats from 'stats.js'

import PointerLockControls from './PointerLockControls'
import Universe from './Universe'

import { getColor } from './colors'

const FOG_FAR_DISTANCE = 800
const HEMISPHERE_LIGHT_INTENSITY = 0.08
const POINT_LIGHT_DISTANCE = 500

const defaultOptions = {
  canvas: null,
  devicePixelRatio: 0,
  galaxy: [],
  initialHeight: 0,
  initialWidth: 0,
  isDebugMode: false,
  isEnabled: true,
  onDistancesUpdated: () => {},
}

export default class Visuals {
  constructor(options) {
    this.options = mergeOptions({}, defaultOptions, options)

    if (!this.options.isEnabled) {
      return
    }

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
    this.scene.background = getColor('DARK_GRAY')
    this.scene.fog = new Fog(getColor('DARK_GRAY'), 0, FOG_FAR_DISTANCE)

    // Prepare movement controller
    this.controls = new PointerLockControls(
      this.camera,
      this.options.isDebugMode
    )

    this.scene.add(this.controls.yawObject)

    // Generate universes from galaxy file
    this.currentUniverse = null

    this.universes = []

    // Prepare light scenery
    const hemisphereLight = new HemisphereLight(
      getColor('WHITE'),
      getColor('WHITE'),
      HEMISPHERE_LIGHT_INTENSITY
    )

    const pointLight = new PointLight(
      getColor('WHITE'),
      0.8,
      POINT_LIGHT_DISTANCE,
      2
    )

    this.scene.add(pointLight)
    this.scene.add(hemisphereLight)

    // Start animation
    this.animate()
  }

  createUniverses() {
    this.options.galaxy.forEach(setting => {
      const universe = new Universe(setting)

      universe.position.set(
        setting.position.x,
        setting.position.y,
        setting.position.z
      )

      this.universes.push(universe)
      this.scene.add(universe)
    })
  }

  animate() {
    if (this.options.isDebugMode) {
      this.stats.begin()
    }

    if (this.isEnabled) {
      // Update controls
      this.controls.update(this.clock.getDelta())

      // Update universes and get distances
      const distances = this.universes.reduce((acc, universe) => {
        universe.update(this.clock)

        const { uuid } = universe
        const controlsPosition = this.controls.yawObject.getWorldPosition()

        const distance = controlsPosition.distanceTo(
          universe.getWorldPosition()
        )

        acc.push({
          distance: Math.round(distance),
          sphereSize: universe.options.sphereSize,
          uuid,
        })

        return acc
      }, [])

      this.options.onDistancesUpdated(distances)

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

  reset() {
    this.controls.yawObject.position.set(0, 0, 0)
  }
}
