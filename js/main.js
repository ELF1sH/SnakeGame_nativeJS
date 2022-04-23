import canvasCreate from "./canvasCreator.js"
import Game from './game/Game.js'

document.addEventListener("DOMContentLoaded", () => {

    const sideLengthInput = document.getElementById("side-length-input")
    sideLengthInput.value = 800
    const fieldSizeInput = document.getElementById("field-size-input")
    fieldSizeInput.value = 10
    const moveSpeedInput = document.getElementById("move-speed-input")
    moveSpeedInput.value = 250
    const delayInput = document.getElementById("delay-input")
    delayInput.value = 200
    const startBtn = document.getElementById("start-btn")

    startBtn.addEventListener("click", () => {
        const sideLengthPx = +sideLengthInput.value
        const fieldSize = +fieldSizeInput.value 
        const moveSpeed = +moveSpeedInput.value 
        const delay = +delayInput.value

        canvasCreate(sideLengthPx, fieldSize)
        const g = new Game(sideLengthPx, fieldSize, moveSpeed, delay)
        g.launch()
    })
})