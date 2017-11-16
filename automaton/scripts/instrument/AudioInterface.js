const INITIAL_VOLUME = 0.5

export default class AudioInterface {
  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext

    // Create audio context
    this.context = new AudioContext()

    const { currentTime } = this.context

    // Compressor
    this.compressorNode = this.context.createDynamicsCompressor()
    this.compressorNode.threshold.setValueAtTime(-80, currentTime)
    this.compressorNode.knee.setValueAtTime(40, currentTime)
    this.compressorNode.ratio.setValueAtTime(20, currentTime)
    this.compressorNode.attack.setValueAtTime(0, currentTime)
    this.compressorNode.release.setValueAtTime(1, currentTime)

    // EQs
    this.biquadFilterNode = this.context.createBiquadFilter()
    this.biquadFilterNode.type = 'highshelf'
    this.biquadFilterNode.frequency.setValueAtTime(2500, currentTime)

    this.biquadFilterMainNode = this.context.createBiquadFilter()
    this.biquadFilterMainNode.type = 'highshelf'
    this.biquadFilterMainNode.frequency.setValueAtTime(15000, currentTime)
    this.biquadFilterMainNode.gain.setValueAtTime(-1, currentTime)

    // Gain
    this.gainNode = this.context.createGain()
    this.changeVolume(INITIAL_VOLUME)

    // Connect nodes
    this.compressorNode.connect(this.biquadFilterMainNode)
    this.biquadFilterMainNode.connect(this.biquadFilterNode)
    this.biquadFilterNode.connect(this.gainNode)
    this.gainNode.connect(this.context.destination)
  }

  changeFilter(value) {
    this.biquadFilterNode.gain.setValueAtTime(value, this.context.currentTime)
  }

  changeVolume(volume, isRememberingValue = true, duration = 0) {
    this.gainNode.gain.cancelScheduledValues(this.context.currentTime)

    if (duration === 0) {
      this.gainNode.gain.setValueAtTime(volume, this.context.currentTime)
    } else {
      this.gainNode.gain.linearRampToValueAtTime(
        volume,
        this.context.currentTime + duration
      )
    }

    if (isRememberingValue) {
      this.currentVolume = volume
    }
  }

  mute() {
    this.changeVolume(0, false)
  }

  unmute() {
    this.changeVolume(this.currentVolume)
  }
}
