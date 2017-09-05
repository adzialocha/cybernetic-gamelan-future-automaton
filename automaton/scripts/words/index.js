import database from './database.json'

const DEFAULT_WORDS_COUNT = 5

export default class Words {
  constructor() {
    this.reset()
  }

  reset() {
    this.words = database
  }

  suggest(count = DEFAULT_WORDS_COUNT) {
    const words = []

    for (let i = 0; i < count; i += 1) {
      const index = Math.floor(Math.random() * this.words.length)
      words.push(this.words[index])
      this.words.splice(index, 1)
    }

    return words
  }
}
