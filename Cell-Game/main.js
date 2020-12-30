"use strict";

let canvas = document.getElementById("mainCanvas"),
    renderer = canvas.getContext("2d"),
    draggingCanvas = document.getElementById("draggingCanvas"),
    draggingRenderer = draggingCanvas.getContext("2d"),
    backgroundCanvas = document.getElementById("backgroundCanvas"),
    backgroundRenderer = backgroundCanvas.getContext("2d"),

    cellSize = 30,

    placedCells = [],
    savedLayout = [],
    targetsRemaining = 1,
    currentLevel = 1,

    mapWidth,
    mapHeight,

    newCellId = 0,

    animationStart = undefined,
    animationTime = 200,
    animation = undefined,
    playing = false,
    stepDelay = 400,
    nextStep = undefined,

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
    GENERATOR: 100,
    ROTATOR: 120,
    SLIDE: 140,
    TARGET: 160
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
        },
        3: {
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
                { x: 2, y: 2, type: CELLS.PUSHER, rotation: 0 },
                { x: 3, y: 4, type: CELLS.ROTATOR, rotation: 0 }
            ],
            targets: 1
        },
        4: {
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
                { x: 2, y: 3, type: CELLS.GENERATOR, rotation: 1 },
                { x: 4, y: 2, type: CELLS.PASSIVE, rotation: 1 }
            ],
            targets: 3
        },
        5: {
            width: 22,
            height: 12,
            placeable: {
                x1: 1,
                y1: 1,
                x2: 10,
                y2: 5
            },
            placed: [
                { x: 2, y: 9, type: CELLS.PUSHER, rotation: 1 },
                { x: 3, y: 9, type: CELLS.SLIDE, rotation: 1 },
                { x: 7, y: 3, type: CELLS.PUSHER, rotation: 2 },
                { x: 4, y: 2, type: CELLS.PUSHER, rotation: 2 },
                { x: 2, y: 4, type: CELLS.PASSIVE, rotation: 0 },
                { x: 6, y: 2, type: CELLS.PASSIVE, rotation: 0 },
                { x: 18, y: 9, type: CELLS.TARGET, rotation: 0 },
                { x: 19, y: 9, type: CELLS.TARGET, rotation: 0 },
            ],
            targets: 2
        },
        6: {
            width: 12,
            height: 17,
            placeable: {
                x1: 1,
                y1: 1,
                x2: 5,
                y2: 5
            },
            cutout: {
                x1: 7,
                y1: 0,
                x2: 11,
                y2: 11
            },
            placed: [
                { x: 1, y: 1, type: CELLS.PUSHER, rotation: 1 },
                { x: 3, y: 5, type: CELLS.SLIDE, rotation: 1 },
                { x: 5, y: 4, type: CELLS.PUSHER, rotation: 2 },
                { x: 4, y: 2, type: CELLS.PUSHER, rotation: 2 },
                { x: 2, y: 3, type: CELLS.PASSIVE, rotation: 0 },
                { x: 9, y: 14, type: CELLS.TARGET, rotation: 0 },
            ],
            targets: 1
        },
        7: {
            width: 18,
            height: 13,
            placeable: {
                x1: 1,
                y1: 8,
                x2: 4,
                y2: 11
            },
            cutout: {
                x1: 0,
                y1: 0,
                x2: 7,
                y2: 6
            },
            placed: [
                { x: 2, y: 9, type: CELLS.GENERATOR, rotation: 1 },
                { x: 4, y: 11, type: CELLS.GENERATOR, rotation: 1 },
                { x: 3, y: 8, type: CELLS.GENERATOR, rotation: 0 },
                { x: 1, y: 11, type: CELLS.PASSIVE, rotation: 0 },
                { x: 9, y: 1, type: CELLS.TARGET, rotation: 0 },
                { x: 10, y: 1, type: CELLS.TARGET, rotation: 0 },
                { x: 11, y: 1, type: CELLS.TARGET, rotation: 0 },
                { x: 12, y: 1, type: CELLS.TARGET, rotation: 0 },
                { x: 13, y: 1, type: CELLS.TARGET, rotation: 0 },
                { x: 14, y: 1, type: CELLS.TARGET, rotation: 0 },
                { x: 15, y: 1, type: CELLS.TARGET, rotation: 0 },
                { x: 16, y: 1, type: CELLS.TARGET, rotation: 0 },
            ],
            targets: 8
        },
        8: {
            width: 22,
            height: 14,
            placeable: {
                x1: 1,
                y1: 1,
                x2: 8,
                y2: 5
            },
            placed: [
                { x: 1, y: 3, type: CELLS.GENERATOR, rotation: 1 },
                { x: 3, y: 5, type: CELLS.SLIDE, rotation: 0 },
                { x: 6, y: 1, type: CELLS.PUSHER, rotation: 1 },
                { x: 5, y: 4, type: CELLS.PUSHER, rotation: 1 },
                { x: 5, y: 1, type: CELLS.PUSHER, rotation: 2 },
                { x: 2, y: 9, type: CELLS.GENERATOR, rotation: 1 },
                { x: 1, y: 9, type: CELLS.SLIDE, rotation: 0 },
                { x: 3, y: 9, type: CELLS.SLIDE, rotation: 0 },
                { x: 1, y: 8, type: CELLS.IMMOBILE, rotation: 0 },
                { x: 2, y: 8, type: CELLS.IMMOBILE, rotation: 0 },
                { x: 3, y: 8, type: CELLS.IMMOBILE, rotation: 0 },
                { x: 12, y: 11, type: CELLS.TARGET, rotation: 0 },
                { x: 13, y: 11, type: CELLS.TARGET, rotation: 0 },
                { x: 14, y: 11, type: CELLS.TARGET, rotation: 0 },
                { x: 15, y: 11, type: CELLS.TARGET, rotation: 0 },
                { x: 16, y: 11, type: CELLS.TARGET, rotation: 0 },
                { x: 17, y: 11, type: CELLS.TARGET, rotation: 0 },
                { x: 18, y: 11, type: CELLS.TARGET, rotation: 0 },
                { x: 19, y: 11, type: CELLS.TARGET, rotation: 0 },
            ],
            targets: 8
        },
        "testing": {
            width: 15,
            height: 15,
            placeable: {
                x1: 1,
                y1: 1,
                x2: 13,
                y2: 13
            },
            placed: [
                { x: 3, y: 1, type: CELLS.PUSHER, rotation: 1 },
                { x: 2, y: 1, type: CELLS.PUSHER, rotation: 1 }
            ],
            targets: 999
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
    newMap();
}

