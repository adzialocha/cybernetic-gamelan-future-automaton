import AudioInterface from './AudioInterface'
import Channel from './Channel'
import Synthesizer from './synthesizer'

const DEFAULT_NOTE = 72
const DEFAULT_VELOCITY = 1.0

export default class SynthesizerInterface {
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
    channel.start()
    this.channels.push(channel)

    // Play the note
    synthesizer.noteOn(note, velocity)
  }

  noteOff(note = DEFAULT_NOTE) {
    const index = this.channels.findIndex(channel => {
      return channel.note === note
    })

    if (index === -1) {
      throw new Error('Could not find that note')
    }

    const removedChannel = this.channels[index]

    removedChannel.note = null

    removedChannel.synthesizer.noteOff()
      .then(() => {
        removedChannel.stop()

        this.channels.splice(
          this.channels.findIndex(channel => {
            return channel === removedChannel
          }), 1
        )
      })
  }

  allNotesOff() {
    this.channels.forEach(channel => {
      if (channel.note) {
        this.noteOff(channel.note)
      }
    })
  }
}
