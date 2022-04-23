export default class Game {
    constructor(sideLengthPx, fieldSize, moveSpeed, delay) {
        this.sideLengthPx = sideLengthPx
        this.fieldSize = fieldSize
        this.cellSize = sideLengthPx / fieldSize

        this.moveSpeed = moveSpeed   // ms
        this.delay = delay    // ms

        this.drawer = new Drawer(this.cellSize, this.moveSpeed)
        this.mapHandler = new MapHandler(this.fieldSize, this.drawer)
        this.moveHandle = new moveHandle(this.mapHandler, this.drawer)
        this.control = new Control(this.moveHandle)
    }
    
    launch() {
        this.control.setListeners()
        const xStart = Math.floor(this.fieldSize / 2)
        const yStart = 0
        this.drawer.createAsh(xStart, yStart)
        this.ash = document.getElementById("ash")
        this.moveHandle.launchCycle(xStart, yStart, this.ash, this.fieldSize, this.moveSpeed, this.delay)

        this.mapHandler.generatePokemon(xStart, yStart)
    }
}





class moveHandle {
    constructor(mapHandler, drawer) {
        this.mapHandler = mapHandler
        this.drawer = drawer

        this.direction = "right"
        this.prevDirection = "right"

        this.statistic = new Statistic()
        this.modal = new Modal()
    }
    launchCycle(xStart, yStart, ash, fieldSize, moveSpeed, delay) {
        let timerId
        let curX = xStart
        let curY = yStart

        let takenPoks = []

        timerId = setInterval(() => {

            this.mapHandler.setHistory(curX, curY)

            if (this.direction === "right") {
                curY += 1
                this.drawer.rotate(ash, "right", takenPoks)
            }
            else if (this.direction === "top") {
                curX -= 1
                this.drawer.rotate(ash, "top", takenPoks) 
            }
            else if (this.direction === "left") {
                curY -= 1
                this.drawer.rotate(ash, "left", takenPoks)
            }
            else if (this.direction === "down") {
                curX += 1;
                this.drawer.rotate(ash, "down", takenPoks)
            }

            this.prevDirection = this.direction

            if (curX === fieldSize || curY === fieldSize || curX === -1 || curY === -1) {
                console.log("hit the wall")
                this.modal.openModal("Hit the wall")
                this.statistic.updateHighscore()
                clearInterval(timerId)
            }
            else if (!this.mapHandler.isFree(curX, curY)) {
                console.log("bit urself")
                this.modal.openModal("Bit urself")
                this.statistic.updateHighscore()
                clearInterval(timerId)
            }
            else {
                if (this.mapHandler.hasPokemon(curX, curY)) {
                    takenPoks = this.mapHandler.eatPokemon(curX, curY)
                    this.statistic.plusPoint()
                    const isThereEmptyPlace = this.mapHandler.generatePokemon(curX, curY)
                    if (!isThereEmptyPlace) {
                        console.log("=====WIN=====")
                        this.statistic.updateHighscore()
                        this.modal.openModal("YOU WIN")
                        clearInterval(timerId)
                    }
                }
                this.drawer.moveTo(curX, curY, takenPoks, this.mapHandler.prevAshX, this.mapHandler.prevAshY, this.direction)
                this.mapHandler.updateFreedomStatus(takenPoks)
            }
        }, moveSpeed + delay)
    }
}






class Cell {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    isFree = true
    hasPok = false
}

class TakenPok {
    constructor(elem, prevX, prevY) {
        this.elem = elem
        this.prevX = prevX
        this.prevY = prevY
    }
    direction = null
}

