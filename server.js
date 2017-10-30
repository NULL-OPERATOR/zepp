'use strict'

function Player () {
  this.id = 0
  this.x = 12
  this.y = 12
  this.colour = 0
  this.colourPrimary = 1
  this.safe = true
  this.xspeed = 1
  this.yspeed = 0
  this.nextXspeed = 1
  this.nextYspeed = 0
  this.dead = false
  this.socketId = ''
}

function listen () {
  var s = server.address()
  var host = s.address
  var port = s.port
  console.log('listening at http://' + host + ':' + port)
}

// server

var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

server.listen(port, function () {
  console.log('Server listening at port %d', port)
})

app.use(express.static(path.join(__dirname, 'build')))


// game

// // movement codes
var codes = [38, 40, 37, 39]
// var UP_ARROW = 38
// var DOWN_ARROW = 40
// var RIGHT_ARROW = 37
// var LEFT_ARROW = 39

var movementCodeConversion = {
  38: [0, -1],
  40: [0, 1],
  37: [-1, 0],
  39: [1, 0]
}

var speed = 120
var squareSize = 35
var gridSize = 64
var tick = 0

var updates = {'moves': [], 'new': [], 'del': []}
var grid = []
var players = []
var deadPlayers = []
var availableIds = [1, 2, 3, 4, 5, 6, 7, 8, 9]
// for (var i = 0; i <= 30; i++) { availableIds.push(i) }
var directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]
var baseCoordinates = [ [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1] ]
var skins = {'a': [0, 1], 'b': [2, 3]}

function setup() {
  setupGrid()
  setInterval(ticker, speed)
}

function getSpeed (code) {
  return movementCodeConversion[code]
}

// todo : refactor and setup game rooms properly
function ticker() {
  updatePlayers()
  removeDeadPlayers()
  // 0 = moves, 1 = new, 2 = del
  var data = {}
  if (updates.moves.length) {
    data[0] = updates.moves
  }
  if (updates.moves.length) {
    data[1] = updates.new
  }
  if (updates.del.length) {
    data[2] = updates.del
  }
  // var concatUpdates = {0: updates.moves, 1: updates.new, 2: updates.del}
  if (Object.keys(data).length === 0 && data.constructor === Object) {
    io.to('game_room').emit(0)
  } else {
    io.to('game_room').emit(0, data)
  }
  resetUpdates()
}

function removeDeadPlayers() {
  var toRemove = []
  for (var i = 0; i < players.length; i++) {
    var p = players[i]
    if (p.dead) {
      removePlayerFromGrid(p)
      toRemove.push(i)
      updates.del.push(p.id)
      availableIds.push(p.id)
    }
  }

  for (var i = 0; i < toRemove.length; i++) {
    players.splice(toRemove[i], 1)
  }
}

function resetUpdates() {
  updates = {
    'moves': [],
    'new': [],
    'del': []
  }
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min)
}

function updatePlayers() {
  for (var i = 0; i < players.length; i++) {
    checkDirectionChanged(players[i])
    movePlayer(players[i])
  }
}

function checkDirectionChanged(p) {
  if (p.xspeed !== p.nextXspeed || p.yspeed !== p.nextYspeed) {
    updates.moves.push([p.id, p.nextXspeed, p.nextYspeed])
  }
}

function getPlayerByColour(colour) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].colour === colour) {
      return players[i]
    }
  }
}

////////////////////
// check grid positioning
// todo: refactor back out
function movePlayer(p) {
  if (!p.dead) {
    var previousX = p.x
    var previousY = p.y
    p.xspeed = p.nextXspeed
    p.yspeed = p.nextYspeed
    p.x = p.xspeed + p.x
    p.y = p.yspeed + p.y
    // grid has a boundry of 1 tile
    if ((p.x >= gridSize - 1 || p.x < 1) || (p.y >= gridSize - 1 || p.y < 1)) {
      p.dead = true
    } else {
      // move player //
      var newPosition = grid[p.x][p.y]
      if (newPosition !== 255 && newPosition % 2 === 1 && newPosition !== p.colour) {
        var p2 = getPlayerByColour(newPosition)
        if (p2 !== undefined) {
          p2.dead = true
          console.log(p.id, 'killed', p2.id)
        }
      }

      if (newPosition != p.colourPrimary && p.safe) {
        p.safe = false
      } else if (newPosition != p.colourPrimary && !p.safe) {
        grid[previousX][previousY] = p.colour
      } else if (newPosition == p.colourPrimary && !p.safe) {
        grid[previousX][previousY] = p.colour
        grid[p.x][p.y] = p.colour
        captureTailArea(p.colour, p.colourPrimary)
        captureArea(p.colour, p.colourPrimary)
        p.safe = true
      }
    }
  }
}

