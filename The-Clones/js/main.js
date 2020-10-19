"use strict";
/**
 * The Clones 
 * 
 * Jacob Guglielmin
 */

const version = 0.3;

//Declare variables
var trackers, resources, purchases, clones, revealed;

/**
 * Resets all variables. **THIS IS A HARD RESET**
 */
function resetVariables() {
    //Initialize Variables
    trackers = {
        actions: {
            counter: 0,
            //DEVONLY Set to 10
            required: 10,
            actioning: 0,
            canAction: true
        },
        wait: {
            time: 0,
            counter: 0,
            waiting: false
        },
        cloning: {
            required: 15,
            counter: 0,
            canClone: true
        }
    },
    resources = {
        power: {
            total: 0,
            net: 0,
            max: 100,
            increment: 1
        },
        food: {
            total: 0,
            net: 0,
            max: 100,
            increment: 1
        },
        metal: {
            total: 0,
            net: 0,
            max: 100,
            increment: 1
        },
        science: {
            total: 0,
            net: 0,
            increment: 1
        }
    },
    purchases = {
        //Story-based purchases
        generator: {
            owned: 0,
            benefitType: "story once",
            requires: {
                metal: 50
            }
        },
        spear: {
            owned: 0,
            benefitType: "story once",
            requires: {
                metal: 20
            }
        },
        escape: {
            owned: 0,
            benefitType: "story once",
            requires: {
                science: 75
            }
        },
        explosive: {
            owned: 0,
            benefitType: "story once",
            requires: {
                science: 50,
                metal: 50
            }
        },
        plans: {
            owned: 0,
            benefitType: "story once",
            requires: {
                science: 100,
                food: 20,
                metal: 20,
            }
        },


        //Buildings

        //Storages
        crate: {
            owned: 0,
            benefit: 50,
            benefitType: "storage metal",
            requires: {
                metal: 25
            }
        },
        shed: {
            owned: 0,
            benefit: 50,
            benefitType: "storage food",
            requires: {
                food: 25
            }
        },


        //Upgrades

        //Job upgrades
        miners: {
            owned: 0,
            available: 0,
            benefitType: "upgrade once",
            requires: {
                science: 50,
                metal: 20
            }
        },
        engineers: {
            owned: 0,
            available: 0,
            benefitType: "upgrade once",
            requires: {
                science: 50,
                metal: 30
            }
        },
        speedfarming: {
            owned: 0,
            available: 0,
            benefitType: "upgrade",
            requires: {
                science: 50,
                food: 50
            }
        },
        speedmining: {
            owned: 0,
            available: 0,
            benefitType: "upgrade",
            requires: {
                science: 50,
                metal: 50
            }
        },
        speedscience: {
            owned: 0,
            available: 0,
            benefitType: "upgrade",
            requires: {
                science: 100,
                food: 20
            }
        },

        //Equipment/battle upgrades
        scouts: {
            owned: 0,
            available: 0,
            benefitType: "upgrade once",
            requires: {
                science: 100,
                food: 50
            }
        },
        organization: {
            owned: 0,
            available: 0,
            benefitType: "upgrade",
            requires: {
                science: 20,
                food: 50,
                metal: 50
            }
        }
    },
    clones = {
        total: 0,
        unemployed: 0,
        available: 0,
        powerRequirement: 1,
        farmer: {
            total: 0,
            benefit: 1,
            requires: {
                food: 20
            }
        },
        miner: {
            total: 0,
            benefit: 0.5,
            requires: {
                food: 10,
                metal: 10,
            }
        },
        researcher: {
            total: 0,
            benefit: 0.2,
            requires: {
                science: 10
            }
        },
        engineer: {
            total: 0,
            benefit: 0.3,
            requires: {
                metal: 10,
                science: 10
            }
        }
    },
    revealed = {
        //Story-based
        metal: false,
        hideGenerator: false,
        spear: false,
        hideSpear: false,
        science: false,
        cloning: false,
        upgrades: false,
        explosive: false,
        food: false,
        plans: false,
        exploration: false,
        miners: false,
        autoFight: false,

        //Other
        metalStorage: false
    };
}
resetVariables();

//These variables dont need to be reset on game reset
var storyDisplayed = "",
storyContainer = document.getElementById('story'),

