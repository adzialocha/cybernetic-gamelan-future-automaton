export function calculatePhaseIncrement(frequency, sampleRate) {
  return 2 * Math.PI * frequency / sampleRate
}

export function calculateRatioFrequency(coarse, fine) {
  let ratio = Math.ceil(coarse * 13)

  if (ratio === 0) {
    ratio = 0.5
  }

  ratio += (fine >= 1.0) ? 0.99 : fine

  return ratio
}

export function convertOperatorSettings(setting, sampleRate) {
  const { algorithmId, feedback } = setting
  const totalTime = 15 * sampleRate
  const operators = []

  for (let i = 0; i < 4; i += 1) {
    const envelope = {
      isLoop: setting.isLoop[i],
    }

    envelope.segments = setting.envelopes[i].map((segment, index) => {
      let length
      let step

      if (index === 0) {
        // Attack
        length = Math.pow(segment.x, 2) * totalTime

        if (length === 0) {
          length = 1
        }

        step = (1.0 - segment.y) / length
      } else if (index === 1) {
        // Decay
        const previousSegment = setting.envelopes[i][0]
        length = Math.pow(segment.x - previousSegment.x, 2) * totalTime

        if (length === 0) {
          length = 1
        }

        step = -1 * (segment.y - previousSegment.y) / length
      } else if (index === 2) {
        // Release
        length = Math.pow(1.0 - segment.x, 2) * totalTime

        if (length === 0) {
          length = 1
        }

        step = -1 * (1.0 - segment.y) / length
      }

      return {
        length,
        step,
      }
    })

    operators.push({
      isVelocitySensitive: setting.isVelocitySensitive[i],
      coarse: setting.coarse[i],
      fine: setting.fine[i],
      envelope,
    })
  }

  return {
    algorithmId,
    feedback,
    operators,
  }
}