function captureTailArea(colour, primary) {
  for (var col = 0; col < gridSize; col++) {
    for (var row = 0; row < gridSize; row++) {
      if (grid[col][row] == colour) {
        grid[col][row] = primary
      }
    }
  }
}

function captureArea(colour, colourPrimary) {
  var grid2 = copyGrid()
  findCapturedArea(grid2, colourPrimary)
  fillCapturedArea(grid2, colourPrimary)
}

function copyGrid() {
  var newGrid = []
  for (var col = 0; col < gridSize; col++) {
    newGrid[col] = []
    for (var row = 0; row < gridSize; row++) {
      newGrid[col][row] = grid[col][row]
    }
  }
  return newGrid
}

function findCapturedArea(grid2, colour) {
  function addNode(x, y) {
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      nodes.push([x, y])
    }
  }

  var nodes = [
    [0, 0]
  ]
  while (nodes.length) {
    var node = nodes.pop()
    var x = node[0]
    var y = node[1]
    var value = grid2[x][y]

    if (value !== colour) {
      grid2[x][y] = colour
      addNode(x - 1, y)
      addNode(x + 1, y)
      addNode(x, y - 1)
      addNode(x, y + 1)
    }
  }
}

function fillCapturedArea(grid2, colour) {
  for (var col = 0; col < gridSize; col++) {
    for (var row = 0; row < gridSize; row++) {
      if (grid2[col][row] !== colour) {
        grid[col][row] = colour
      }
    }
  }
}

function removePlayerFromGrid(p) {
  for (var col = 0; col < gridSize; col++) {
    for (var row = 0; row < gridSize; row++) {
      if (grid[col][row] === p.colour || grid[col][row] === p.colourPrimary) {
        grid[col][row] = 255
      }
      if (grid[col][row] === null) {
        console.log('wtf null')
        grid[col][row] = 255
      }
    }
  }
}

function setupGrid() {
  for (var col = 0; col < gridSize; col++) {
    grid[col] = []
    for (var row = 0; row < gridSize; row++) {
      grid[col][row] = 255
    }
  }
}

function getPlayerByID(id) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }
}

function addStartingArea(p) {
  for (var i = 0; i < baseCoordinates.length; i++) {
    var x2 = baseCoordinates[i][0]
    var y2 = baseCoordinates[i][1]
    grid[p.x + x2][p.y + y2] = p.colourPrimary
  }
}

function getRandomID() {
  var i = getRandomInt(0, availableIds.length - 1)
  var id = availableIds[i]
  availableIds.splice(i, 1)
  return id
}

function setupNewPlayer() {
  var player = new Player()
  player.id = getRandomID()
  player.colourPrimary = (player.id * 2)
  player.colour = (player.id * 2) + 1
  return player
}

function setupExistingPlayer(player, socketID) {
  var randomDirection = randomElement(directions)
  player.socketId = socketID
  player.x = getRandomInt(10, 30)
  player.y = getRandomInt(10, 30)
  player.nextXspeed = randomDirection[0]
  player.nextYspeed = randomDirection[1]
  player.dead = false
  player.safe = true
}

function socketEmitSetup(player, socket) {
  var setupData = {
    'player': player,
    'grid': grid,
    'players': players
  }
  socket.emit('setup', setupData)
}

function socketOnPlayerMove(player, inGame, data) {
  if (inGame && data) {
    if (!player.dead && codes.includes(data[1])) {
      var speed = getSpeed(data[1])
      player.nextXspeed = speed[0]
      player.nextYspeed = speed[1]
    }
  }
}



io.on('connection', function(socket) {
  var ip = socket.handshake.headers["x-real-ip"];
  var inGame = false
  var player = setupNewPlayer()

  function disconnectPlayer() {
    inGame = false
    socket.leave('game_room')
    removePlayerFromGrid(player)
    // todo: update the pool
  }

  socket.on('join_room', function() {
    socket.join('game_room')
    setupExistingPlayer(player, socket.id)
    addStartingArea(player)
    socketEmitSetup(player, socket)
    updates.new.push(player)
    players.push(player)
    inGame = true
  })

  socket.on('playerMove', function(data) {
    socketOnPlayerMove(player, inGame, data)
  })

  socket.on('leave_room', function() {
    disconnectPlayer()
  })

  socket.on('disconnect', function() {
    disconnectPlayer()
  })
})

setup()
