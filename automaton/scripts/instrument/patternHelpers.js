const HOLD_NOTE_CHAR = '*'
const NOTES_CHAR = ['.', '-', '_', ':', '/']
const PAUSE_CHAR = ' '

const BPM_UP = '>'
const BPM_DOWN = '<'

const MAX_BPM_LEVEL = 1
const MIN_BPM_LEVEL = -3

const OCTAVE_UP = '^'
const OCTAVE_DOWN = '°'

const MAX_OCTAVE_LEVEL = 1
const MIN_OCTAVE_LEVEL = -1

function stringToSequencerPattern(patternString, octave = 0, velocity, noteMaterial) {
  const notes = patternString.toLowerCase().split('')

  if (notes.length === 0) {
    return []
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
      note = noteMaterial[noteNumber] * Math.pow(2, octave)
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

function countCharInString(string, char) {
  const regex = new RegExp('\\' + char, 'g')
  return (string.match(regex) || []).length
}

function extractBpmLevel(string) {
  const up = countCharInString(string, BPM_UP)
  const down = countCharInString(string, BPM_DOWN)

  return up - down
}

function extractOctaveLevel(string) {
  const up = countCharInString(string, OCTAVE_UP)
  const down = countCharInString(string, OCTAVE_DOWN)

  return up - down
}

export function convertString(string, velocity, noteMaterial) {
  const bpmLevel = extractBpmLevel(string)

  if (bpmLevel > MAX_BPM_LEVEL || bpmLevel < MIN_BPM_LEVEL) {
    return false
  }

  const octaveLevel = extractOctaveLevel(string)

  if (octaveLevel > MAX_OCTAVE_LEVEL || octaveLevel < MIN_OCTAVE_LEVEL) {
    return false
  }

  const pattern = stringToSequencerPattern(
    string.replace(/(<|>|\^|°)/g, ''),
    octaveLevel,
    velocity,
    noteMaterial
  )

  if (!pattern) {
    return false
  }

  return {
    bpmLevel,
    octaveLevel,
    pattern,
  }
}
