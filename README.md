# zepp :alien:

to make an .io game

note: this is not nearly finished, and not nearly tested either: view at your own risk


#### todos
- leaderboard -
- death screen
- test everything properly
- e2e
- update readme with descriptions of major features etc
- webpack for node
- error checking
- catch websocket connection failures
- update loops with map/filter/reduce
- refactor & rewrite server
- setup game rooms properly
- multiple servers / CoreOS & Docker
- Jenkins & Docker / other CI
- Server setup automation
- select best server based on geo location
- better state management
- react menu / setup for menu expansion
- select skins
- remove players client & from gridSize
- canvas optimisations

#### logic issues
- missing square when player joins
- find safe area to start at
- check collisions -
- second player capture area bug? -
- Socket lag in firefox when run on droplet
- fix performance hit with flood fill
- double speed







 - setup grid & server
 - start ticking
 - clients connect and are setup, basic info is pushed back to them
 - push ticking updates to all sockets in open game rooms
 - clients respond with movements, players & grid kept updated
 - when dead, a player is moved out of the active game room into stasis


----------------------------
notes



var cssColours = [
  '#f5a3a3',
  '#ed5e5e',

  '#15a7e4',
  '#62d1ff',

  '#7d62ff',
  '#9985f9',

  '#d156ff',
  '#e6a2ff',

  '#ff61a7',
  '#ff9ac7',

  '#ff7257',
  '#ff9f8c',

  '#efa158',
  '#ffc793',

  '#c4ff5a',
  '#daff97',

  '#8fff76',
  '#b4ffa3',

  '#57ffcc',
  '#8dffdc',

  '#53f5e9',
  '#96fff7'
]


// var req = express.connection
// var ip = req.headers['x-forwarded-for'] ||
//     req.connection.remoteAddress ||
//     req.socket.remoteAddress ||
//     req.connection.socket.remoteAddress;


--drawing tiled images (skins?)

preload png images

// var images = []
// function loadImages (image) {
//   var img = new Image(40)
//   img.src = 'img/40x50head.png'
//   images.push(img)
//   img = new Image()
//   img.src = 'img/tile1.png'
//   images.push(img)
// }

draw tiles

// context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
// img is 70x70
// square is 35x35
// var img = images[1]
// var clipX = (col % Math.floor(img.width / squareSize)) * squareSize
// var clipY = (row % Math.floor(img.height / squareSize)) * squareSize
// canvas2d.drawImage(img,clipX, clipY, squareSize, squareSize, col * squareSize, row * squareSize, squareSize, squareSize)



not clearing rect anymore, just drawing a grey one on top

  // canvas2d.clearRect(0, 0, canvas.width, canvas.height)


floating K.O text on death

// var player = getPlayerByID(userID)
// var pos = playerHeadPosition(player)
// canvas2d.font = '30px sans-serif'
// var x = pos[0] * squareSize
// var y = pos[1] * squareSize
// canvas2d.fillStyle = '#1b1a1d'
// canvas2d.fillText('K.O.', x + 5, y + 5)
// canvas2d.fillStyle = cssColours[player.colourPrimary]
// canvas2d.fillText('K.O', x, y)

function preRenderBackground () {
  // backgroundCanvas = document.createElement('canvas')
  // backgroundCanvas.width =  canvas.width
  // backgroundCanvas.height =  canvas.height
  // var ctx2 = backgroundCanvas.getContext('2d')
  // ctx2.fillStyle = 'grey'
  // var x = gridSize * squareSize
  // ctx2.fillRect(-10, -10, x + 20, x + 20)
  // ctx2.clearRect(0, 0, x, x)
}
