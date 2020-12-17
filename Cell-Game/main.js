"use strict";

let canvas = document.getElementById("mainCanvas"),
    renderer = canvas.getContext("2d"),
    draggingCanvas = document.getElementById("draggingCanvas"),
    draggingRenderer = draggingCanvas.getContext("2d"),
    backgroundCanvas = document.getElementById("backgroundCanvas"),
    backgroundRenderer = backgroundCanvas.getContext("2d"),

    cellSize = 30,

    placedCells = [],
    targetsRemaining = 1,
    currentLevel = 2,

    mapWidth,
    mapHeight,

    newCellId = 0,

    mouseDown = false,
    cellHeld = null,
    dragOffset = { x: 0, y: 0 };

const CELLS = {
    NO_CELL: -1,
    EMPTY: 0,
    EMPTY_PLACEABLE: 20,
    IMMOBILE: 40,
    PASSIVE: 60,
    PUSHER: 80,
    TARGET: 100
},
    LEVELS = {
        1: {
            width: 12,
            height: 7,
            placeable: {
                x1: 1,
                y1: 1,
                x2: 5,
                y2: 5
            },
            placed: [
                { x: 8, y: 3, type: CELLS.TARGET, rotation: 0 },
                { x: 2, y: 2, type: CELLS.PUSHER, rotation: 1 }
            ],
            targets: 1
        },
        2: {
            width: 12,
            height: 7,
            placeable: {
                x1: 1,
                y1: 1,
                x2: 5,
                y2: 5
            },
            placed: [
                { x: 7, y: 3, type: CELLS.TARGET, rotation: 0 },
                { x: 8, y: 3, type: CELLS.TARGET, rotation: 0 },
                { x: 9, y: 3, type: CELLS.TARGET, rotation: 0 },
                { x: 1, y: 5, type: CELLS.PUSHER, rotation: 1 },
                { x: 4, y: 1, type: CELLS.PASSIVE, rotation: 1 },
                { x: 2, y: 2, type: CELLS.PASSIVE, rotation: 1 },
            ],
            targets: 3
        }
    }

/**
 * Fix for the javascript modulo operator
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}

/**
 * Starts the game
 */
function init() {
    //Sets the size of the map in cells
    mapWidth = LEVELS[currentLevel].width;
    mapHeight = LEVELS[currentLevel].height;

    //Resizes the canvas to fit the map
    canvas.width = mapWidth * cellSize;
    canvas.height = mapHeight * cellSize;
    backgroundCanvas.width = canvas.width;
    backgroundCanvas.height = canvas.height;
    draggingCanvas.width = canvas.width;
    draggingCanvas.height = canvas.height;

    drawBackground(LEVELS[currentLevel].placeable.x1, LEVELS[currentLevel].placeable.y1, LEVELS[currentLevel].placeable.x2, LEVELS[currentLevel].placeable.y2);

    createMap(true);
}

