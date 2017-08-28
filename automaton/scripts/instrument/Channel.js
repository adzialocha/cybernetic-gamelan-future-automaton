const BUFFER_SIZE = 2048

export default class Channel {
  constructor(audioInterface, synthesizer, note) {
    this.isPlaying = false
    this.note = note
    this.synthesizer = synthesizer

    const { context, compressorNode } = audioInterface
    const scriptProcessorNode = context.createScriptProcessor(BUFFER_SIZE, 1, 1)

    const bufferSourceNode = context.createBufferSource()
    bufferSourceNode.start(0)

    // Connect audio nodes
    bufferSourceNode.connect(scriptProcessorNode)
    scriptProcessorNode.connect(compressorNode)

    // Start FM synthesis
    scriptProcessorNode.onaudioprocess = (event) => {
      this.synthesizer.generateAudio(event.outputBuffer.getChannelData(0))
    }
  }

  noteOn(note, velocity) {
    if (this.isPlaying) {
      throw new Error('Channel was already started')
    }

    this.isPlaying = true
    this.note = note
    this.synthesizer.noteOn(note, velocity)
  }

  noteOff() {
    if (!this.isPlaying) {
      throw new Error('Channel was already stopped')
    }

    this.note = null

    this.synthesizer.noteOff()
      .then(() => {
        this.isPlaying = false
      })
  }
}