autoSaveCounter = 0,

battleCounter = 0,

storyTask = undefined,
startTask = undefined;

/**
 * Initializes the game
 */
function init() {
    addStory(0);
    storyTask = true;
    load("localStorage");
    updateResourceValues();
    updatePurchaseValues();
    updateCloneValues();
    startTask = setInterval(() => {
        if (ready) {
            clearInterval(startTask);
            document.getElementById("page").classList.remove("hidden");
            setTimeout(() => {
                addStory(1);
                document.getElementById("actionContainer").classList.remove("hidden");
            }, 3000);
            if (storyTask) {
                setInterval(() => {
                    tick();
                }, 100);
            }
        }
    }, 50);
}


/**
 * Main game loop - gets run every tenth of a second
 */
function tick() {

    //Increment resources from workers
    for (let resource in resources) {
        if (!resources[resource].max || resources[resource].total + resources[resource].net/10 <= resources[resource].max) {
            resources[resource].total += resources[resource].net/10;
        } else if (resources[resource].total < resources[resource].max) {
            resources[resource].total = resources[resource].max;
        }
        if (!revealed.cloningStory && resource == "science" && resources[resource].total >= 50) {
            reveal(5);
        }
        if (!revealed.miners && resource == "food" && resources[resource].total >= 50) {
            reveal(8);
        }
    }

    //Increment the battle counter and process a tick
    battleCounter++;
    //DEVONLY Set to 7
    if (battleCounter >= 7) {
        processBattleTick();
        battleCounter = 0;
    }

    //If we are waiting for something, wait for it
    if (trackers.wait.time != 0 && trackers.wait.waiting) {
        trackers.wait.counter++;
        document.getElementById("actionProgressBar").style.width = (Math.floor(trackers.wait.counter/(trackers.wait.time*10)*100)) + "%";
        if (trackers.wait.counter >= (trackers.wait.time*10)) {
            trackers.wait.time = 0;
            trackers.wait.counter = 0;
            trackers.wait.waiting = false;
            action(true);
        }
    }
    
    updateTooltip();
    updateResourceValues();
    updateCloneValues();
    updatePurchaseValues();

    autoSaveCounter++;
    if (autoSaveCounter >= 600) {
        save("localStorage");
        autoSaveCounter = 0;
    }
}

/**
 * Updates the total resources in the HTML
 */
function updateResourceValues() {
    for (let resource in resources) {
        document.getElementById(resource + "Total").innerHTML = Math.floor(resources[resource].total);
        document.getElementById(resource + "Net").innerHTML = resources[resource].net;
        if (resources[resource].max) {
            document.getElementById(resource + "Max").innerHTML = resources[resource].max;
        }
    }
    if (clones.powerRequirement > resources.power.total) {
        document.getElementById("cloneButton").disabled = true;
    } else {
        document.getElementById("cloneButton").disabled = false;
    }
}

/**
 * Calculates the net total for all resources
 */
function calculateNetResources() {
    resources.food.net = Math.round((clones.farmer.total * clones.farmer.benefit) * 10) / 10;
    resources.metal.net = Math.round((clones.miner.total * clones.miner.benefit) * 10) / 10;
    resources.science.net = Math.round((clones.researcher.total * clones.researcher.benefit) * 10) / 10;
    resources.power.net = Math.round((clones.engineer.total * clones.engineer.benefit) * 10) / 10;
}

/**
 * Updates the values of all of the purchases in the HTML
 */
function updatePurchaseValues() {

    //Iterate through all purchases
    for (let item in purchases) {
        //Check if button should be visible for upgrades
        if (purchases[item].hasOwnProperty("available")) {
            if (purchases[item].available >= 1) {
                document.getElementById(item + "Button").classList.remove("hidden");
            } else {
                document.getElementById(item + "Button").classList.add("hidden");
            }
        }
        
        //Update button text
        let buttonText = item.charAt(0).toUpperCase() + item.slice(1);
        if (!purchases[item].benefitType.includes("once")) {
            buttonText += "<br>" + purchases[item].owned;
        }
        document.getElementById(item + "Button").innerHTML = buttonText;
        
        //Iterate through required resources and check each one
        let enabled = true;
        for (let resource in purchases[item].requires) {
            if (resources[resource].total < purchases[item].requires[resource]) {
                enabled = false;
            }
        }

        //Disable or enable button
        if (enabled) {
            document.getElementById(item + "Button").classList.remove("disabled");
        } else {
            document.getElementById(item + "Button").classList.add("disabled");
        }
    }

}

