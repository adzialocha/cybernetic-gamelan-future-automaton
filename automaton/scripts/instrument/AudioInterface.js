const INITIAL_VOLUME = 0.5

export default class AudioInterface {
  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext

    // Create audio context
    this.context = new AudioContext()

    const { currentTime } = this.context

    // Compressor
    this.compressorNode = this.context.createDynamicsCompressor()
    this.compressorNode.threshold.setValueAtTime(-5, currentTime)
    this.compressorNode.knee.setValueAtTime(10, currentTime)
    this.compressorNode.ratio.setValueAtTime(20, currentTime)
    this.compressorNode.attack.setValueAtTime(0, currentTime)
    this.compressorNode.release.setValueAtTime(0.25, currentTime)

    // Gain
    this.gainNode = this.context.createGain()
    this.changeVolume(INITIAL_VOLUME)

    // Connect nodes
    this.compressorNode.connect(this.gainNode)
    this.gainNode.connect(this.context.destination)
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
