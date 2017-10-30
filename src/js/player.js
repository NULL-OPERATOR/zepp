import settings from './settings.js'

export default class Player {
  constructor (data) {
    this.id = data.id
    this.x = data.x
    this.y = data.y
    this.colour = data.colour
    this.colourPrimary = data.colourPrimary
    this.nextXspeed = data.nextXspeed
    this.nextYspeed = data.nextYspeed
    this.safe = true
    this.xspeed = 1
    this.yspeed = 0
    this.dead = false
  }

  updateDirection (x, y) {
    this.nextXspeed = x
    this.nextYspeed = y
  }

  updatePosition () {
    this.xspeed = this.nextXspeed
    this.yspeed = this.nextYspeed
    var x = this.xspeed + this.x
    var y = this.yspeed + this.y
    if ((x >= settings.gridSize || x < 0) || (y >= settings.gridSize || y < 0)) {
      this.dead = true
    } else {
      this.x = x
      this.y = y
    }
  }

  getHeadPosition (time) {
    var posX = this.x - this.xspeed + (this.xspeed * time)
    var posY = this.y - this.yspeed + (this.yspeed * time)
    return [posX, posY]
  }
}
