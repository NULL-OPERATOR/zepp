import settings from './settings.js'

export default class Leaderboard {
  constructor () {
    this.totalArea = (settings.gridSize - 1) * (settings.gridSize - 1)
    this.lastTime = Date.now()
    this.scores = []
    this.setupScores()
  }

  setupScores () {
    for (var i = 1; i <= 5; i++) {
      this.scores.push(document.getElementById('scores-' + i))
    }
  }

  update (newValues) {
    if (Date.now() - this.lastTime > 800) {
      this.lastTime = Date.now()
      this.updateScoreValues(newValues)
    }
  }

  updateScoreValues (newValues) {
    for (var i = 0; i < 5; i++) {
      const score = this.scores[i]
      if (i < newValues.length) {
        this.showScore(score, newValues[i])
      } else {
        this.hideScore(score)
      }
    }
  }

  showScore (score, newValue) {
    var width = Math.round((200 / this.totalArea) * newValue[1])
    score.style.display = ''
    score.style.width = width + 'px'
    score.style['background-color'] = settings.cssColours[newValue[0]]
  }

  hideScore (score) {
    score.style.display = 'none'
  }

}
