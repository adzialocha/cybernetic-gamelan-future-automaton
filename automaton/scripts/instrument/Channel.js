const BUFFER_SIZE = 1024

export default class Channel {
  constructor(audioInterface, synthesizer, note) {
    this.audioInterface = audioInterface
    this.isRunning = false
    this.note = note
    this.scriptProcessorNode = null
    this.synthesizer = synthesizer
  }

  start() {
    if (this.isRunning) {
      throw new Error('Channel was already started')
    }

    const { context, compressorNode } = this.audioInterface
    this.scriptProcessorNode = context.createScriptProcessor(BUFFER_SIZE, 1, 2)

    const bufferSourceNode = context.createBufferSource()
    bufferSourceNode.start(0)

    // Connect audio nodes
    bufferSourceNode.connect(this.scriptProcessorNode)
    this.scriptProcessorNode.connect(compressorNode)

    // Start FM synthesis
    this.scriptProcessorNode.onaudioprocess = (event) => {
      const left = event.outputBuffer.getChannelData(0)
      const right = event.outputBuffer.getChannelData(1)

      this.synthesizer.generateAudio(left, right)
    }

    this.isRunning = true
  }

  stop() {
    if (!this.isRunning) {
      throw new Error('Channel was already stopped')
    }

    this.scriptProcessorNode.disconnect()
    this.isRunning = false
  }
}