/**
 * Moves one step forward
 */
function step() {
    if (animationStart == undefined) {
        for (let cell of placedCells) {
            //Save current state
            if (cell) {
                cell.oldRotation = deepCopy(cell.rotation);
                cell.oldX = deepCopy(cell.x);
                cell.oldY = deepCopy(cell.y);
                cell.hasMoved = false;
            }
        }
        for (let cell of placedCells) {
            //Don't process nonexistent cells, immobile cells, or cells that have just been made
            if (cell && !cell.new && cell.type != CELLS.IMMOBILE) {

                //Check for rotation
                for (let i = -1; i <= 1; i++) {
                    let possibleRotator = getCell(cell.x, cell.y + i);
                    if (i != 0 && possibleRotator && placedCells[possibleRotator] != null && placedCells[possibleRotator].type == CELLS.ROTATOR) {
                        cell.rotation++;
                    }
                }
                for (let i = -1; i <= 1; i++) {
                    let possibleRotator = getCell(cell.x + i, cell.y)
                    if (i != 0 && possibleRotator && placedCells[possibleRotator] != null && placedCells[possibleRotator].type == CELLS.ROTATOR) {
                        cell.rotation++;
                    }
                }

                switch (cell.type) {
                    case CELLS.PUSHER:
                        let pushLoopIndex = 1,
                            toPush = [cell.id],
                            moreCells = true;
                        while (true) {
                            //Get the next cell that we might need to push
                            let nextPush = getCell(cell.x + (getChange(1, cell.rotation) * pushLoopIndex), cell.y + (getChange(0, cell.rotation) * pushLoopIndex));
                            if (nextPush && placedCells[nextPush].type == CELLS.IMMOBILE) {
                                //If the cell is immobile, we dont need to push anything
                                break;
                            } else if (nextPush == undefined || placedCells[nextPush] == null || placedCells[nextPush].type == CELLS.TARGET) {
                                if (nextPush && placedCells[nextPush].type == CELLS.TARGET) {
                                    //If the cell is a target, destroy it and the last cell in toPush
                                    placedCells[nextPush] = null;
                                    placedCells[toPush[toPush.length - 1]] = null;
                                    targetsRemaining--;
                                }
                                //Push every cell in toPush
                                for (let cellPushing of toPush) {
                                    if (placedCells[cellPushing]) {
                                        placedCells[cellPushing].y += getChange(0, cell.rotation);
                                        placedCells[cellPushing].x += getChange(1, cell.rotation);
                                        placedCells[cellPushing].hasMoved = true;
                                    }
                                }
                                break;
                            } else if (placedCells[nextPush].type == CELLS.SLIDE) {
                                if (mod(cell.rotation, 2) == mod(placedCells[nextPush].rotation, 2)) {
                                    break;
                                } else {
                                    toPush.push(nextPush);
                                }
                            } else if (placedCells[nextPush].type == CELLS.PUSHER) {
                                //If the cell is facing the opposite way, we can't push it
                                if (placedCells[nextPush].rotation == mod(cell.rotation + 2, 4)) {
                                    if (placedCells[nextPush].type == CELLS.GENERATOR) {
                                        let possibleDuplication = getCell(placedCells[nextPush].x + getChange(1, cell.rotation), placedCells[nextPush].y + getChange(0, cell.rotation));
                                        if (possibleDuplication) {
                                            break;
                                        } else {
                                            toPush.push(nextPush);
                                        }
                                    } else {
                                        break;
                                    }
                                    //If the cell is a pusher going the same way, we dont need to push it or anything after it
                                } else if (placedCells[nextPush].type == CELLS.PUSHER && placedCells[nextPush].rotation == cell.rotation && placedCells[nextPush].hasMoved) {
                                    moreCells = false;
                                } else {
                                    toPush.push(nextPush);
                                }
                            } else {
                                if (moreCells) {
                                    toPush.push(nextPush);
                                }

                            }
                            pushLoopIndex++;
                        }
                        break;

                    case CELLS.GENERATOR:
                        //Get the cell to duplicate
                        let cellDuplicating = getCell(cell.x - getChange(1, cell.rotation), cell.y - getChange(0, cell.rotation));
                        if (cellDuplicating) {
                            let pushLoopIndex = 1,
                                toPush = [],
                                moreCells = true;
                            while (true) {
                                //Push everything in front
                                let nextPush = getCell(cell.x + (getChange(1, cell.rotation) * pushLoopIndex), cell.y + (getChange(0, cell.rotation) * pushLoopIndex));
                                if (nextPush && placedCells[nextPush].type == CELLS.IMMOBILE) {
                                    break;
                                } else if (nextPush == undefined || placedCells[nextPush] == null || placedCells[nextPush].type == CELLS.TARGET) {
                                    if (nextPush && placedCells[nextPush].type == CELLS.TARGET) {
                                        placedCells[nextPush] = null;
                                        placedCells[toPush[toPush.length - 1]] = null;
                                        targetsRemaining--;
                                    }
                                    for (let cellPushing of toPush) {
                                        if (placedCells[cellPushing]) {
                                            placedCells[cellPushing].y += getChange(0, cell.rotation);
                                            placedCells[cellPushing].x += getChange(1, cell.rotation);
                                            placedCells[cellPushing].hasMoved = true;
                                        }
                                    }
                                    placedCells.push({ oldX: cell.oldX, x: cell.x + getChange(1, cell.rotation), oldY: cell.oldY, y: cell.y + getChange(0, cell.rotation), type: placedCells[cellDuplicating].type, rotation: placedCells[cellDuplicating].rotation, id: placedCells.length, new: true });
                                    break;
                                } else if (placedCells[nextPush].type == CELLS.SLIDE) {
                                    if (mod(cell.rotation, 2) == mod(placedCells[nextPush].rotation, 2)) {
                                        break;
                                    } else {
                                        toPush.push(nextPush);
                                    }
                                } else if (placedCells[nextPush].type == CELLS.PUSHER || placedCells[nextPush].type == CELLS.GENERATOR) {
                                    if (placedCells[nextPush].rotation == mod(cell.rotation + 2, 4)) {
                                        if (placedCells[nextPush].type == CELLS.GENERATOR) {
                                            let possibleDuplication = getCell(placedCells[nextPush].x + getChange(1, cell.rotation), placedCells[nextPush].y + getChange(0, cell.rotation));
                                            if (possibleDuplication) {
                                                break;
                                            } else {
                                                toPush.push(nextPush);
                                            }
                                        } else {
                                            break;
                                        }
                                    } else if (placedCells[nextPush].type == CELLS.PUSHER && placedCells[nextPush].rotation == cell.rotation && placedCells[nextPush].hasMoved) {
                                        moreCells = false;
                                    } else {
                                        toPush.push(nextPush);
                                    }
                                } else {
                                    if (moreCells) {
                                        toPush.push(nextPush);
                                    }
                                }
                                pushLoopIndex++;
                            }
                        }
                        break;

                    default:
                        break;
                }
            } else if (cell && cell.new) {
                //New cells are no longer new
                delete cell.new;
            }
        }
        //Animate everything
        animation = requestAnimationFrame(function (timestamp) {
            animateStep(timestamp);
        });
        //Check if we won
        if (targetsRemaining == 0) {
            playing = false;
            alert("You win!");
            currentLevel++;
            newMap();
        }
        if (playing) {
            while (animationStart != undefined);
            nextStep = setTimeout(() => {
                step();
            }, stepDelay);
        }
    }
}