class MapHandler {
    constructor(fieldSize, drawer) {
        this.fieldSize = fieldSize
        this.fieldMatrix = []
        for (let i = 0; i < fieldSize; i++) {
            this.fieldMatrix[i] = []
            for (let j = 0; j < fieldSize; j++) {
                this.fieldMatrix[i][j] = new Cell(i, j)
            }
        }
        this.drawer = drawer
        this.takenPoks = []

        this.toFreeX = null
        this.toFreeY = null
    }
    isFree(i, j) {
        if (this.fieldMatrix[i][j].isFree === true) return true
        else return false
    }
    setFree(i, j) {
        this.fieldMatrix[i][j].isFree = true
    }
    setNotFree(i, j) {
        this.fieldMatrix[i][j].isFree = false
    }
    hasPokemon(i, j) {
        if (this.fieldMatrix[i][j].hasPok) return true
        else return false
    }
    getFreeCell() {
        const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min)
        const roulette = []
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                if (this.fieldMatrix[i][j].isFree && !this.fieldMatrix[i][j].hasPok) {
                    if (i !== this.prevAshX && j !== this.prevAshY)
                        roulette.push(i * this.fieldSize + j)
                }
            }
        }
        const rand = getRandomNumber(0, roulette.length)
        if (roulette.length === 0) {
            console.log("roulette is empty")
            return null
        }
        else {
            const cell = this.fieldMatrix[Math.floor(roulette[rand] / this.fieldSize)][roulette[rand] % this.fieldSize]
            return [cell.x, cell.y]
        }
    }
    generatePokemon(curX, curY) {
        const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min)
        const freeCellCoords = this.getFreeCell(curX, curY)
        if (freeCellCoords == null) return false
        const i = freeCellCoords[0]
        const j = freeCellCoords[1]
        const randPokNumber = getRandomNumber(1, 14)
        const pathNumber = randPokNumber < 10 ? `00${randPokNumber}` : `0${randPokNumber}`
        const path = `./img/pokemons/${pathNumber}.png`
        this.drawer.createPok(i, j, path)
        this.fieldMatrix[i][j].hasPok = true
        return true
    }
    eatPokemon(x, y) {
        const pok = document.getElementById(`pok${this.drawer.pokIndex - 1}`)
        this.fieldMatrix[x][y].hasPok = false
        this.takenPoks.push(new TakenPok(pok, x, y))
        return this.takenPoks
    }
    setHistory(x, y) {
        this.prevAshX = x
        this.prevAshY = y
    }
    updateFreedomStatus(takenPoks) {
        if (this.toFreeX != null) {
            this.setFree(this.toFreeX, this.toFreeY)
        }
        if (takenPoks.length !== 0) {
            takenPoks.forEach(pok => {
                this.setNotFree(pok.prevX, pok.prevY)
            })
            this.toFreeX = takenPoks[takenPoks.length - 1].prevX
            this.toFreeY = takenPoks[takenPoks.length - 1].prevY
        }
    }
}






class Drawer {
    constructor(cellSize, moveSpeed) {
        this.cellSize = cellSize
        this.moveSpeed = moveSpeed
    }
    field = document.getElementById("canvas-container")
    offsetTop = 10
    offsetLeft = 7
    ash = null
    pokIndex = 0
    createAsh(x, y) {
        this.ash = document.createElement('img')
        this.ash.id = "ash"
        this.ash.src = "./img/ash.png"
        this.ash.style.width = `${this.cellSize}px`
        this.ash.style.position = "absolute"
        this.ash.style.top = `${this.offsetTop + x * this.cellSize}px`
        this.ash.style.left = `${this.offsetLeft + y * this.cellSize}px`
        this.ash.style.transition = `${this.moveSpeed / 1000}s linear`
        this.ash.style.transitionProperty = "left,top"
        this.field.append(this.ash)
    }
    createPok(x, y, path) {
        const pok = document.createElement('img')
        pok.id = `pok${this.pokIndex}`
        this.pokIndex++
        pok.src = path
        pok.style.width = `${this.cellSize}px`
        pok.style.position = "absolute"
        pok.style.top = `${this.offsetTop + x * this.cellSize}px`
        pok.style.left = `${this.offsetLeft + y * this.cellSize}px`
        pok.style.transition = `${this.moveSpeed / 1000}s linear`
        pok.style.transitionProperty = "left,top"
        this.field.append(pok)
        return pok
    }
    moveTo(x, y, takenPoks, prevX, prevY, direction) {
        this.ash.style.top = `${this.offsetTop + x * this.cellSize}px`
        this.ash.style.left = `${this.offsetLeft + y * this.cellSize}px`

        if (takenPoks.length > 0) {
            for (let i = takenPoks.length - 1; i >= 0; i--) {
                if (i === 0) {
                    takenPoks[i].elem.style.top = `${this.offsetTop + (prevX) * this.cellSize}px`
                    takenPoks[i].elem.style.left = `${this.offsetLeft + (prevY) * this.cellSize}px`
                    
                    takenPoks[i].direction = direction

                    if (takenPoks.length >= 2) {
                        if (takenPoks[i].prevX - prevX === 1) {
                            takenPoks[i + 1].direction = "top"
                        }
                        else if (takenPoks[i].prevX - prevX === -1) {
                            takenPoks[i + 1].direction = "down"
                        }
                        else if (takenPoks[i].prevY - prevY === 1) {
                            takenPoks[i + 1].direction = "left"
                        }
                        else if (takenPoks[i].prevY - prevY === -1) {
                            takenPoks[i + 1].direction = "right"
                        }
                    }
                    
                    takenPoks[i].prevX = prevX
                    takenPoks[i].prevY = prevY
                }
                else {
                    takenPoks[i].elem.style.top = `${this.offsetTop + (takenPoks[i - 1].prevX) * this.cellSize}px`
                    takenPoks[i].elem.style.left = `${this.offsetLeft + (takenPoks[i - 1].prevY) * this.cellSize}px`
            
                    if (i !== takenPoks.length - 1) {
                        if (takenPoks[i].prevX - takenPoks[i - 1].prevX === 1) {
                            takenPoks[i + 1].direction = "top"
                        }
                        else if (takenPoks[i].prevX - takenPoks[i - 1].prevX === -1) {
                            takenPoks[i + 1].direction = "down"
                        }
                        else if (takenPoks[i].prevY - takenPoks[i - 1].prevY === 1) {
                            takenPoks[i + 1].direction = "left"
                        }
                        else if (takenPoks[i].prevY - takenPoks[i - 1].prevY === -1) {
                            takenPoks[i + 1].direction = "right"
                        }
                    }

                    takenPoks[i].prevX = takenPoks[i - 1].prevX
                    takenPoks[i].prevY = takenPoks[i - 1].prevY
                }
            }
        }
        return takenPoks
    }
    rotate(ash, direction, takenPoks) {
        let angle
        ash.style.transform = ""
        if (direction === "top") {
            angle = -90
            ash.style.transform += `scaleX(-1)`
        }
        else if (direction === "right") {
            angle = 0
        }
        else if (direction === "left") {
            angle = -180
            ash.style.transform += `scaleY(-1)`
        }
        else if (direction === "down") {
            angle = -270
            ash.style.transform += `scaleX(-1)`
        }
        ash.style.transform += ` rotate(${angle}deg)`


        if (takenPoks.length > 0) {
            takenPoks.forEach(pok => {
                pok.elem.style.transform = ""

                if (pok.direction === "top") {
                    angle = -90
                    pok.elem.style.transform += `scaleX(-1)`
                }
                else if (pok.direction === "right") {
                    angle = 0
                }
                else if (pok.direction === "left") {
                    angle = -180
                    pok.elem.style.transform += `scaleY(-1)`
                }
                else if (pok.direction === "down") {
                    angle = -270
                    pok.elem.style.transform += `scaleX(-1)`
                }
                pok.elem.style.transform += ` rotate(${angle}deg)`
            })
        }
    }
}