/**
 * Updates the values for clones in the HTML
 */
function updateCloneValues() {

    document.getElementById("totalClones").innerHTML = clones.total;
    document.getElementById("unemployedClones").innerHTML = clones.unemployed;

    for (let clone in clones) {
        if (clone != "total" && clone != "unemployed" && clone != "available" && clone != "powerRequirement") {
            document.getElementById(clone + "Button").innerHTML = clone.charAt(0).toUpperCase() + clone.slice(1) + "<br>" + clones[clone].total;
            
            let isEnabled = true;
            for (let resource in clones[clone].requires) {
                if (resources[resource].total < clones[clone].requires[resource]) {
                    isEnabled = false;
                }
            }
            if (isEnabled && clones.unemployed == 0) {
                isEnabled = false;
            }
            if (isEnabled) {
                document.getElementById(clone + "Button").classList.remove("disabled");
            } else {
                document.getElementById(clone + "Button").classList.add("disabled");
            }
        }
    }
}

/**
 * Adds to the resource total for whichever resource button is clicked
 * 
 * @param {string} resource the resource to increment
 */
function incrementResource(resource) {
    if (!resources[resource].max || resources[resource].total < resources[resource].max) {
        if (!resources[resource].max || resources[resource].total + resources[resource].increment < resources[resource].max) {
            resources[resource].total += resources[resource].increment;
        } else {
            resources[resource].total = resources[resource].max;
            if (!revealed.metalStorage && resource == "metal") {
                reveal(1);
            } else if (!revealed.foodStorage && resource == "food") {
                reveal(7);
            }
        }
        if (!revealed.cloningStory && resource == "science" && resources[resource].total >= 50) {
            reveal(5);
        } else if (!revealed.miners && resource == "food" && resources[resource].total >= 50) {
            reveal(8);
        }
        updateResourceValues();
        updatePurchaseValues();
        updateCloneValues();
    }
}

/**
 * Increments cloning and creates clones using power
 */
function makeClone() {
    if (trackers.cloning.canClone && resources.power.total >= clones.powerRequirement) {
        trackers.cloning.counter++;
        resources.power.total -= clones.powerRequirement;
        updateResourceValues();
        document.getElementById("cloningProgressBar").style.width = (Math.floor(trackers.cloning.counter/trackers.cloning.required*100))+"%";
        if (trackers.cloning.counter >= trackers.cloning.required) {
            trackers.cloning.canClone = false;
            setTimeout(() => {
                trackers.cloning.counter = 0;
                document.getElementById("cloningProgressBar").style.width = (Math.floor(trackers.cloning.counter/trackers.cloning.required*100))+"%";
                clones.total++;
                if (clones.total % 2 == 1) {
                    clones.unemployed++;
                } else {
                    clones.available++;
                }
                updateCloneValues();
                trackers.cloning.canClone = true;
                if (clones.total == 5) {
                    reveal(6);
                }
            }, 200);
        }
    }
}

/**
 * Removes the correct amount of clones and starts fighting the enemy
 */
function fight() {
    if (!fighting && clones.available >= army.clones) {
        calculateArmyStats();
        updateBattleValues();
        if (zone == 0 && row == 0 && cell == 0) {
            battleGrid.children[0].children[0].classList.add("battleCellOn");
        }
        clones.available -= army.clones;
        fighting = true;
    }
}

/**
 * Increments the progress bar and handles events from actioning the room and objects
 * 
 * @param {boolean} waitComplete whether this action call should complete a wait, if there is one in progress
 */
