// import impulseUrl from '../../assets/impulse.wav'

// function getImpulse(context) {
//   return new Promise((resolve, reject) => {
//     const ajaxRequest = new XMLHttpRequest()
//     ajaxRequest.open('GET', impulseUrl, true)
//     ajaxRequest.responseType = 'arraybuffer'

//     ajaxRequest.onload = () => {
//       const impulseData = ajaxRequest.response
//       context.decodeAudioData(impulseData, buffer => {
//         resolve(buffer)
//       }, (err) => {
//         reject(err)
//       })
//     }

//     ajaxRequest.send()
//   })
// }

const INITIAL_VOLUME = 0.5

export default class AudioInterface {
  constructor() {
    // Create audio context
    this.context = new AudioContext()

    // Reverb
    // this.convolverNode = this.context.createConvolver()
    // this.convolverNode.loop = true
    // this.convolverNode.normalize = true

    // getImpulse(this.context)
    //   .then(buffer => {
    //     this.convolverNode.buffer = buffer
    //   })

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
    // this.convolverNode.connect(this.gainNode)
    this.gainNode.connect(this.context.destination)
  }

  changeVolume(volume, isRememberingValue = true) {
    this.gainNode.gain.setValueAtTime(volume, this.context.currentTime)

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
