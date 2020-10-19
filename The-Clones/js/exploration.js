"use strict";
//Initialize variables
var zone = 0,
row = 0,
cell = 0,
army = {
    health: 0,
    maxHealth: 50,
    attack: undefined,
    averageAttack: undefined,
    minAttack: undefined,
    maxAttack: undefined,
    clones: 1
},
enemy = {
    health: 0,
    maxHealth: 1,
    attack: undefined,
    averageAttack: undefined,
    minAttack: undefined,
    maxAttack: undefined,
    fast: false
},
fighting = false,
autoFight = false,
battleGrid = document.getElementById("battleGrid"),
armyHealthBar = document.getElementById("armyHealthBar"),
armyHealthDisplay = document.getElementById("armyHealth"),
enemyHealthBar = document.getElementById("enemyHealthBar"),
enemyHealthDisplay = document.getElementById("enemyHealth"),
ready = false;

/**
 * Sets up values on the screen
 */
function init() {
    populateGrid();
    calculateArmyStats();
    calculateDamage(true);
    createEnemy();
    calculateDamage(false);
    updateBattleValues();
    ready = true;
}

/**
 * Updates the information in the battle screen
 */
function updateBattleValues() {
    document.getElementById("armySize").innerHTML = army.clones + " Clone" + (army.clones > 1 ? "s" : "");
    document.getElementById("zoneNumber").innerHTML = "Zone " + zone;
    armyHealthDisplay.innerHTML = army.health + "/" + army.maxHealth;
    enemyHealthDisplay.innerHTML = enemy.health + "/" + enemy.maxHealth;
    armyHealthBar.style.width = ((army.health / army.maxHealth) * 100) + "%";
    enemyHealthBar.style.width = ((enemy.health / enemy.maxHealth) * 100) + "%";
}

/**
 * Processes the current attack for the army and the enemy
 */
function processBattleTick() {
    if (fighting) {
        if (army.health > 0) {
            enemy.attack = random(enemy.minAttack, enemy.maxAttack);
            army.attack = random(army.minAttack, army.maxAttack);
            if (enemy.fast) {
                army.health -= enemy.attack;
                if (army.health > 0) {
                    enemy.health -= army.attack;
                    if (enemy.health <= 0) {
                        nextCell();
                    }
                } else {
                    army.health = 0;
                    fighting = false;
                }
            } else {
                enemy.health -= army.attack;
                if (enemy.health > 0) {
                    army.health -= enemy.attack;
                    if (army.health <= 0) {
                        army.health = 0;
                        fighting = false;
                    }
                } else {
                    nextCell();
                }
            }
            if (autoFight && !fighting && window.clones.available >= army.clones) {
                calculateArmyStats();
                window.clones.available -= army.clones;
                fighting = true;
            }
        } else {
            army.health = army.maxHealth;
        }
        updateBattleValues();
    }
}

/**
 * Moves to the next cell, row or zone as required and creates an enemy
 */
function nextCell() {
    //Advance the location variables and update the map
    battleGrid.children[row].children[cell].classList.add("battleCellBeaten");

    giveRewards();
    
    if (cell < 9) {
        cell++;
    } else {
        if (row < 9) {
            row++;
            cell = 0;
        } else {
            zone++;
            row = 0;
            cell = 0;
            populateGrid();
            updateBattleValues();
        }
    }
    battleGrid.children[row].children[cell].classList.add("battleCellOn");

    //Create an enemy
    createEnemy();
    calculateDamage(false);
}

/**
 * Deletes and re-creates the battle table and all of its cells
 */
function populateGrid() {
    //Delete battle grid
    while (battleGrid.firstChild) {
        battleGrid.removeChild(battleGrid.lastChild);
    }

    let row = undefined,
    cell = undefined;

    //Create all of the cells
    for (let i = 0; i < 10; i++) {
        row = battleGrid.insertRow(i);
        for (let o = 0; o < 10; o++) {
            cell = row.insertCell(o);
            cell.classList.add("battleCell");
        }
    }

    //Insert icons
    addLocations();
}

