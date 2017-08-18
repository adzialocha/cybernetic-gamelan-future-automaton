export default class Channel {
  constructor(audioInterface, synthesizer, note) {
    const { context, gainNode } = audioInterface

    this.synthesizer = synthesizer
    this.scriptProcessorNode = context.createScriptProcessor()
    this.note = note

    const bufferSourceNode = context.createBufferSource()
    bufferSourceNode.start(0)

    // Connect audio nodes
    bufferSourceNode.connect(this.scriptProcessorNode)
    this.scriptProcessorNode.connect(gainNode)

    // Start FM synthesis
    this.scriptProcessorNode.onaudioprocess = (event) => {
      const left = event.outputBuffer.getChannelData(0)
      const right = event.outputBuffer.getChannelData(1)

      this.synthesizer.generateAudio(left, right)
    }
  }
}
