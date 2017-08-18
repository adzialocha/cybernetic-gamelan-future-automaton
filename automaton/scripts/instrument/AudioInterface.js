export default class AudioInterface {
  constructor() {
    // Create audio context
    this.context = new AudioContext()

    // Prepare output
    this.compressorNode = this.context.createDynamicsCompressor()

    this.currentVolume = 1
    this.gainNode = this.context.createGain()
    this.gainNode.gain.value = this.currentVolume

    this.compressorNode.connect(this.gainNode)
    this.gainNode.connect(this.context.destination)
  }

  changeVolume(volume) {
    this.gainNode.gain.value = volume
    this.currentVolume = volume
  }

  mute() {
    this.gainNode.gain.value = 0
  }

  unmute() {
    this.gainNode.gain.value = this.currentVolume
  }
}
