import {
  Math as ThreeMath,
  Object3D,
  Vector3,
} from 'three'

const PI_2 = Math.PI / 2
const MOVE_SPEED = 200.0
const STOP_SPEED = 50.0

export default class PointerLockControls {
  constructor(camera) {
    this.enabled = true

    camera.rotation.set(0, 0, 0)

    this.pitchObject = new Object3D()
    this.pitchObject.add(camera)

    this.yawObject = new Object3D()
    this.yawObject.position.y = 10.0
    this.yawObject.add(this.pitchObject)

    this.velocity = new Vector3()

    this.directions = {
      backward: false,
      forward: false,
      left: false,
      right: false,
    }

    window.addEventListener('mousemove', (event) => {
      if (!this.enabled) {
        return
      }

      const movementX = (
        event.movementX ||
        event.mozMovementX ||
        event.webkitMovementX ||
        0
      )

      const movementY = (
        event.movementY ||
        event.mozMovementY ||
        event.webkitMovementY ||
        0
      )

      this.yawObject.rotation.y -= movementX * 0.002
      this.pitchObject.rotation.x -= movementY * 0.002
      this.pitchObject.rotation.x = Math.max(
        -PI_2,
        Math.min(
          PI_2,
          this.pitchObject.rotation.x
        )
      )
    }, false)
  }

  move(directions) {
    this.directions = Object.assign({}, this.directions, directions)
  }

  update(delta) {
    if (!this.enabled) {
      return
    }

    const { x, y, z } = this.velocity
    const { forward, backward, left, right } = this.directions

    if (forward || backward) {
      let lat = ThreeMath.radToDeg(
        this.pitchObject.rotation.x
      ) * (forward ? 1 : -1)
      lat = Math.max(-85, Math.min(85, lat))

      const phi = ThreeMath.degToRad(90 - lat)
      const theta = ThreeMath.degToRad(forward ? -90 : 90)

      this.velocity.y = y + MOVE_SPEED * Math.cos(phi) * delta
      this.velocity.z = z + MOVE_SPEED * Math.sin(phi) * Math.sin(theta) * delta
    }

    if (left) {
      this.velocity.x -= MOVE_SPEED * delta
    }

    if (right) {
      this.velocity.x += MOVE_SPEED * delta
    }

    this.velocity.x -= x * STOP_SPEED * delta
    this.velocity.y -= y * STOP_SPEED * delta
    this.velocity.z -= z * STOP_SPEED * delta

    this.yawObject.translateX(this.velocity.x * delta)
    this.yawObject.translateY(this.velocity.y * delta)
    this.yawObject.translateZ(this.velocity.z * delta)
  }
}
