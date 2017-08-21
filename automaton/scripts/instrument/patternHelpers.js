const HOLD_NOTE_CHAR = '*'
const NOTES_CHAR = ['.', '-', '_', ':', '/']
const PAUSE_CHAR = ' '

export function stringToSequencerPattern(patternString, octave, velocity, noteMaterial) {
  const notes = patternString.toLowerCase().split('')

  if (notes.length === 0) {
    return false
  }

  let previousNote = null
  let isError = false

  const result = notes.map(noteChar => {
    let note = null
    let isHolding = false

    if (noteChar === HOLD_NOTE_CHAR) {
      if (!previousNote) {
        isError = true
        return false
      }

      note = previousNote
      isHolding = true
    } else if (noteChar === PAUSE_CHAR) {
      previousNote = null
    } else if (NOTES_CHAR.includes(noteChar)) {
      const noteNumber = NOTES_CHAR.indexOf(noteChar)
      note = noteMaterial[noteNumber] + (12 * (octave || 0))
      previousNote = note
    } else {
      isError = true
      return false
    }

    return {
      isHolding,
      note,
      velocity: note ? velocity : 0.0,
    }
  })

  if (isError) {
    return false
  }

  return result
}