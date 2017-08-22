import { Vector3 } from 'three'
import { Math as ThreeMath } from 'three'

export default class FirstPersonControls {
  constructor(camera) {
    this.camera = camera
    this.target = new Vector3(0, 0, 0)
    this.enabled = true

    this.movementSpeed = 1.0
    this.lookSpeed = 0.005

    this.mouseX = 0
    this.mouseY = 0

    this.directions = {
      forward: false,
      backward: false,
      right: false,
      left: false,
    }

    this.lat = 0
    this.lon = 0
    this.phi = 0
    this.theta = 0

    this.viewHalfX = 0
    this.viewHalfY = 0

    window.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    }, false)

    window.addEventListener('mousemove', (event) => {
      this.mouseX = event.pageX - this.viewHalfX
      this.mouseY = event.pageY - this.viewHalfY
    }, false)

    this.handleResize()
  }

  move(directions) {
    this.directions = Object.assign({}, this.directions, directions)
  }

  handleResize() {
    this.viewHalfX = window.innerWidth / 2
    this.viewHalfY = window.innerHeight / 2
  }

  update(delta) {
    if (this.enabled === false) {
      return
    }

    const { forward, backward, left, right } = this.directions
    const actualMoveSpeed = delta * this.movementSpeed

    if (forward || (this.autoForward && !backward)) {
      this.camera.translateZ(-actualMoveSpeed)
    }

    if (backward) {
      this.camera.translateZ(actualMoveSpeed)
    }

    if (left) {
      this.camera.translateX(-actualMoveSpeed)
    }

    if (right) {
      this.camera.translateX(actualMoveSpeed)
    }

    const actualLookSpeed = delta * this.lookSpeed

    this.lon += this.mouseX * actualLookSpeed
    this.lat -= this.mouseY * actualLookSpeed

    this.lat = Math.max(-85, Math.min(85, this.lat))
    this.phi = ThreeMath.degToRad(90 - this.lat)

    this.theta = ThreeMath.degToRad(this.lon)

    const position = this.camera.position

    this.target.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta)
    this.target.y = position.y + 100 * Math.cos(this.phi)
    this.target.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta)

    this.camera.lookAt(this.target)
  }
}
