export default function canvasCreate(sideLengthPx, FIELDSIZE) {
    const gameField = document.getElementById("game-field")
    const ctx = gameField.getContext('2d')
    gameField.width = sideLengthPx
    gameField.height = sideLengthPx
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, gameField.width, gameField.height)

    const oneCellSize = gameField.height / FIELDSIZE
    for (let i = 0; i < FIELDSIZE; i++) {
        // horizontal line
        ctx.beginPath();
        ctx.moveTo(0, i * oneCellSize);
        ctx.lineTo(gameField.width, i * oneCellSize);
        ctx.closePath();
        ctx.stroke()

        // vertical line
        ctx.beginPath();
        ctx.moveTo(i * oneCellSize, 0);
        ctx.lineTo(i * oneCellSize, gameField.width);
        ctx.closePath();
        ctx.stroke()
    }
}