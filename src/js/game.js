'use strict'
import CanvasAnimation from './canvasAnimation.js'
import Leaderboard from './leaderboard.js'
import InputMoves from './inputMoves.js'
import Player from './player.js'
import Board from './board.js'
import Menu from './menu.js'

import settings from './settings.js'
import appState from './store.js'

// move socket
export default class Game {
  constructor () {
    this.socket = io({ reconnect: false })
    this.startButton = document.getElementById('startButton')
    this.startMenu = document.getElementById('startMenu')
    this.menu = new Menu(startButton, startMenu)
    this.leaderboard = new Leaderboard()
    this.canvasAnimation = new CanvasAnimation(this.menu)
    this.inputMoves = new InputMoves(this.socket)
    this.board
    this.player
    this.players = []
    this.userID = 0
    this.inGame = false
    this.setup()
  }

  setup () {
    window.onresize = this.canvasAnimation.setSizes
    this.canvasAnimation.setSizes()
    this.startButton.onclick = ::this.startButtonClick
    this.socket.on('setup', ::this.socketSetup)
  }

  startButtonClick () {
    this.canvasAnimation.stopAnimationRequest()
    this.menu.hide()
    this.joinRoom()
    this.socket.on(0, ::this.socketTick)
  }

  joinRoom () {
    const data = {'skin': 'a'}
    this.setGameStatus(true)
    this.socket.emit('join_room', data)
  }

  setGameStatus (bool) {
    this.inGame = bool
    this.inputMoves.setGameStatus(bool)
    this.canvasAnimation.setGameStatus(bool)
  }

  socketSetup (data) {
    this.userID = data.player.id
    const player = new Player(data.player)
    this.inputMoves.setUserID(this.userID)
    this.menu.setButtonColour(settings.cssColours[data.player.colour], settings.cssColours[data.player.colourPrimary])
    this.players = [player]
    this.board = new Board(data.grid, settings.gridSize)
    this.addExistingPlayers(data.players)
    this.canvasAnimation.setGrid(this.board.grid)
    this.canvasAnimation.setPlayers(this.players)
    this.canvasAnimation.setUserID(this.userID)
    this.canvasAnimation.startAnimationRequest()
  }

  socketTick (data) {
    if (this.inGame) {
      let isDead = false
      if (data && data[2]) {
        isDead = data[2].includes(this.userID)
      }
      if (isDead) {
        this.playerDied()
      } else if (this.inGame && this.board !== undefined) {
        this.updateGame(data)
      }
    }
  }

  playerDied () {
    this.socket.emit('leave_room')
    this.canvasAnimation.stopAnimationRequest()
    this.canvasAnimation.playDeadScene()
    this.setGameStatus(false)
  }

  updateGame (data) {
    if (data) {
      data[1] && this.addNewPlayers(data[1])
      data[0] && this.updateMoves(data[0])
      data[2] && this.removePlayers(data[2])
    }
    this.movePlayers()
    this.leaderboard.update(this.board.getScores())
    this.canvasAnimation.setGrid(this.board.grid)
    this.canvasAnimation.setPlayers(this.players)
    this.canvasAnimation.setTime()
  }


  addNewPlayers (newPlayers) {
    for(let newPlayer of newPlayers) {
    // for (let i = 0; i < newPlayers.length; i++) {
      if (newPlayer.id !== this.userID) {
        const player = new Player(newPlayer)
        this.board.addStartingArea(player.x, player.y, player.colourPrimary)
        this.players.push(player)
      }
    }
  }

  addExistingPlayers (newPlayers) {
    for (let i = 0; i < newPlayers.length; i++) {
      if (newPlayers[i].id !== this.userID) {
        const player = new Player(newPlayers[i])
        this.players.push(player)
      }
    }
  }

  removePlayers (idsToBeRemoved) {
    const playersToBeRemoved = this.findPlayersToBeRemoved(idsToBeRemoved)
    this.board.removePlayers(playersToBeRemoved)
    this.removePlayersFromCurrentList(playersToBeRemoved)
  }

  removePlayersFromCurrentList(toRemove) {
    for (let i = 0; i < toRemove.length; i++) {
      this.players.splice(toRemove[i], 1)
    }
  }

  findPlayersToBeRemoved (idsToBeRemoved) {
    let toRemove = []
    for (let i = 0; i < this.players.length; i++) {
      if (idsToBeRemoved.includes(this.players[i].id)) {
        toRemove.push(i)
      }
    }
    return toRemove
  }

  removePlayersFromBoard (playersToBeRemoved) {
    for (let i = 0; i < this.players.length; i++) {
      board.removePlayer(this.players[i].colour, this.players[i].colourPrimary)
    }
  }

  updateMoves (moves) {
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i]
      const player = this.getPlayerByID(move[0])
      player.updateDirection(move[1], move[2])
    }
  }

  getPlayerByID (id) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === id) {
        return this.players[i]
      }
    }
  }

  movePlayers () {
    for (let i = 0; i < this.players.length; i++) {
      this.movePlayer(this.players[i])
    }
  }

  movePlayer (player) {
    const oldX = player.x
    const oldY = player.y
    player.updatePosition()
    const newPosition = this.board.getPosition(player.x, player.y)
    if (newPosition !== player.colourPrimary && player.safe) {
      player.safe = false
    } else if (newPosition !== player.colourPrimary && !player.safe) {
      this.board.setPosition(oldX, oldY, player.colour)
    } else if (newPosition == player.colourPrimary && !player.safe) {
      this.board.setPosition(oldX, oldY, player.colour)
      this.board.setPosition(player.x, player.y, player.colour)
      this.board.capture(player.colour, player.colourPrimary)
      player.safe = true
    }
  }

}
