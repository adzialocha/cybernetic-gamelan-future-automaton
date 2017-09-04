import {
  BoxGeometry,
  Clock,
  Color,
  Fog,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'

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
      1000
    )

    // Prepare movement controller
    this.controls = new PointerLockControls(this.camera)

    // Prepare scene
    this.scene = new Scene()
    this.scene.background = new Color(0xff1111)
    this.scene.fog = new Fog(0x000000, 0, 750)

    this.scene.add(this.controls.yawObject)

    // Test object
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new Mesh(geometry, material)
    this.scene.add(cube)

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
    this.renderer.setSize(width, height)
  }
}
