import AudioInterface from './AudioInterface'
import Channel from './Channel'
import Synthesizer from './synthesizer'

import { PRESETS } from './presets'

const DEFAULT_NOTE = 72
const DEFAULT_VELOCITY = 1.0

const CHANNELS_COUNT = 20
const BUFFER_SIZE = 1024

export default class SynthesizerInterface {
  constructor() {
    this.audio = new AudioInterface()
    this.channels = []

    // Create all channels
    for (let i = 0; i < CHANNELS_COUNT; i += 1) {
      // Create FM synthesizer
      const synthesizer = new Synthesizer({
        preset: PRESETS.BELL,
        sampleRate: this.audio.context.sampleRate,
      })

      // Create a channel for audio
      const channel = new Channel(this.audio, synthesizer)
      this.channels.push(channel)
    }

    const { context, gainNode } = this.audio
    const scriptProcessorNode = context.createScriptProcessor(BUFFER_SIZE, 1, 1)

    // Connect audio nodes
    scriptProcessorNode.connect(gainNode)

    // Start FM synthesis
    scriptProcessorNode.onaudioprocess = (event) => {
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
