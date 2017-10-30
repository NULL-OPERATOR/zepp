import settings from './settings.js'


export default class CanvasAnimation {
  constructor (menu) {
    this.menu = menu
    this.animFrameRequest = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame
    this.animFrameRequest = this.animFrameRequest.bind(window)
    this.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame
    this.cancelAnimationFrame = this.cancelAnimationFrame.bind(window)
    this.canvas = document.getElementById('canvas')
    this.canvas2d = canvas.getContext('2d')
    this.preRenderedSquares = []
    this.preRenderAllSquares()
    this.dateNow = Date.now()
    this.animReq
    this.inGame = false
    this.grid = []
    this.players = []
    this.lastPosition = []
    this.userID = 0
  }

  startAnimationRequest () {
    this.animReq = this.animFrameRequest(::this.drawCanvas)
  }

  startAnimationRequestDeadScene () {
    this.animReq = this.animFrameRequest(::this.drawDeadSquares)
  }

  stopAnimationRequest () {
    this.cancelAnimationFrame(this.animReq)
  }

  setTime () {
    this.dateNow = Date.now()
  }

  setGrid (grid) {
    this.grid = grid
  }

  setPlayers (players) {
    this.players = players
  }

  setUserID (id) {
    this.userID = id
  }

  setSizes () {
    canvas.width = window.innerWidth * window.devicePixelRatio
    canvas.height = window.innerHeight * window.devicePixelRatio
  }

  setGameStatus (bool) {
    this.inGame = bool
  }

  preRenderAllSquares () {
    for (let i = 0; i < settings.cssColours.length; i++) {
      const can2 = document.createElement('canvas')
      can2.width = settings.squareSize
      can2.height = settings.squareSize

      const ctx2 = can2.getContext('2d')
      ctx2.imageSmoothingEnabled = false
      ctx2.mozImageSmoothingEnabled = false
      ctx2.fillStyle = settings.cssColours[i]
      ctx2.fillRect(0, 0, settings.squareSize, settings.squareSize)
      this.preRenderedSquares.push(can2)
    }
  }

  drawCanvas () {
    const time = this.getTimeDiff()
    this.positionCanvas(time)
    this.drawBackground()
    this.drawGrid()
    this.drawPlayerHeads(time)

    if (this.inGame) {
      this.animReq = this.animFrameRequest(::this.drawCanvas)
    }
  }

  getTimeDiff () {
    const currentDateNow = Date.now()
    let time = (currentDateNow - this.dateNow) / 120
    if (time >= 1) {
      time = 1
    }
    return time
  }


  positionCanvas (time) {
    const headPosition = this.getUserHeadPosition(time)

    this.canvas2d.setTransform(1, 0, 0, 1, 0, 0)
    this.canvas2d.fillStyle = '#12111b'
    this.canvas2d.fillRect(0, 0, canvas.width, canvas.height)

    const i = Math.round((canvas.width / 2) - headPosition[0] * 35)
    const f = Math.round((canvas.height / 2) - headPosition[1] * 35)
    this.canvas2d.translate(i, f)
    this.lastPosition = [i, f]
  }

  getUserHeadPosition (time) {
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].id === this.userID) {
        return this.players[i].getHeadPosition(time)
      }
    }
  }

  drawBackground () {
    const xPos = (settings.gridSize - 2) * settings.squareSize
    this.canvas2d.fillStyle = '#3a3140'
    this.canvas2d.fillRect(settings.squareSize - 10, settings.squareSize - 10, xPos + 20, xPos + 20)
    this.canvas2d.fillStyle = '#1b1a1d'
    this.canvas2d.fillRect(settings.squareSize, settings.squareSize, xPos, xPos)
  }

  drawGrid () {
    for (let col = 1; col < settings.gridSize - 1; col++) {
      for (let row = 1; row < settings.gridSize - 1; row++) {
        this.drawSquare(col, row)
      }
    }
  }

  drawSquare (col, row) {
    const value = this.getGridValue(col, row)
    if (value !== 255) {
      this.canvas2d.drawImage(this.preRenderedSquares[value], col * settings.squareSize, row * settings.squareSize)
    }
  }

  getGridValue (col, row) {
    return this.grid[col][row]
  }

  drawPlayerHeads (time) {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      const pos = player.getHeadPosition(time)
      const colourValue = player.safe ? player.colour : player.colourPrimary
      const preRendered = this.preRenderedSquares[colourValue]
      this.canvas2d.drawImage(preRendered, pos[0] * settings.squareSize, pos[1] * settings.squareSize)
    }
  }

  drawDeadSquares () {
    const maxX = Math.round(canvas.width / settings.squareSize) + 2
    const maxY = Math.round(canvas.height / settings.squareSize) + 2
    const x = this.getRandomInt(0, maxX) * settings.squareSize
    const y = this.getRandomInt(0, maxY) * settings.squareSize

    const colourInt = this.getRandomInt(0, this.preRenderedSquares.length - 1)
    this.canvas2d.drawImage(this.preRenderedSquares[colourInt], x, y)

    this.startAnimationRequestDeadScene()
  }

  getRandomInt (min, max) {
    return Math.round(Math.random() * (max - min) + min)
  }

  playDeadScene () {
    setTimeout(::this.deadScene, 200)
  }

  deadScene () {
    const w = (window.innerWidth / settings.gridSize)
    const h = (window.innerHeight / settings.squareSize)
    this.canvas2d.setTransform(1, 0, 0, 1, 0, 0)
    const offx = -settings.squareSize + (this.lastPosition[0] % settings.squareSize)
    const offy = -settings.squareSize + (this.lastPosition[1] % settings.squareSize)
    this.canvas2d.translate(offx, offy)
    this.startAnimationRequestDeadScene()
    setTimeout(this.menu.show, 800)
  }

}
