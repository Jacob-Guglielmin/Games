"use strict";

var saveVar = {},
loadVar = {},
compressed = "",
decompressed = "",
startLoad = false,
continueLoad = false;

/**
 * Compresses the current save and saves it to localStorage or the export text box
 * 
 * @param saveType how to save the game
 */
function save(saveType) {
    saveVar = {
        version: window.VERSION,
        trackers: window.trackers,
        resources: window.resources,
        purchases: window.purchases,
        clones: window.clones,
        revealed: window.revealed,
        actionText: document.getElementById("actionButton").innerHTML,
        zone: window.zone,
        row: window.row,
        cell: window.cell,
        army: window.army,
        enemy: window.enemy,
        autoFight: window.autoFight
    }

    decompressed = JSON.stringify(saveVar);
    compressed = LZString.compressToBase64(decompressed);

    if (saveType == "localStorage") {
        //DEVONLY Enable localStorage
        try {
            //localStorage.setItem("clonesSave", compressed);
        } catch (e) {}
    } else if (saveType == "export") {
        document.getElementById("exportBox").value = compressed;
        setTimeout(() => {
            document.getElementById("exportBox").focus();
            document.getElementById("exportBox").select();
        }, 0);
    }
}

/**
 * Loads a save from localStorage or the import text box
 * 
 * @param loadType what to load the game from
 */
function load(loadType) {
    if (loadType == "localStorage") {
        try {
            compressed = localStorage.getItem("clonesSave");
        } catch (e) {}
    } else if (loadType == "import") {
        compressed = document.getElementById("importBox").value;
    }
    try {
        decompressed = LZString.decompressFromBase64(compressed);
        loadVar = JSON.parse(decompressed);
        startload = true;
    } catch (e) {
        startLoad = false;
    }

    if (startLoad) {

        if (loadVar.version == window.version) {
            continueLoad = true;
        } else {
            continueLoad = confirm("Warning: Your save string was created in an earlier version. Loading this save string may have undesirable results. Are you sure you want to proceed?");
        }

        if (continueLoad) {

            //Cancel writing the start of the story
            if (window.storyTask) {
                window.storyTask = false;
                console.log("Loading save - cancelling timeout");
            }

            //Text changes
            document.getElementById("actionButton").innerHTML = loadVar.actionText;
            if (loadVar.actionText.charCodeAt(0) == 8207 /* 8207 is a blank character */ || loadVar.actionText == "Sleeping") {
                document.getElementById("actionButton").disabled = true;
            }
            window.storyDisplayed = "";
            document.getElementById("story").innerHTML = storyDisplayed;
            document.getElementById("actionContainer").classList.remove("hidden");
            if (loadVar.actionText != "Sleeping") {
                document.getElementById("actionProgressBar").style.width = (Math.floor(loadVar.trackers.actions.counter/loadVar.trackers.actions.required*100))+"%";
            } else {
                document.getElementById("actionProgressBar").style.width = (Math.floor(loadVar.trackers.wait.counter/(loadVar.trackers.wait.time*10)*100)) + "%";
            }
            document.getElementById("cloningProgressBar").style.width = (Math.floor(loadVar.trackers.cloning.counter/loadVar.trackers.cloning.required*100))+"%";

            //Write variables

            //main.js
            window.trackers = loadVar.trackers;
            window.resources = loadVar.resources;
            window.purchases = loadVar.purchases;
            window.clones = loadVar.clones;
            window.revealed = loadVar.revealed;

            //exploration.js
            window.zone = loadVar.zone;
            window.row = loadVar.row;
            window.cell = loadVar.cell;
            window.army = loadVar.army;
            window.enemy = loadVar.enemy;
            window.autoFight = loadVar.autoFight;

            //Story-based unlocks
            if (loadVar.revealed.metal) {

                document.getElementById("metalContainer").classList.remove("hidden");
                document.getElementById("purchaseContainer").classList.remove("hidden");

                if (loadVar.revealed.hideGenerator) {

                    document.getElementById("generatorButton").classList.add("hidden");

                    if (loadVar.revealed.spear) {

                        document.getElementById("spearButton").classList.remove("hidden");

                        if (loadVar.revealed.hideSpear) {

                            document.getElementById("spearButton").classList.add("hidden");

                            if (loadVar.revealed.science) {

                                document.getElementById("jobsButton").classList.remove("hidden");
                                document.getElementById("scienceContainer").classList.remove("hidden");

                                if (loadVar.revealed.cloning) {

                                    document.getElementById("cloningContainer").classList.remove("hidden");
                                    document.getElementById("powerContainer").classList.remove("hidden");
                                    document.getElementById("actionTable").classList.add("hidden");

                                    if (loadVar.revealed.upgrades) {

                                        document.getElementById("upgradesButton").classList.remove("hidden");

                                        if (loadVar.revealed.explosive) {

                                            document.getElementById("escapeButton").classList.add("hidden");
                                            document.getElementById("explosiveButton").classList.remove("hidden");

                                            if (loadVar.revealed.food) {

                                                document.getElementById("explosiveButton").classList.add("hidden");
                                                document.getElementById("foodContainer").classList.remove("hidden");
                                                document.getElementById("farmerButton").classList.remove("hidden");
                                                
                                                if (loadVar.revealed.plans) {

                                                    document.getElementById("metalButton").innerHTML = "Smelt Metal";
                                                    document.getElementById("plansButton").classList.remove("hidden");
                                                    clones.researcher.requires.food = 10;

                                                    if (loadVar.revealed.exploration) {

                                                        document.getElementById("plansButton").classList.add("hidden");
                                                        document.getElementById("battleContainer").classList.remove("hidden");

                                                        if (loadVar.revealed.miners) {

                                                            document.getElementById("minerButton").classList.remove("hidden");
                                                            document.getElementById("metalNetContainer").classList.remove("hidden");
                                                            document.getElementById("minersButton").classList.add("hidden");

                                                            if (loadVar.revealed.scouts) {

                                                                document.getElementById("autofightButton").classList.remove("hidden");
                                                                document.getElementById("scoutsButton").classList.add("hidden");
                                                                
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            //Other unlocks
            if (loadVar.revealed.metalStorage) {
                document.getElementById("metalMaxContainer").classList.remove("hidden");
                document.getElementById("crateButton").classList.remove("hidden");
            }
            if (loadVar.revealed.foodStorage) {
                document.getElementById("foodMaxContainer").classList.remove("hidden");
                document.getElementById("shedButton").classList.remove("hidden");
            }
            updateResourceValues();
            updateCloneValues();
            updatePurchaseValues();
        }
    } else {
        if (loadType == "import") {
            alert("Unfortunately, your save string could not be recognized. It is possible that something is wrong on our end. Try again in a while.");
        }
    }
}