class Control {
    constructor(moveHandle) {
        this.moveHandle = moveHandle

        this.btnUp = document.getElementById("btn-up")
        this.btnLeft = document.getElementById("btn-left")
        this.btnRight = document.getElementById("btn-right")
        this.btnDown = document.getElementById("btn-down")
    }
    setListeners() {
        document.addEventListener('keydown', event => {
            if (event.code === "ArrowRight" && this.moveHandle.prevDirection !== "left") {
                this.moveHandle.direction = "right"  
            }
            else if (event.code === "ArrowUp" && this.moveHandle.prevDirection !== "down") {
                this.moveHandle.direction = "top"
            }
            else if (event.code === "ArrowLeft" && this.moveHandle.prevDirection !== "right") {
                this.moveHandle.direction = "left"
            }
            else if (event.code === "ArrowDown" && this.moveHandle.prevDirection !== "top") {
                this.moveHandle.direction = "down"
            }
        });
        this.btnUp.addEventListener('click', () => {
            if (this.moveHandle.prevDirection !== "down") {
                this.moveHandle.direction = "top"
            }
        })
        this.btnDown.addEventListener('click', () => {
            if (this.moveHandle.prevDirection !== "top") {
                this.moveHandle.direction = "down"
            }
        })
        this.btnLeft.addEventListener('click', () => {
            if (this.moveHandle.prevDirection !== "right") {
                this.moveHandle.direction = "left"
            }
        })
        this.btnRight.addEventListener('click', () => {
            if (this.moveHandle.prevDirection !== "left") {
                this.moveHandle.direction = "right"
            }
        })
    }
}






class Statistic {
    constructor() {
        this.scoreSpan = document.getElementById("score-span")
        this.highscoreSpan = document.getElementById("highscore-span")
    }
    plusPoint() {
        this.scoreSpan.innerText = +this.scoreSpan.innerText + 1
    }
    resetScore() {
        this.scoreSpan.innerText = 0
    }
    updateHighscore() {
        const highscore = +this.highscoreSpan.innerText
        const score = +this.scoreSpan.innerText
        if (score > highscore) this.highscoreSpan.innerText = score
        this.resetScore()
    }
}




class Modal {
    constructor() {
        this.modal = document.getElementById("modal")
        this.info = document.getElementById("info")
        this.modalBtn = document.getElementById("modal-btn")
        this.modalBtn.addEventListener("click", () => {
            window.location.reload();
            return false
        })
    }
    openModal(message) {
        this.modal.style.display = "block"
        this.info.innerText = message
    }
}