function step() {
    for (let cell of placedCells) {
        if (cell) {
            switch (cell.type) {
                case CELLS.PUSHER:
                    let pushLoopIndex = 1,
                        toPush = [cell.id],
                        moreCells = true;
                    while (true) {
                        let nextPush = undefined;
                        switch (mod(cell.rotation, 4)) {
                            case 0:
                                if (cell.y - pushLoopIndex >= 0) {
                                    nextPush = getCell(cell.x, cell.y - pushLoopIndex);
                                }
                                break;

                            case 1:
                                if (cell.x + pushLoopIndex < mapWidth) {
                                    nextPush = getCell(cell.x + pushLoopIndex, cell.y);
                                }
                                break;

                            case 2:
                                if (cell.y + pushLoopIndex < mapHeight) {
                                    nextPush = getCell(cell.x, cell.y + pushLoopIndex);
                                }
                                break;

                            case 3:
                                if (cell.x - pushLoopIndex >= 0) {
                                    nextPush = getCell(cell.x - pushLoopIndex, cell.y);
                                }
                                break;
                        }
                        if (nextPush && placedCells[nextPush].type == CELLS.IMMOBILE) {
                            break;
                        } else {
                            if (nextPush == undefined || placedCells[nextPush] == null || placedCells[nextPush].type == CELLS.TARGET) {
                                if (nextPush && placedCells[nextPush].type == CELLS.TARGET) {
                                    placedCells[nextPush] = null;
                                    placedCells[toPush[toPush.length - 1]] = null;
                                    targetsRemaining--;
                                }
                                for (let cellPushing of toPush) {
                                    if (placedCells[cellPushing]) {
                                        switch (mod(cell.rotation, 4)) {
                                            case 0:
                                                placedCells[cellPushing].y--;
                                                break;
                                            case 1:
                                                placedCells[cellPushing].x++;
                                                break;
                                            case 2:
                                                placedCells[cellPushing].y++;
                                                break;
                                            case 3:
                                                placedCells[cellPushing].x--;
                                                break;
                                        }
                                    }
                                }
                                break;
                            } else if (placedCells[nextPush].type == CELLS.PUSHER) {
                                if (placedCells[nextPush].rotation == mod(cell.rotation + 2, 4)) {
                                    break;
                                } else if (placedCells[nextPush].rotation == cell.rotation) {
                                    moreCells = false;
                                } else {
                                    toPush.push(nextPush);
                                }
                            } else {
                                if (moreCells) {
                                    toPush.push(nextPush);
                                }
                            }
                        }
                        pushLoopIndex++;
                    }
                    break;

                default:
                    break;
            }
        }
    }
    drawMap();
    if (targetsRemaining == 0) {
        alert("You win!");
    }
}

/**
 * Populates the map with cells
 * 
 * @param border Whether there should be a border or not
 */
function createMap(border) {
    for (let i = 0; i < mapHeight; i++) {
        for (let o = 0; o < mapWidth; o++) {
            if (border && (o == 0 || o == mapWidth - 1 || i == 0 || i == mapHeight - 1)) {
                placedCells.push({ x: o, y: i, type: CELLS.IMMOBILE, rotation: 0, id: placedCells.length });
            }
        }
    }

    for (let cell of LEVELS[currentLevel].placed) {
        cell.id = placedCells.length;
        placedCells.push(cell);
    }

    targetsRemaining = LEVELS[currentLevel].targets;

    drawMap();
}

/**
 * Draws the cells onto the canvas
 */
function drawMap() {
    clearCanvas(renderer);
    for (let cell of placedCells) {
        if (cell) {
            drawMapCell(cell.x, cell.y, cell.type, cell.rotation, renderer);
        }
    }
}

/**
 * Draws a cell on the map
 * 
 * @param x The zero-based coordinate for the cell
 * @param y The zero-based coordinate for the cell
 * @param spritePosition The y position on the spritesheet of the cell
 * @param rotation The rotation id of the cell
 * @param canvasRenderer The renderer to use
 * 
 */
