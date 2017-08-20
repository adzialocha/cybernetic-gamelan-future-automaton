const HOLD_NOTE_CHAR = '-'
const PAUSE_CHAR = '.'

export function convertPattern(pattern, settings, noteMaterial) {
  const { octave, velocity } = settings
  const notes = pattern.toLowerCase().replace(/\s/g, '').split('')

  if (notes.length === 0) {
    throw new Error('Pattern is empty')
  }

  let previousNote = null

  return notes.map(noteChar => {
    let note = null
    let isHolding = false

    if (noteChar === HOLD_NOTE_CHAR) {
      if (!previousNote) {
        throw new Error('Invalid syntax for holding note')
      }

      note = previousNote
      isHolding = true
    } else if (noteChar === PAUSE_CHAR) {
      previousNote = null
    } else {
      const noteNumber = parseInt(noteChar, 10)

      if (
        isNaN(noteNumber) ||
        noteNumber < 1 ||
        noteNumber > noteMaterial.length
      ) {
        throw new Error('Unknown note symbol')
      }

      note = noteMaterial[noteNumber - 1] + (12 * (octave || 0))
      previousNote = note
    }

    return {
      isHolding,
      note,
      velocity: note ? velocity : 0.0,
    }
  })
}