/**
 * Adds all glyphicons and rewards to the correct cells in the grid
 */
function addLocations() {
    //Add important drops that are unique
    if (MAP_LOCATIONS.zones["zone" + zone]) {
        for (let i = 0; i < MAP_LOCATIONS.zones["zone" + zone].length; i++) {
            let icon = document.createElement("span");
            if (MAP_LOCATIONS.zones["zone" + zone][i][2].includes("glyphicon")) {
                icon.classList.add("glyphicon", MAP_LOCATIONS.zones["zone" + zone][i][2]);
            } else {
                icon.classList.add("icomoon", MAP_LOCATIONS.zones["zone" + zone][i][2]);
            }
            icon.title = MAP_LOCATIONS.zones["zone" + zone][i][5];
            battleGrid.children[MAP_LOCATIONS.zones["zone" + zone][i][0]].children[MAP_LOCATIONS.zones["zone" + zone][i][1]].appendChild(icon);
        }
    }

    //Add important drops that happen every zone
    for (let dropName in MAP_LOCATIONS.repeated) {
        if ((MAP_LOCATIONS.repeated[dropName].start) <= zone && ((zone - MAP_LOCATIONS.repeated[dropName].start) % MAP_LOCATIONS.repeated[dropName].repeat) == 0) {
            let icon = document.createElement("span");
            if (MAP_LOCATIONS.repeated[dropName].icon.includes("glyphicon")) {
                icon.classList.add("glyphicon", MAP_LOCATIONS.repeated[dropName].icon);
            } else {
                icon.classList.add("icomoon", MAP_LOCATIONS.repeated[dropName].icon);
            }
            icon.title = dropName.charAt(0).toUpperCase() + dropName.slice(1);
            battleGrid.children[MAP_LOCATIONS.repeated[dropName].row].children[MAP_LOCATIONS.repeated[dropName].col].appendChild(icon);
        }
    }

    //Add resource drops
    for (let resource in MAP_LOCATIONS.resources) {
        for (let i = 0; i < MAP_LOCATIONS.resources[resource].amount; i++) {            
            let row = undefined;
            let col = undefined;
            while (true) {
                let location = random(0, 99);
                row = Math.floor(location / 10);
                col = location - (row * 10);
                if (!battleGrid.children[row].children[col].firstChild) {
                    break;
                }
            }
            let icon = document.createElement("span");
            if (MAP_LOCATIONS.resources[resource].icon.includes("glyphicon")) {
                icon.classList.add("glyphicon", MAP_LOCATIONS.resources[resource].icon);
            } else {
                icon.classList.add("icomoon", MAP_LOCATIONS.resources[resource].icon);
            }
            icon.title = resource.charAt(0).toUpperCase() + resource.slice(1);
            battleGrid.children[row].children[col].appendChild(icon);
        }
    }
}

/**
 * Give the reward (if any) for the cell
 */
function giveRewards() {
    let rewardGiven = false;
    //Check if a unique upgrade should be made available
    if (MAP_LOCATIONS.zones["zone" + zone]) {
        for (let i = 0; i < MAP_LOCATIONS.zones["zone" + zone].length; i++) {
            if (MAP_LOCATIONS.zones["zone" + zone][i][0] == row && MAP_LOCATIONS.zones["zone" + zone][i][1] == cell) {
                if (window.purchases.hasOwnProperty(MAP_LOCATIONS.zones["zone" + zone][i][3])) {
                    window.purchases[MAP_LOCATIONS.zones["zone" + zone][i][3]].available++;
                    window.updatePurchaseValues();
                    window.addStory(MAP_LOCATIONS.zones["zone" + zone][i][4]);
                    rewardGiven = true;
                    break;
                }
            }
        }
    }

    //Check if a repeating upgrade should be made available
    if (!rewardGiven && battleGrid.children[row].children[cell].firstChild && window.purchases.hasOwnProperty(battleGrid.children[row].children[cell].children[0].title.charAt(0).toLowerCase() + battleGrid.children[row].children[cell].children[0].title.slice(1))) {
        window.purchases[battleGrid.children[row].children[cell].children[0].title.charAt(0).toLowerCase() + battleGrid.children[row].children[cell].children[0].title.slice(1)].available++;
    }

    //Check if a resource should be given
    else if (!rewardGiven && battleGrid.children[row].children[cell].firstChild && window.resources.hasOwnProperty(battleGrid.children[row].children[cell].children[0].title.charAt(0).toLowerCase() + battleGrid.children[row].children[cell].children[0].title.slice(1))) {
        window.resources[battleGrid.children[row].children[cell].children[0].title.charAt(0).toLowerCase() + battleGrid.children[row].children[cell].children[0].title.slice(1)].total += 10;
    }
}

