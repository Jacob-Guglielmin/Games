"use strict";

let canvas = document.getElementById("mainCanvas"),
    renderer = canvas.getContext("2d"),
    draggingCanvas = document.getElementById("draggingCanvas"),
    draggingRenderer = draggingCanvas.getContext("2d"),
    backgroundCanvas = document.getElementById("backgroundCanvas"),
    backgroundRenderer = backgroundCanvas.getContext("2d"),
    buttonCanvas = document.getElementById("buttonCanvas"),
    buttonRenderer = buttonCanvas.getContext("2d"),

    cellSize = 30,

    placedCells = [],
    targetsRemaining = 1,
    currentLevel = 1,

    savedLayout = [],
    started = false,

    mapWidth,
    mapHeight,
    canvasOffsetX,
    canvasOffsetY,

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
    BUTTONS = {
        PLAY: 0,
        PAUSE: 60,
        RESET: 120,
        STEP: 180,
        NEXT: 240
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
                Cell(2, 2, 1, "PUSHER"),
                Cell(8, 3, 0, "TARGET")
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
                Cell(7, 3, 0, "TARGET"),
                Cell(8, 3, 0, "TARGET"),
                Cell(9, 3, 0, "TARGET"),
                Cell(1, 5, 1, "PUSHER"),
                Cell(4, 1, 1, "PASSIVE"),
                Cell(2, 2, 1, "PASSIVE"),
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
                Cell(8, 3, 0, "TARGET"),
                Cell(2, 2, 0, "PUSHER"),
                Cell(3, 4, 0, "ROTATOR")
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
                Cell(7, 3, 0, "TARGET"),
                Cell(8, 3, 0, "TARGET"),
                Cell(9, 3, 0, "TARGET"),
                Cell(2, 3, 1, "GENERATOR"),
                Cell(4, 2, 1, "PASSIVE")
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
                Cell(2, 9, 1, "PUSHER"),
                Cell(3, 9, 1, "SLIDE"),
                Cell(7, 3, 2, "PUSHER"),
                Cell(4, 2, 2, "PUSHER"),
                Cell(2, 4, 0, "PASSIVE"),
                Cell(6, 2, 0, "PASSIVE"),
                Cell(18, 9, 0, "TARGET"),
                Cell(19, 9, 0, "TARGET"),
            ],
            targets: 2
        },
        6: {
            width: 17,
            height: 5,
            placeable: {
                x1: 7,
                y1: 1,
                x2: 9,
                y2: 3
            },
            placed: [
                Cell(9, 2, 0, "ROTATOR"),
                Cell(7, 3, 2, "GENERATOR"),
                Cell(2, 2, 0, "TARGET"),
                Cell(14, 2, 0, "TARGET")
            ],
            targets: 2
        },
        7: {
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
                Cell(1, 1, 1, "PUSHER"),
                Cell(3, 5, 1, "SLIDE"),
                Cell(5, 4, 2, "PUSHER"),
                Cell(4, 2, 2, "PUSHER"),
                Cell(2, 3, 0, "PASSIVE"),
                Cell(9, 14, 0, "TARGET"),
            ],
            targets: 1
        },
        8: {
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
                Cell(2, 9, 1, "GENERATOR"),
                Cell(4, 11, 1, "GENERATOR"),
                Cell(3, 8, 0, "GENERATOR"),
                Cell(1, 11, 0, "PASSIVE"),
                Cell(9, 1, 0, "TARGET"),
                Cell(10, 1, 0, "TARGET"),
                Cell(11, 1, 0, "TARGET"),
                Cell(12, 1, 0, "TARGET"),
                Cell(13, 1, 0, "TARGET"),
                Cell(14, 1, 0, "TARGET"),
                Cell(15, 1, 0, "TARGET"),
                Cell(16, 1, 0, "TARGET"),
            ],
            targets: 8
        },
        9: {
            width: 22,
            height: 14,
            placeable: {
                x1: 1,
                y1: 1,
                x2: 8,
                y2: 5
            },
            placed: [
                Cell(1, 3, 1, "GENERATOR"),
                Cell(3, 5, 0, "SLIDE"),
                Cell(6, 1, 1, "PUSHER"),
                Cell(5, 4, 1, "PUSHER"),
                Cell(5, 1, 2, "PUSHER"),
                Cell(2, 9, 1, "GENERATOR"),
                Cell(1, 9, 0, "SLIDE"),
                Cell(3, 9, 0, "SLIDE"),
                Cell(1, 8, 0, "IMMOBILE"),
                Cell(2, 8, 0, "IMMOBILE"),
                Cell(3, 8, 0, "IMMOBILE"),
                Cell(12, 11, 0, "TARGET"),
                Cell(13, 11, 0, "TARGET"),
                Cell(14, 11, 0, "TARGET"),
                Cell(15, 11, 0, "TARGET"),
                Cell(16, 11, 0, "TARGET"),
                Cell(17, 11, 0, "TARGET"),
                Cell(18, 11, 0, "TARGET"),
                Cell(19, 11, 0, "TARGET")
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
                Cell(3, 1, 0, "ROTATOR"),
                Cell(2, 1, 0, "ROTATOR"),
                Cell(4, 1, 2, "GENERATOR"),
                Cell(4, 2, 3, "GENERATOR"),
                Cell(6, 1, 0, "GENERATOR"),
                Cell(5, 2, 1, "GENERATOR"),
                Cell(5, 1, 2, "GENERATOR"),
                Cell(6, 2, 3, "GENERATOR")
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

function Cell(xPos, yPos, startingRotation, cellType) {
    return { x: xPos, y: yPos, rotation: startingRotation, type: CELLS[cellType] };
}

/**
 * Starts the game
 */
function init() {
    //Sets the canvas size
    canvas.width = 840;
    canvas.height = 690;
    backgroundCanvas.width = canvas.width;
    backgroundCanvas.height = canvas.height;
    draggingCanvas.width = canvas.width;
    draggingCanvas.height = canvas.height;
    buttonCanvas.width = canvas.width;
    buttonCanvas.height = canvas.height;
    document.getElementById("background").style.width = (canvas.width + 20) + "px";
    document.getElementById("background").style.height = (canvas.height + 20) + "px";

    newMap();
}

/**
 * Moves one step forward
 */
function step() {
    if (animationStart == undefined) {
        if (!started) {
            savedLayout = deepCopy(placedCells);
            started = true;
        }
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
            //Don't process nonexistent cells, immobile cells, targets, or cells that have just been made
            if (cell && !cell.new && cell.type != CELLS.IMMOBILE && cell.type != CELLS.TARGET) {

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
            drawButtons();
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
 * Toggles the sim
 */
function playToggle() {
    if (!playing) {
        playing = true;
        step();
    } else {
        clearTimeout(nextStep);
        playing = false;
    }
    drawButtons();
}

/**
 * Resets the map to the most recent used layout
 */
function reset() {
    cancelAnimationFrame(animation);
    animationStart = undefined;
    clearTimeout(nextStep);
    playing = false;
    started = false;
    drawButtons();
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
    playing = false;
    clearTimeout(nextStep);
    cancelAnimationFrame(animation);
    animationStart = undefined;

    //Removes the cells
    placedCells = [];
    savedLayout = [];

    started = false;

    if (LEVELS[currentLevel]) {
        //Sets the size of the map in cells
        mapWidth = LEVELS[currentLevel].width;
        mapHeight = LEVELS[currentLevel].height;

        //Moves the map to the center of the canvas
        canvasOffsetY = (canvas.height - (mapHeight * cellSize)) / 2;
        canvasOffsetX = (canvas.width - (mapWidth * cellSize)) / 2;
        drawBackground();
        createMap();
        drawButtons();
    } else {
        clearCanvas(backgroundRenderer);
        clearCanvas(renderer);
        clearCanvas(buttonRenderer);
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
function drawMapCell(x, y, spritePosition, rotation = 0, canvasRenderer, grid = true, absolute = false) {
    if (spritePosition != CELLS.NO_CELL) {
        if (grid) {
            x *= cellSize;
            y *= cellSize;
        }
        if (!absolute) {
            x += canvasOffsetX;
            y += canvasOffsetY;
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

function drawButtons() {
    //Clear the buttons
    clearCanvas(buttonRenderer);

    //Draw the play/pause button, and step button if paused
    if (playing) {
        buttonRenderer.drawImage(document.getElementById("buttons"), BUTTONS.PAUSE, 0, 60, 60, 0, canvas.height - 60, 60, 60);
    } else {
        buttonRenderer.drawImage(document.getElementById("buttons"), BUTTONS.STEP, 0, 60, 60, 0, canvas.height - 130, 60, 60);
        buttonRenderer.drawImage(document.getElementById("buttons"), BUTTONS.PLAY, 0, 60, 60, 0, canvas.height - 60, 60, 60);
    }

    //Draw the reset button
    buttonRenderer.drawImage(document.getElementById("buttons"), BUTTONS.RESET, 0, 60, 60, 70, canvas.height - 60, 60, 60);

    //Draw the next button if the level is over
    if (targetsRemaining == 0) {
        buttonRenderer.drawImage(document.getElementById("buttons"), BUTTONS.NEXT, 0, 120, 60, canvas.width - 120, canvas.height - 60, 120, 60);
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
    clearCanvas(backgroundRenderer);
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
    let mousePos = getMousePos(evt);

    mousePos.x -= canvasOffsetX;
    mousePos.y -= canvasOffsetY;

    let mapPos = { x: Math.floor(mousePos.x / cellSize), y: Math.floor(mousePos.y / cellSize) };

    if (!started && mapPos.x >= LEVELS[currentLevel].placeable.x1 && mapPos.y >= LEVELS[currentLevel].placeable.y1 && mapPos.x <= LEVELS[currentLevel].placeable.x2 && mapPos.y <= LEVELS[currentLevel].placeable.y2) {
        //Grab a cell
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
    } else if (mousePos.x + canvasOffsetX >= 0 && mousePos.y + canvasOffsetY >= (canvas.height - 60) && mousePos.x + canvasOffsetX <= 60 && mousePos.y + canvasOffsetY <= canvas.height) {
        //Play/pause button
        playToggle();
    } else if (mousePos.x + canvasOffsetX >= 70 && mousePos.y + canvasOffsetY >= (canvas.height - 60) && mousePos.x + canvasOffsetX <= 130 && mousePos.y + canvasOffsetY <= canvas.height) {
        //Reset button
        reset();
    } else if (!playing && mousePos.x + canvasOffsetX >= 0 && mousePos.y + canvasOffsetY >= (canvas.height - 130) && mousePos.x + canvasOffsetX <= 60 && mousePos.y + canvasOffsetY <= (canvas.height - 70)) {
        //Step button
        step();
    } else if (targetsRemaining == 0 && mousePos.x + canvasOffsetX >= canvas.width - 120 && mousePos.y + canvasOffsetY >= canvas.height - 60 && mousePos.x + canvasOffsetX <= canvas.width && mousePos.y + canvasOffsetY <= canvas.height) {
        currentLevel++;
        newMap();
    }
}, false);

draggingCanvas.addEventListener('mouseup', function (evt) {
    mouseDown = false;
    if (cellHeld) {
        let mousePos = getMousePos(evt);

        mousePos.x -= canvasOffsetX;
        mousePos.y -= canvasOffsetY;

        let mapPos = { x: Math.floor((mousePos.x - dragOffset.x + Math.floor(cellSize / 2)) / cellSize), y: Math.floor((mousePos.y - dragOffset.y + Math.floor(cellSize / 2)) / cellSize) };
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
        mousePos.x -= canvasOffsetX;
        mousePos.y -= canvasOffsetY;
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
    if (imagesLoaded >= images) {
        clearInterval(loadInterval);
        init();
    }
}, 10);