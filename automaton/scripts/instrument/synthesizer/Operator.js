import Envelope from './Envelope'

export default class Operator {
  constructor() {
    this.envelope = new Envelope()

    this.coarse = 0.0
    this.fine = 0.0

    this.isVelocitySensitive = false

    this._output = 0.0
    this._phase = 0.0
    this._phaseIncrement = 0.0
  }

  next() {
    return this.envelope.next()
  }

  noteOn() {
    return this.envelope.noteOn()
  }

  noteOff() {
    return this.envelope.noteOff()
  }

  changeEnvelope(settings) {
    this.envelope.isLoop = settings.isLoop

    settings.segments.forEach((setting, index) => {
      this.envelope.changeSegment(index, setting)
    })
  }
}
