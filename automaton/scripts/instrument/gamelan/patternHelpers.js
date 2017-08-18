const DURATIONS = {
  '.': 16,
  '_': 8,
  '-': 4,
  '/': 2,
  '#': 1,
}

const MINUTE_IN_MS = 60000
const PAUSE_SYMBOL = '*'

function bpmToMs(bpm, duration) {
  return (MINUTE_IN_MS / bpm) * (1 / duration) * 4
}

export function symbolsToPattern(notePattern, durationPattern, settings, noteMaterial) {
  if (notePattern.length !== durationPattern.length) {
    throw new Error('Notes and duration string need the same length')
  }

  const { octave, bpm, velocity } = settings
  const notes = notePattern.split('')
  const durations = durationPattern.split('')

  return notes.map((noteSymbol, index) => {
    const durationSymbol = durations[index]

    if (!Object.keys(DURATIONS).includes(durationSymbol)) {
      throw new Error('Unknown duration symbol')
    }

    const duration = bpmToMs(bpm, DURATIONS[durationSymbol])
    let note = null

    if (noteSymbol !== PAUSE_SYMBOL) {
      const noteNumber = parseInt(noteSymbol, 10)

      if (
        isNaN(noteNumber) ||
        noteNumber < 1 ||
        noteNumber > noteMaterial.length
      ) {
        throw new Error('Unknown note symbol')
      }

      note = noteMaterial[noteNumber - 1] + (12 * octave)
    }

    return {
      note,
      duration,
      velocity,
    }
  })
}
