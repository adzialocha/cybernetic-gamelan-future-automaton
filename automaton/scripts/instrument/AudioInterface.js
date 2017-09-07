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

    // Compressor
    this.compressorNode = this.context.createDynamicsCompressor()
    this.compressorNode.threshold.value = -5
    this.compressorNode.knee.value = 10
    this.compressorNode.ratio.value = 20
    this.compressorNode.attack.value = 0
    this.compressorNode.release.value = 0.25

    // Gain
    this.currentVolume = 0.5
    this.gainNode = this.context.createGain()
    this.gainNode.gain.value = this.currentVolume

    // Connect nodes
    this.compressorNode.connect(this.gainNode)
    // this.convolverNode.connect(this.gainNode)
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
