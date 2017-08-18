import AudioInterface from './AudioInterface'
import Channel from './Channel'
import Synthesizer from './synthesizer'

const DEFAULT_NOTE = 72
const DEFAULT_VELOCITY = 0.5

export default class Instrument {
  constructor(options = {}) {
    this.audio = new AudioInterface()
    this.channels = []
    this.preset = options.preset
  }

  changePreset(preset) {
    this.preset = preset
  }

  noteOn(note = DEFAULT_NOTE, velocity = DEFAULT_VELOCITY) {
    // Create FM synthesizer
    const synthesizer = new Synthesizer({
      preset: this.preset,
      sampleRate: this.audio.context.sampleRate,
    })

    // Create a channel for audio
    const channel = new Channel(this.audio, synthesizer, note)
    this.channels.push(channel)

    // Play the note
    synthesizer.noteOn(note, velocity)
  }

  noteOff(note = DEFAULT_NOTE) {
    const index = this.channels.findIndex(channel => {
      return channel.note === note
    })
    const channel = this.channels[index]

    channel.note = undefined
    channel.synthesizer.noteOff()
      .then(() => {
        channel.scriptProcessorNode.disconnect()
        this.channels.splice(index, 1)
      })
  }
}
