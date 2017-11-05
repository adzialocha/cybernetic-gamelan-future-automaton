const MS_PER_MINUTE = 60000

const defaultOptions = {
  bpm: 120,
  onCycle: () => true,
  onTick: () => true,
  ticksPerSecond: 120,
}

function bpmToMsTicksPerSecond(bpm, duration) {
  return (MS_PER_MINUTE / bpm) * (1 / duration) * 2
}

class Sync {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.interval = null

    this.currentCycleTick = 0
    this.currentCycle = 0
  }

  tick() {
    this.options.onTick(
      this.currentCycleTick,
      this.options.ticksPerSecond
    )

    this.currentCycleTick += 1

    if (this.currentCycleTick > this.options.ticksPerSecond) {
      this.options.onCycle(this.currentCycle)

      this.currentCycleTick = 0
      this.currentCycle += 1
    }
  }

  start() {
    const frequency = bpmToMsTicksPerSecond(
      this.options.bpm,
      this.options.ticksPerSecond
    )

    setInterval(() => {
      this.tick()
    }, frequency)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
}

module.exports = Sync
