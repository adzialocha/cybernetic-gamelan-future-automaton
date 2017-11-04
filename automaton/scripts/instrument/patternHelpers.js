function stringToSequencerPattern(settings, patternString, octave = 0, velocity, noteMaterial) {
  const notes = patternString.toLowerCase().split('')

  if (notes.length === 0) {
    return []
  }

  let previousNote = null
  let isError = false

  const result = notes.map(noteChar => {
    let note = null
    let isHolding = false

    if (noteChar === settings.holdNoteChar) {
      if (!previousNote) {
        isError = true
        return false
      }

      note = previousNote
      isHolding = true
    } else if (noteChar === settings.pauseChar) {
      previousNote = null
    } else if (settings.notesChar.includes(noteChar)) {
      const noteNumber = settings.notesChar.indexOf(noteChar)
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

function extractBpmLevel(string, upCount, downCount) {
  const up = countCharInString(string, upCount)
  const down = countCharInString(string, downCount)

  return up - down
}

function extractOctaveLevel(string, upCount, downCount) {
  const up = countCharInString(string, upCount)
  const down = countCharInString(string, downCount)

  return up - down
}

export function convertString(settings, string, velocity, noteMaterial) {
  const bpmLevel = extractBpmLevel(
    string,
    settings.bpmUp,
    settings.bpmDown,
  )

  if (
    bpmLevel > settings.maxBpmLevel ||
    bpmLevel < settings.minBpmLevel
  ) {
    return false
  }

  const octaveLevel = extractOctaveLevel(
    string,
    settings.octaveUp,
    settings.octaveDown,
  )

  if (
    octaveLevel > settings.maxOctaveLevel ||
    octaveLevel < settings.minOctaveLevel
  ) {
    return false
  }

  const removeChars = [
    settings.bpmDown,
    settings.bpmUp,
    settings.octaveDown,
    settings.octaveUp,
  ]

  let cleanedString = string

  removeChars.forEach(char => {
    cleanedString = cleanedString.replace(new RegExp('\\' + char, 'g'), '')
  })

  if (cleanedString.length > settings.maxNotesCount) {
    return false
  }

  const pattern = stringToSequencerPattern(
    settings,
    cleanedString,
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