/**
 * Calculates the army attack and health
 */
function calculateArmyStats() {
    let dmg = 6;
    dmg *= army.clones;
    army.averageAttack = Math.ceil(dmg);

    let mhp = 50;
    mhp *= army.clones;
    army.maxHealth = Math.ceil(mhp);
}

/**
 * Calculates the enemy attack and health
 */
function createEnemy() {
    //Calculate average attack
    let dmg = 50 * Math.sqrt(zone + 1) * Math.pow(3.25, ((zone + 1) / 2));
    dmg -= 10;
    if (zone == 0) {
        dmg *= 0.3;
        dmg = (dmg * 0.25) + ((dmg * 0.75) * (((row * 10) + cell + 1) / 100));
    } else if (zone == 1) {
        dmg *= 0.5;
        dmg = (dmg * 0.3) + ((dmg * 0.75) * (((row * 10) + cell + 1) / 100));
    } else {
        dmg = (dmg * 0.4) + ((dmg * 0.7) * (((row * 10) + cell + 1) / 100));
    }
    enemy.averageAttack = Math.floor(dmg);

    //Calculate health
    let hp = 130 * Math.sqrt(zone + 1) * Math.pow(3.25, ((zone + 1) / 2));
    hp -= 110;
    if (zone < 10) {
        hp *= 0.6;
        hp = (hp * 0.25) + ((hp * 0.75) * (((row * 10) + cell + 1) / 100));
    } else {
        hp = (hp * 0.4) + ((hp * 0.4) * (((row * 10) + cell + 1) / 110)); 
    }
    enemy.maxHealth = Math.floor(hp);
    enemy.health = enemy.maxHealth;
}

/**
 * Calculates the range of damage values that can be dealt
 * 
 * @param {boolean} isArmy Whether the damage calculation is for the enemy or the army
 */
function calculateDamage(isArmy) {
    let defaultFluctuation = 0.2;
    
    if (isArmy) {
        //Calculate clone damage
        army.minAttack = Math.floor(army.averageAttack * (1 - defaultFluctuation));
        army.maxAttack = Math.ceil(army.averageAttack + (army.averageAttack * defaultFluctuation));
        
        document.getElementById("armyDamage").innerHTML = army.minAttack + "-" + army.maxAttack + " Damage";
    } else {
        //Calculate enemy damage
        enemy.minAttack = Math.floor(enemy.averageAttack * (1 - defaultFluctuation));
        enemy.maxAttack = Math.ceil(enemy.averageAttack + (enemy.averageAttack * defaultFluctuation));

        document.getElementById("enemyDamage").innerHTML = enemy.minAttack + "-" + enemy.maxAttack + " Damage";
    }
}

/**
 * Toggles the autofight setting on and off
 */
function toggleAutoFight() {
    autoFight = !autoFight;
    if (autoFight) {
        document.getElementById("autofightButton").style.backgroundColor = "#090";
        document.getElementById("autofightButton").innerHTML = "Autofight On";
    } else {
        document.getElementById("autofightButton").style.backgroundColor = "#f11";
        document.getElementById("autofightButton").innerHTML = "Autofight Off";
    }
}

init();