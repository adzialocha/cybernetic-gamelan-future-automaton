const ENVELOPE_STATES = {
  STOP: 0,
  ATTACK: 1,
  DECAY: 2,
  SUSTAIN: 3,
  RELEASE: 4,
  DUMP: 5,
}

import EnvelopeSegment from './EnvelopeSegment'

export default class Envelope {
  constructor() {
    this.state = ENVELOPE_STATES.STOP

    this.amp = 0.0
    this.isLoop = false

    this.segments = []

    this.currentSegmentPosition = 0
    this.currentSegmentStep = 0.0

    this.onRelease = () => true

    for (let i = 0; i < 4; i += 1) {
      this.segments.push(new EnvelopeSegment())
    }
  }

  next() {
    if (this.currentSegmentPosition <= 0) {
      return
    }

    this.amp += this.currentSegmentStep
    if (this.amp > 1.0) {
      this.amp = 1.0
    }

    this.currentSegmentPosition -= 1

    if (this.currentSegmentPosition <= 0) {
      return
    }

    switch (this.state) {
    case ENVELOPE_STATES.DUMP:
      this.state = ENVELOPE_STATES.ATTACK
      this.currentSegmentStep = this.segments[0].step
      this.currentSegmentPosition = this.segments[0].length
      this.amp = 0.0
      break
    case ENVELOPE_STATES.ATTACK:
      this.state = ENVELOPE_STATES.DECAY
      this.currentSegmentStep = this.segments[1].step
      this.currentSegmentPosition = this.segments[1].length
      break
    case ENVELOPE_STATES.DECAY:
      if (!this.isLoop) {
        this.state = ENVELOPE_STATES.SUSTAIN
        this.currentSegmentStep = 0.0
        this.currentSegmentPosition = 0
      } else {
        this.state = ENVELOPE_STATES.ATTACK
        this.currentSegmentStep = this.segments[0].step
        this.currentSegmentPosition = this.segments[0].length
        this.amp = 0.0
      }
      break
    case ENVELOPE_STATES.RELEASE:
      this.state = ENVELOPE_STATES.STOP
      this.amp = 0.0
      if (this.onRelease) {
        this.onRelease()
      }
      break
    }
  }

  noteOn() {
    if (this.state !== ENVELOPE_STATES.STOP) {
      this.state = ENVELOPE_STATES.DUMP
      this.currentSegmentStep = -1 * this.amp / this.currentSegmentPosition
      this.currentSegmentPosition = 128
    } else {
      this.state = ENVELOPE_STATES.ATTACK
      this.currentSegmentStep = this.segments[0].step
      this.currentSegmentPosition = this.segments[0].length
      this.amp = 0.0
    }
  }

  noteOff() {
    if (this.state !== ENVELOPE_STATES.STOP) {
      this.state = ENVELOPE_STATES.RELEASE
      this.currentSegmentStep = -1 * this.amp / this.segments[2].step
      this.currentSegmentPosition = this.segments[2].length
    }
  }

  changeSegment(index, setting) {
    if (index < 0 || index > this.segments.length - 1) {
      throw new Error('Invalid segment index')
    }

    this.segments[index].length = setting.length
    this.segments[index].step = setting.step
  }
}