function action(waitComplete) {
    if (trackers.actions.canAction) {
        if (trackers.wait.time == 0 && !waitComplete) {
            trackers.actions.counter++;
        } else if (waitComplete) {
            trackers.actions.counter = 0;
        }
        document.getElementById("actionProgressBar").style.width = (Math.floor(trackers.actions.counter/trackers.actions.required*100))+"%";
        if ((trackers.actions.counter >= trackers.actions.required && trackers.wait.time == 0) || waitComplete) {
            trackers.actions.canAction = false;
            switch (trackers.actions.actioning) {
                case 0:
                    addStory(2);
                    trackers.actions.actioning = 1;
                    break;

                case 1:
                    addStory(3);
                    changeAction("Search the Machine");
                    trackers.actions.actioning = 2;
                    break;

                case 2:
                    addStory(4);
                    changeAction("Search the Room");
                    trackers.actions.actioning = 3;
                    break;

                case 3:
                    addStory(5);
                    trackers.actions.actioning = 4;
                    break;

                case 4:
                    addStory(6);
                    changeAction("Install the Battery");
                    trackers.actions.actioning = 5;
                    break;

                case 5:
                    addStory(7);
                    changeAction("Search the Room");
                    trackers.actions.actioning = 6;
                    break;
                
                case 6:
                    addStory(8);
                    changeAction("Open the Machine");
                    trackers.actions.actioning = 7;
                    break;

                case 7:
                    addStory(9);
                    changeAction("Sleeping");
                    document.getElementById("actionButton").disabled = true;
                    trackers.actions.actioning = 8;
                    //DEVONLY Set to 10
                    trackers.wait.time = 10;
                    setTimeout(() => {
                        trackers.wait.waiting = true;
                    }, 200);
                    break;

                case 8:
                    if (waitComplete) {
                        addStory(10);
                        changeAction("Search the Room");
                        document.getElementById("actionButton").disabled = false;
                        trackers.actions.actioning = 9;
                    }
                    break;

                case 9:
                    addStory(11);
                    trackers.actions.actioning = 10;
                    break;

                case 10:
                    addStory(12);
                    changeAction("Look for parts");
                    trackers.actions.actioning = 11;
                    break;

                case 11:
                    addStory(13);
                    reveal(0);
                    resources.metal.total = 15;
                    updateResourceValues();
                    changeAction("");
                    document.getElementById("actionButton").disabled = true;
                    trackers.actions.actioning = 12;
                    break;

                case 12:
                    addStory(15);
                    reveal(2);
                    changeAction("");
                    document.getElementById("actionButton").disabled = true;
                    trackers.actions.actioning = 13;
                    break;

                case 13:
                    addStory(17);
                    changeAction("Talk to the Clone");
                    trackers.actions.actioning = 14;
                    break;

                case 14:
                    addStory(18);
                    clones.total = 1;
                    clones.unemployed = 1;
                    updateCloneValues();
                    reveal(3);
                    changeAction("");
                    document.getElementById("actionButton").disabled = true;
                    trackers.actions.actioning = 15;
                    break;

                case 15:
                    setTimeout(() => {
                        addStory(20);
                        reveal(4);
                    }, 200);
                    trackers.actions.actioning = -1;

                default:
                    break;
            }

            if (trackers.wait.time == 0) {
                setTimeout(() => {
                    trackers.actions.counter = 0;
                    document.getElementById("actionProgressBar").style.width = (Math.floor(trackers.actions.counter/trackers.actions.required*100))+"%";
                    trackers.actions.canAction = true;
                }, 200);
            } else {
                trackers.actions.canAction = true;
            }
        }
    }
}

/**
 * Changes the text in the action button
 * 
 * @param {string} actionText what to display in the button
 */
function changeAction(actionText) {
    if (actionText != "") {
        document.getElementById("actionButton").innerHTML = actionText;
    } else {
        document.getElementById("actionButton").innerHTML = "‏‏‎⠀";
    }
}

/**
 * Shows a new part of the UI
 * 
 * @param {number} revealing what to reveal
 */
