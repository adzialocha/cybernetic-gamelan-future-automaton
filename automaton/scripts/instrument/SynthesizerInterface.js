import AudioInterface from './AudioInterface'
import Channel from './Channel'
import Synthesizer from './synthesizer'

const DEFAULT_NOTE = 72
const DEFAULT_VELOCITY = 1.0

const CHANNELS_COUNT = 30
const BUFFER_SIZE = 1024

const DEFAULT_PRESET = {
  name: 'DEFAULT',
  algorithmId: 0,
  coarse: [0, 0, 0, 0],
  feedback: 0,
  fine: [0, 0, 0, 0],
  isLoop: [false, false, false, false],
  isVelocitySensitive: [false, false, false, false],
  envelopes: [
    [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
    [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
    [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
    [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
  ],
}

export default class SynthesizerInterface {
  constructor() {
    this.audio = new AudioInterface()
    this.channels = []

    // Create all channels
    for (let i = 0; i < CHANNELS_COUNT; i += 1) {
      // Create FM synthesizer
      const synthesizer = new Synthesizer({
        preset: DEFAULT_PRESET,
        sampleRate: this.audio.context.sampleRate,
      })

      // Create a channel for audio
      const channel = new Channel(this.audio, synthesizer)
      this.channels.push(channel)
    }

    const { context, compressorNode } = this.audio
    const scriptProcessorNode = context.createScriptProcessor(BUFFER_SIZE, 1, 1)

    // Connect audio nodes
    scriptProcessorNode.connect(compressorNode)

    // Start FM synthesis
    scriptProcessorNode.onaudioprocess = event => {
      const buffer = new Float32Array(BUFFER_SIZE)

      this.channels.forEach(channel => {
        if (channel.isPlaying) {
          channel.synthesizer.generateAudio(buffer)
        }
      })

      event.outputBuffer.copyToChannel(buffer, 0, 0)
    }
  }

  changePreset(preset) {
    this.channels.forEach(channel => {
      channel.synthesizer.changePreset(preset)
    })
  }

  noteOn(note = DEFAULT_NOTE, velocity = DEFAULT_VELOCITY) {
    // Find free channel
    const selectedChannel = this.channels.find(channel => {
      return !channel.isPlaying
    })

    if (!selectedChannel) {
      throw new Error('Channels count is too small')
    }

    // Play the note
    selectedChannel.noteOn(note, velocity)
  }

  noteOff(note = DEFAULT_NOTE) {
    const selectedChannel = this.channels.find(channel => {
      return channel.note === note
    })

    if (!selectedChannel) {
      throw new Error('Could not find that note')
    }

    selectedChannel.noteOff()
  }

  allNotesOff() {
    this.channels.forEach(channel => {
      if (channel.note) {
        this.noteOff(channel.note)
      }
    })
  }
}
