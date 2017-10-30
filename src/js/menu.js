import settings from './settings.js'

export default class Menu {
  constructor (startButton, startMenu) {
    this.startMenu = startMenu
    this.startButton = startButton
  }

  show () {
    this.startMenu.style.display = ''
  }

  hide () {
    this.startMenu.style.display = 'none'
  }

  setButtonColour (colour, colourPrimary) {
    this.startButton.style.background = colourPrimary
    this.startButton.style['border-bottom'] = '2px solid ' + colour
    this.startButton.style['-webkit-box-shadow'] = 'inset 0 -2px ' + colour
    this.startButton.style['box-shadow'] = 'inset 0 -2px ' + colour
  }

}
