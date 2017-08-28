export default class Channel {
  constructor(audioInterface, synthesizer, note) {
    this.isPlaying = false
    this.note = note
    this.synthesizer = synthesizer
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
