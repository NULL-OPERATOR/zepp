import settings from './settings.js'

export default class Board {
  constructor(grid, gridSize) {
    this.grid = grid
    this.gridSize = gridSize
    this.nodes = []
  }

  setPosition(x, y, colour) {
    this.grid[x][y] = colour
  }

  getPosition(x, y) {
    return this.grid[x][y]
  }

  capture(colour, colourPrimary) {
    this.captureTailArea(colour, colourPrimary)
    this.captureArea(colour, colourPrimary)
  }

  addStartingArea(x, y, colourPrimary) {
    for (let i = 0; i < settings.startingAreaCoordinates.length; i++) {
      const x2 = settings.startingAreaCoordinates[i][0]
      const y2 = settings.startingAreaCoordinates[i][1]
      this.grid[x + x2][y + y2] = colourPrimary
    }
  }

  removePlayers(playersToBeRemoved) {
    for (let i = 0; i < playersToBeRemoved.length; i++) {
      this.removePlayer(playersToBeRemoved[i].colour, playersToBeRemoved[i].colourPrimary)
    }
  }

  removePlayer(colour, colourPrimary) {
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize; row++) {
        if (this.grid[col][row] === colour || this.grid[col][row] === colourPrimary) {
          this.grid[col][row] = 255
        }
      }
    }
  }

  getScores() {
    const tempScores = this.sumCurrentScores()
    // todo: rethink this
    // map them into an iteratable objects
    const result = Object.keys(tempScores).map(function(key) {
      return [key, tempScores[key]]
    })
    // sort them
    result.sort(function(a, b) {
      return a[1] < b[1]
    })
    return result
  }

  sumCurrentScores() {
    const scores = {}

    const updateScore = (value) => {
      if (!scores[value]) {
        scores[value] = 1
      } else {
        scores[value] += 1
      }
    }

    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize; row++) {
        var value = this.grid[col][row]
        // if its not a blank tile && not part of a tail
        if (value !== 255 && value % 2 === 0) {
          updateScore(value)
        }
      }
    }
    return scores
  }

  captureTailArea(colour, primary) {
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize; row++) {
        if (this.grid[col][row] == colour) {
          this.grid[col][row] = primary
        }
      }
    }
  }

  captureArea(colour, colourPrimary) {
    const grid2 = this.copyGrid()
    this.findCapturedArea(grid2, colourPrimary)
    this.fillCapturedArea(grid2, colourPrimary)
  }

  copyGrid() {
    var newGrid = []
    for (let col = 0; col < this.gridSize; col++) {
      newGrid[col] = []
      for (let row = 0; row < this.gridSize; row++) {
        newGrid[col][row] = this.grid[col][row]
      }
    }
    return newGrid
  }

  addNode(x, y) {
    if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
      this.nodes.push([x, y])
    }
  }

  findCapturedArea(grid2, colour) {
    this.nodes = [
      [0, 0]
    ]

    while (this.nodes.length) {
      var node = this.nodes.pop()
      var x = node[0]
      var y = node[1]
      var value = grid2[x][y]

      if (value !== colour) {
        grid2[x][y] = colour
        this.addNode(x - 1, y)
        this.addNode(x + 1, y)
        this.addNode(x, y - 1)
        this.addNode(x, y + 1)
      }
    }
  }

  fillCapturedArea(grid2, colour) {
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize; row++) {
        if (grid2[col][row] !== colour) {
          this.grid[col][row] = colour
        }
      }
    }
  }
}