function reveal(revealing) {
    switch (revealing) {
        case 0:
            document.getElementById("metalContainer").classList.remove("hidden");
            document.getElementById("purchaseContainer").classList.remove("hidden");
            revealed.metal = true;
            break;

        case 1:
            addStory(0, true);
            document.getElementById("metalMaxContainer").classList.remove("hidden");
            document.getElementById("crateButton").classList.remove("hidden");
            revealed.metalStorage = true;
            break;

        case 2:
            document.getElementById("spearButton").classList.remove("hidden");
            revealed.spear = true;
            break;

        case 3:
            document.getElementById("jobsButton").classList.remove("hidden");
            document.getElementById("scienceContainer").classList.remove("hidden");
            revealed.science = true;
            break;

        case 4:
            document.getElementById("cloningContainer").classList.remove("hidden");
            document.getElementById("powerContainer").classList.remove("hidden");
            document.getElementById("actionTable").classList.add("hidden");
            revealed.cloning = true;
            break;

        case 5:
            addStory(19);
            changeAction("Activate the Machine");
            document.getElementById("actionButton").disabled = false;
            revealed.cloningStory = true;
            break;

        case 6:
            addStory(21);
            document.getElementById("upgradesButton").classList.remove("hidden");
            revealed.upgrades = true;
            break;

        case 7:
            addStory(1, true);
            document.getElementById("foodMaxContainer").classList.remove("hidden");
            document.getElementById("shedButton").classList.remove("hidden");
            revealed.foodStorage = true;
            break;

        case 8:
            addStory(24);
            document.getElementById("metalButton").innerHTML = "Smelt Metal";
            clones.researcher.requires.food = 10;
            document.getElementById("plansButton").classList.remove("hidden");
            revealed.plans = true;
            break;
    
        default:
            break;
    }
    updateResourceValues();
    updatePurchaseValues();
}

/**
 * Purchases an upgrade or building and consumes the required resources
 * 
 * @param {string} item The thing to purchase
 * @param {number} amount How many to purchase
 */
function purchase(item, amount) {

    amount = amount || 1;

    let canPurchase = true;

    for (const resource in purchases[item].requires) {
        if (purchases[item].requires[resource]*amount > resources[resource].total) {
            canPurchase = false;
        }
    }

    if (canPurchase) {

        for (const resource in purchases[item].requires) {
            resources[resource].total -= purchases[item].requires[resource];
            purchases[item].requires[resource] = Math.floor(purchases[item].requires[resource] * 1.2);
        }

        if (purchases[item].hasOwnProperty("available")) {
            purchases[item].available -= amount;
        }

        if (purchases[item].benefitType.includes("storage")) {
            if (purchases[item].benefitType.includes("metal")) {
                resources.metal.max += purchases[item].benefit;
            }
            if (purchases[item].benefitType.includes("food")) {
                resources.food.max += purchases[item].benefit;
            }
        }

        if (purchases[item].benefitType.includes("story")) {
            switch (item) {
                case "generator":
                    addStory(14);
                    changeAction("Open the Chamber");
                    document.getElementById("actionButton").disabled = false;
                    document.getElementById("generatorButton").classList.add("hidden");
                    revealed.hideGenerator = true;
                    break;

                case "spear":
                    addStory(16);
                    changeAction("Install the Generator");
                    document.getElementById("actionButton").disabled = false;
                    document.getElementById("spearButton").classList.add("hidden");
                    revealed.hideSpear = true;
                    break;

                case "escape":
                    addStory(22);
                    document.getElementById("escapeButton").classList.add("hidden");
                    document.getElementById("explosiveButton").classList.remove("hidden");
                    revealed.explosive = true;
                    break;

                case "explosive":
                    addStory(23);
                    document.getElementById("explosiveButton").classList.add("hidden");
                    document.getElementById("foodContainer").classList.remove("hidden");
                    document.getElementById("farmerButton").classList.remove("hidden");
                    revealed.food = true;
                    break;

                case "plans":
                    addStory(25);
                    document.getElementById("plansButton").classList.add("hidden");
                    document.getElementById("battleContainer").classList.remove("hidden");
                    revealed.exploration = true;
                    break;
            
                default:
                    break;
            }            
        }

        if (purchases[item].benefitType.includes("upgrade")) {
            switch (item) {
                case "miners":
                    document.getElementById("minerButton").classList.remove("hidden");
                    document.getElementById("metalNetContainer").classList.remove("hidden");
                    document.getElementById("minersButton").classList.add("hidden");
                    revealed.miners = true;
                    break;

                case "engineers":
                    document.getElementById("engineerButton").classList.remove("hidden");
                    document.getElementById("powerNetContainer").classList.remove("hidden");
                    document.getElementById("engineersButton").classList.add("hidden");
                    break;

                case "scouts":
                    document.getElementById("autofightButton").classList.remove("hidden");
                    document.getElementById("scoutsButton").classList.add("hidden");
                    revealed.autoFight = true;

                case "organization":
                    army.clones = Math.ceil(army.clones * 1.25);

                default:
                    break;
            }
        }

        purchases[item].owned += amount;
        updatePurchaseValues();
        updateResourceValues();
        updateTooltip();
    }
}

