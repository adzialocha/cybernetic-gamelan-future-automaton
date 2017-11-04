function stringToSequencerPattern(settings, patternString, octave = 0, velocity, noteMaterial) {
  const notes = patternString.toLowerCase().split('')
  const pureNotes = notes.filter(note => note !== settings.holdNoteChar)

  if (pureNotes.length === 0) {
    return []
  }

  let isError = false
  let position = 0

  const { holdNoteChar, pauseChar, notesChar } = settings

  const result = notes.reduce((acc, noteChar, noteIndex) => {
    let frequency = null

    const succeedingNoteChar = (
      noteIndex < notes.length ? notes[noteIndex + 1] : null
    )

    // Does note appear with a succeeding holding symbol?
    const isHolding = (succeedingNoteChar === holdNoteChar)

    if (noteChar === holdNoteChar || noteChar === pauseChar) {
      // Multiple hold note chars or holded pause are invalid
      if (succeedingNoteChar && isHolding) {
        isError = true
      }
    } else if (notesChar.includes(noteChar)) {
      const noteNumber = notesChar.indexOf(noteChar)
      frequency = noteMaterial[noteNumber] * Math.pow(2, octave)
    } else {
      isError = true
    }

    // Add note or pause to pattern
    if (!isError && (noteChar !== holdNoteChar)) {
      acc.push({
        frequency,
        isHolding,
        position: position / pureNotes.length,
        velocity: frequency ? velocity : 0.0,
      })

      // Increase position in cycle
      position += 1
    }

    return acc
  }, [])

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

export function positionToTickIndex(position, tickTotalCount) {
  return Math.floor(position * tickTotalCount)
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
