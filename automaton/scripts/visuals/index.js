import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'

const defaultOptions = {
  canvas: null,
  devicePixelRatio: 0,
  initialHeight: 0,
  initialWidth: 0,
}

export default class Visuals {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.renderer = new WebGLRenderer({
      canvas: this.options.canvas,
    })

    this.scene = new Scene()

    this.camera = new PerspectiveCamera(
      75,
      this.options.initialWidth / this.options.initialHeight,
      0.1,
      1000
    )

    this.renderer.setSize(this.options.initialWidth, this.options.initialHeight)
    this.renderer.setPixelRatio(this.options.devicePixelRatio)

    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0x00ff00 })

    this.cube = new Mesh(geometry, material)

    this.scene.add(this.cube)

    this.camera.position.z = 5

    this.animate()
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate()
    })

    this.cube.rotation.x += 0.01
    this.cube.rotation.y += 0.01

    this.renderer.render(this.scene, this.camera)
  }

  resize(width, height) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }
}