/**
 * Assigns clones a job
 * 
 * @param {string} job the job to put clones into
 * @param {number} amount the amount of clones to hire
 */
function hire(job, amount) {
    if (clones.unemployed >= amount) {
        let canHire = true;
    
        for (const resource in clones[job].requires) {
            if (clones[job].requires[resource]*amount > resources[resource].total) {
                canHire = false;
            }
        }

        if (canHire) {
            for (const resource in clones[job].requires) {
                resources[resource].total -= clones[job].requires[resource];
            }
            clones.unemployed -= amount;
            clones[job].total += amount;
            calculateNetResources();
            updateResourceValues();
            updateCloneValues();
        }
    }
}

/**
 * Toggles between tabs
 * 
 * @param {number} tab the tab to switch to
 */
function switchTabs(tab) {
    switch (tab) {
        case 0:
            document.getElementById("jobs").classList.add("hidden");
            document.getElementById("jobsButton").classList.remove("currentTab");
            document.getElementById("upgrades").classList.add("hidden");
            document.getElementById("upgradesButton").classList.remove("currentTab");
            document.getElementById("equipment").classList.add("hidden");
            document.getElementById("equipmentButton").classList.remove("currentTab");
            document.getElementById("buildings").classList.remove("hidden");
            document.getElementById("buildingsButton").classList.add("currentTab");
            break;

        case 1:
            document.getElementById("buildings").classList.add("hidden");
            document.getElementById("buildingsButton").classList.remove("currentTab");
            document.getElementById("upgrades").classList.add("hidden");
            document.getElementById("upgradesButton").classList.remove("currentTab");
            document.getElementById("equipment").classList.add("hidden");
            document.getElementById("equipmentButton").classList.remove("currentTab");
            document.getElementById("jobs").classList.remove("hidden");
            document.getElementById("jobsButton").classList.add("currentTab");
            break;

        case 2:
            document.getElementById("buildings").classList.add("hidden");
            document.getElementById("buildingsButton").classList.remove("currentTab");
            document.getElementById("jobs").classList.add("hidden");
            document.getElementById("jobsButton").classList.remove("currentTab");
            document.getElementById("equipment").classList.add("hidden");
            document.getElementById("equipmentButton").classList.remove("currentTab");
            document.getElementById("upgrades").classList.remove("hidden");
            document.getElementById("upgradesButton").classList.add("currentTab");
            break;

        case 3:
            document.getElementById("buildings").classList.add("hidden");
            document.getElementById("buildingsButton").classList.remove("currentTab");
            document.getElementById("jobs").classList.add("hidden");
            document.getElementById("jobsButton").classList.remove("currentTab");
            document.getElementById("upgrades").classList.add("hidden");
            document.getElementById("upgradesButton").classList.remove("currentTab");
            document.getElementById("equipment").classList.remove("hidden");
            document.getElementById("equipmentButton").classList.add("currentTab");
            break;
    
        default:
            break;
    }
}

/**
 * Adds a chunk of the story to storyDisplayed and updates the story container
 * 
 * @param {number} storyChunk the story to display
 * @param {boolean} hint whether the chunk should be taken from hints - optional parameter, defaults to false
 */
function addStory(storyChunk, hint) {
    if (hint) {
        if (storyDisplayed != "") {
            storyDisplayed += "<br><br>";
        }
        storyDisplayed += HINTS[storyChunk];
    } else {
        if (storyChunk != 0 && storyDisplayed != "") {
            storyDisplayed += "<br><br>";
        }
        storyDisplayed += STORY[storyChunk];
    }
    document.getElementById("story").innerHTML = storyDisplayed;
    updateScroll();
}

/**
 * Scrolls to the bottom of the story
 */
function updateScroll() {
	storyContainer.scrollTop = storyContainer.scrollHeight;
}

//Starts the game
init();