/**
 * Starts the sim
 */
function play() {
    if (!playing) {
        savedLayout = deepCopy(placedCells);
        playing = true;
        step();
    }
}

/**
 * Resets the map to the most recent used layout
 */
function reset() {
    cancelAnimationFrame(animation);
    animationStart = undefined;
    clearTimeout(nextStep);
    playing = false;
    if (savedLayout[0] !== undefined) {
        placedCells = deepCopy(savedLayout);
        drawMap();
    } else {
        newMap();
    }
}

/**
 * Populates the map with cells
 */
function createMap() {
    for (let i = 0; i < mapHeight; i++) {
        for (let o = 0; o < mapWidth; o++) {
            if (o == 0 || o == mapWidth - 1 || i == 0 || i == mapHeight - 1) {
                placedCells.push({ x: o, y: i, type: CELLS.IMMOBILE, rotation: 0, id: placedCells.length });
            }

            if (LEVELS[currentLevel].cutout) {
                //Remove floating cells
                for (let cell in placedCells) {
                    if (placedCells[cell] && placedCells[cell].y >= LEVELS[currentLevel].cutout.y1 && placedCells[cell].y <= LEVELS[currentLevel].cutout.y2 && placedCells[cell].x >= LEVELS[currentLevel].cutout.x1 && placedCells[cell].x <= LEVELS[currentLevel].cutout.x2) {
                        placedCells[cell] = null;
                    }
                }
            }
        }
    }
    //Add border around the cutout
    if (LEVELS[currentLevel].cutout) {
        for (let i = LEVELS[currentLevel].cutout.y1 - 1; i <= LEVELS[currentLevel].cutout.y2 + 1; i++) {
            for (let o = LEVELS[currentLevel].cutout.x1 - 1; o <= LEVELS[currentLevel].cutout.x2 + 1; o++) {
                if (i > 0 && i < mapHeight && o > 0 && o < mapWidth && (i < LEVELS[currentLevel].cutout.y1 || i > LEVELS[currentLevel].cutout.y2 || o < LEVELS[currentLevel].cutout.x1 || o > LEVELS[currentLevel].cutout.x2)) {
                    placedCells.push({ x: o, y: i, type: CELLS.IMMOBILE, rotation: 0, id: placedCells.length });
                }
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
            drawMapCell(cell.x, cell.y, cell.type, cell.rotation, renderer, true);
        }
    }
}

/**
 * Builds the map with the current level
 */
function newMap() {
    placedCells = [];
    savedLayout = [];
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
    if (LEVELS[currentLevel]) {
        drawBackground();
        createMap();
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
function drawMapCell(x, y, spritePosition, rotation = 0, canvasRenderer, grid = true) {
    if (spritePosition != CELLS.NO_CELL) {
        if (grid) {
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
    return Math.PI / 2 * rotation;
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
function drawBackground() {
    for (let i = 0; i < mapHeight; i++) {
        for (let o = 0; o < mapWidth; o++) {
            if (i >= LEVELS[currentLevel].placeable.y1 && i <= LEVELS[currentLevel].placeable.y2 && o >= LEVELS[currentLevel].placeable.x1 && o <= LEVELS[currentLevel].placeable.x2) {
                drawMapCell(o, i, CELLS.EMPTY_PLACEABLE, 0, backgroundRenderer, true);
            } else {
                if (LEVELS[currentLevel].cutout) {
                    if (i < LEVELS[currentLevel].cutout.y1 || i > LEVELS[currentLevel].cutout.y2 || o < LEVELS[currentLevel].cutout.x1 || o > LEVELS[currentLevel].cutout.x2) {
                        drawMapCell(o, i, CELLS.EMPTY, 0, backgroundRenderer, true);
                    }
                } else {
                    drawMapCell(o, i, CELLS.EMPTY, 0, backgroundRenderer, true);
                }
            }
        }
    }
}

function animateStep(timestamp) {
    if (animationStart == undefined) {
        animationStart = timestamp;
    }
    let elapsed = timestamp - animationStart;

    clearCanvas(renderer);

    let generators = [];
    for (let cell of placedCells) {
        if (cell && cell.type != CELLS.GENERATOR) {
            let xDraw, yDraw, rotationDraw;
            xDraw = (Math.min(Math.max((cell.x - cell.oldX) / animationTime * elapsed, -cellSize), cellSize) + cell.oldX) * cellSize;
            yDraw = (Math.min(Math.max((cell.y - cell.oldY) / animationTime * elapsed, -cellSize), cellSize) + cell.oldY) * cellSize;
            if (cell.oldRotation != undefined) {
                rotationDraw = Math.min(Math.max((cell.rotation - cell.oldRotation) / animationTime * elapsed, 0), 4) + cell.oldRotation;
            } else {
                rotationDraw = cell.rotation;
            }
            drawMapCell(xDraw, yDraw, cell.type, rotationDraw, renderer, false);
        } else if (cell && cell.type == CELLS.GENERATOR) {
            generators.push(cell);
        }
    }
    //Render generators on top
    for (let cell of generators) {
        let xDraw, yDraw, rotationDraw;
        xDraw = (Math.min(Math.max((cell.x - cell.oldX) / animationTime * elapsed, -cellSize), cellSize) + cell.oldX) * cellSize;
        yDraw = (Math.min(Math.max((cell.y - cell.oldY) / animationTime * elapsed, -cellSize), cellSize) + cell.oldY) * cellSize;
        if (cell.oldRotation != undefined) {
            rotationDraw = Math.min(Math.max((cell.rotation - cell.oldRotation) / animationTime * elapsed, 0), 4) + cell.oldRotation;
        } else {
            rotationDraw = cell.rotation;
        }
        drawMapCell(xDraw, yDraw, cell.type, rotationDraw, renderer, false);
    }


    if (elapsed <= animationTime) {
        animation = requestAnimationFrame(function (timestamp) {
            animateStep(timestamp);
        });
    } else {
        animationStart = undefined;
        drawMap();
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
    if (!playing && mapPos.x >= LEVELS[currentLevel].placeable.x1 && mapPos.y >= LEVELS[currentLevel].placeable.y1 && mapPos.x <= LEVELS[currentLevel].placeable.x2 && mapPos.y <= LEVELS[currentLevel].placeable.y2) {
        cellHeld = getCell(mapPos.x, mapPos.y);
        if (cellHeld && placedCells[cellHeld] != null && placedCells[cellHeld].type != CELLS.IMMOBILE) {
            cellHeld = deepCopy(placedCells[cellHeld]);
            placedCells[cellHeld.id].type = CELLS.NO_CELL;
            dragOffset.x = mousePos.x - (mapPos.x * cellSize);
            dragOffset.y = mousePos.y - (mapPos.y * cellSize);
            drawMap();
            clearCanvas(draggingRenderer);
            drawMapCell(mousePos.x - dragOffset.x, mousePos.y - dragOffset.y, cellHeld.type, cellHeld.rotation, draggingRenderer, false);
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
        if (mapPos.x >= LEVELS[currentLevel].placeable.x1 && mapPos.y >= LEVELS[currentLevel].placeable.y1 && mapPos.x <= LEVELS[currentLevel].placeable.x2 && mapPos.y <= LEVELS[currentLevel].placeable.y2 && !getCell(mapPos.x, mapPos.y)) {
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
        drawMapCell(mousePos.x - dragOffset.x, mousePos.y - dragOffset.y, cellHeld.type, cellHeld.rotation, draggingRenderer, false);
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
 * Gets the x or y change for a rotation id
 */
function getChange(direction, rotation) {
    switch (mod(rotation, 4)) {
        case 0:
            if (direction == 0) {
                return -1;
            } else {
                return 0;
            }
        case 1:
            if (direction == 0) {
                return 0;
            } else {
                return 1;
            }
        case 2:
            if (direction == 0) {
                return 1;
            } else {
                return 0;
            }
        case 3:
            if (direction == 0) {
                return 0;
            } else {
                return -1;
            }
    }
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