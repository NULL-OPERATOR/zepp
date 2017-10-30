import settings from './settings.js'

export default class InputMoves {
  constructor(socket) {
    this.socket = socket
    this.lastCode = 0
    this.userID = 0
    this.inGame = false
    this.touchMoves = {
      touchstart: {},
      touchmove: {}
    }
    this.setup()
  }

  setup() {
    window.addEventListener('keydown', :: this.keyPressed, {passive: false})
    window.addEventListener('touchstart', :: this.setTouchMove, {passive: false})
    window.addEventListener('touchmove', :: this.setTouchMove, {passive: false})
    window.addEventListener('touchend', :: this.setTouchEnd, {passive: false})
  }

  setGameStatus(bool) {
    this.inGame = bool
  }

  setUserID(id) {
    this.userID = id
  }

  keyPressed(event) {
    if (event && this.inGame) {
      event.preventDefault()
      this.emitMove(event.keyCode)
    }
  }

  emitMove(code) {
    if (code !== this.lastCode) {
      this.lastCode = code
      this.socket.emit('playerMove', [this.userID, code])
    }
  }

  setTouchMove(event) {
    if (event && this.inGame && (event.touches && event.touches.length)) {
      event.preventDefault()
      touchMoves[event.type].x = event.touches[0].pageX
      touchMoves[event.type].y = event.touches[0].pageY
    }
  }

  setTouchEnd(event) {
    if (event && this.inGame) {
      event.preventDefault()
      var x = touchMoves.touchmove.x - touchMoves.touchstart.x
      var y = touchMoves.touchmove.y - touchMoves.touchstart.y
      var code = getCode(x, y)
      this.emitMove(code)
    }
  }

  getCode(x, y) {
    if (Math.abs(x) > Math.abs(y)) {
      return x > 0 ? settings.left : settings.right
    } else {
      return y > 0 ? settings.down : settings.up
    }
  }

}
