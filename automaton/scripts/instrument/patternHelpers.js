function stringToSequencerPattern(settings, patternString, octave = 0, velocity, noteMaterial) {
  const notes = patternString.toLowerCase().split('')

  if (notes.length === 0) {
    return []
  }

  let previousFrequency = null
  let isError = false

  const result = notes.map((noteChar, noteIndex) => {
    let isHolding = false
    let frequency = null

    if (noteChar === settings.holdNoteChar) {
      if (!previousFrequency) {
        isError = true
        return false
      }

      frequency = previousFrequency
      isHolding = true
    } else if (noteChar === settings.pauseChar) {
      previousFrequency = null
    } else if (settings.notesChar.includes(noteChar)) {
      const noteNumber = settings.notesChar.indexOf(noteChar)
      frequency = noteMaterial[noteNumber] * Math.pow(2, octave)
      previousFrequency = frequency
    } else {
      isError = true
      return false
    }

    return {
      frequency,
      isHolding,
      position: noteIndex / notes.length,
      velocity: frequency ? velocity : 0.0,
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