function drawMapCell(x, y, spritePosition, rotation = 0, canvasRenderer) {
    if (spritePosition != CELLS.NO_CELL) {
        if (canvasRenderer != draggingRenderer) {
            x *= cellSize;
            y *= cellSize;
        }
        if (rotation == 0) {
            canvasRenderer.drawImage(document.getElementById("cells"), 0, spritePosition, 20, 20, x, y, cellSize, cellSize);
        } else {
            canvasRenderer.setTransform(1, 0, 0, 1, x + Math.floor(cellSize / 2), y + Math.floor(cellSize / 2));
            canvasRenderer.rotate(getRotation(rotation));
            canvasRenderer.drawImage(document.getElementById("cells"), 0, spritePosition, 20, 20, -Math.floor(cellSize / 2), -Math.floor(cellSize / 2), cellSize, cellSize);
            canvasRenderer.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
}

/**
 * Clears the whole map
 */
function clearCanvas(canvasRenderer) {
    canvasRenderer.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Gets the rotation in radians for a rotation id - 0 is up, 1 is right, 2 is down, 3 is left
 */
function getRotation(rotation) {
    return Math.PI / 2 * mod(rotation, 4);
}


/**
 * Gets a cell at coordinates
 * 
 * @return The index of the cell in placedCells (cell ID)
 */
function getCell(x, y) {
    for (let cell in placedCells) {
        if (placedCells[cell] && placedCells[cell].x == x && placedCells[cell].y == y) {
            return parseInt(cell);
        }
    }
}

/**
 * Draws the background
 */
function drawBackground(x1, y1, x2, y2) {
    for (let i = 0; i < mapHeight; i++) {
        for (let o = 0; o < mapWidth; o++) {
            if (i >= y1 && i <= y2 && o >= x1 && o <= x2) {
                drawMapCell(o, i, CELLS.EMPTY_PLACEABLE, 0, backgroundRenderer);
            } else {
                drawMapCell(o, i, CELLS.EMPTY, 0, backgroundRenderer);
            }
        }
    }
}

/**
 * Handles the mouse
 */
function getMousePos(evt) {
    let rect = draggingCanvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

draggingCanvas.addEventListener('mousedown', function (evt) {
    mouseDown = true;
    let mousePos = getMousePos(evt),
        mapPos = { x: Math.floor(mousePos.x / cellSize), y: Math.floor(mousePos.y / cellSize) };
    if (mapPos.x >= LEVELS[currentLevel].placeable.x1 && mapPos.y >= LEVELS[currentLevel].placeable.y1 && mapPos.x <= LEVELS[currentLevel].placeable.x2 && mapPos.y <= LEVELS[currentLevel].placeable.y2) {
        cellHeld = getCell(mapPos.x, mapPos.y);
        if (cellHeld && placedCells[cellHeld] != null && placedCells[cellHeld].type != CELLS.IMMOBILE) {
            cellHeld = deepCopy(placedCells[cellHeld]);
            placedCells[cellHeld.id].type = CELLS.NO_CELL;
            dragOffset.x = mousePos.x - (mapPos.x * cellSize);
            dragOffset.y = mousePos.y - (mapPos.y * cellSize);
            drawMap();
            clearCanvas(draggingRenderer);
            drawMapCell(mousePos.x - dragOffset.x, mousePos.y - dragOffset.y, cellHeld.type, cellHeld.rotation, draggingRenderer);
        } else {
            cellHeld = null;
        }
    }
}, false);

draggingCanvas.addEventListener('mouseup', function (evt) {
    mouseDown = false;
    if (cellHeld) {
        let mousePos = getMousePos(evt),
            mapPos = { x: Math.floor((mousePos.x - dragOffset.x + Math.floor(cellSize / 2)) / cellSize), y: Math.floor((mousePos.y - dragOffset.y + Math.floor(cellSize / 2)) / cellSize) };
        if (mapPos.x >= LEVELS[currentLevel].placeable.x1 && mapPos.y >= LEVELS[currentLevel].placeable.y1 && mapPos.x <= LEVELS[currentLevel].placeable.x2 && mapPos.y <= LEVELS[currentLevel].placeable.y2) {
            placedCells[cellHeld.id].x = mapPos.x;
            placedCells[cellHeld.id].y = mapPos.y;
        }
        placedCells[cellHeld.id].type = cellHeld.type;
        clearCanvas(draggingRenderer);
        drawMap();
        cellHeld = null;
    }
}, false);

draggingCanvas.addEventListener('mousemove', function (evt) {
    if (mouseDown && cellHeld) {
        let mousePos = getMousePos(evt);
        clearCanvas(draggingRenderer);
        drawMapCell(mousePos.x - dragOffset.x, mousePos.y - dragOffset.y, cellHeld.type, cellHeld.rotation, draggingRenderer);
    }
}, false);

draggingCanvas.addEventListener('mouseout', function (evt) {
    mouseDown = false;
    if (cellHeld) {
        clearCanvas(draggingRenderer);
        placedCells[cellHeld.id].type = cellHeld.type;
        drawMap();
        cellHeld = null;
    }
}, false);

/**
 * Copies the values from an array or object rather than the memory space
 */
function deepCopy(toCopy) {
    return JSON.parse(JSON.stringify(toCopy));
}

/**
 * Starts the game once the cells are loaded
 */
let loadInterval = setInterval(() => {
    if (imageLoaded) {
        clearInterval(loadInterval);
        init();
    }
}, 10);