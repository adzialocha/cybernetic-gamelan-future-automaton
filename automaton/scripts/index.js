import styles from '../styles/index.scss' // eslint-disable-line no-unused-vars

import Instrument from './instrument'
import { PRESETS } from './instrument/presets'

const noteMaterial = [
  62,
  65,
  70,
  72,
  74,
]

const notePattern = '11*2*13*1*5*4*3*4*12'

const durationPatterns = [
  '--//--..##....//../.',
  '--//.-_..._/../_--_-',
  '-_-_//--..#..../../.',
  '--__-..._-__#//---_/',
]

const octaves = [
  0,
  0,
  -1,
  1,
]

const presets = [
  PRESETS.BELL,
  PRESETS.GUITAR,
  PRESETS.CHIME,
  PRESETS.BELL,
]

const bpm = 20

for (let i = 0; i < 4; i += 1) {
  const instrument = new Instrument({
    preset: presets[i],
    noteMaterial,
  })

  instrument.changePattern(
    notePattern,
    durationPatterns[i],
    bpm,
    0.2,
    octaves[i]
  )
  instrument.start()
}

// For testing only
window.automatonDebug = {
  changePattern: (notePattern, durationPattern, bpm, velocity, octave) => {
    instrument.changePattern(notePattern, durationPattern, bpm, velocity, octave)
  },
  start: () => {
    instrument.start()
  },
  stop: () => {
    instrument.stop()
  },
  noteOn: (note, velocity) => {
    instrument.synthesizerInterface.noteOn(note, velocity)
  },
  noteOff: (note) => {
    instrument.synthesizerInterface.noteOff(note)
  },
}
