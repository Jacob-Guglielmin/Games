"use strict";

var title = "",
info = "",
cost = "",
coordX = 0,
coordY = 0,
tooltipVisible = false,
currentTooltip = "",
tooltipElem = document.getElementById("tooltip"),
tooltipTitleElem = document.getElementById("tooltipTitle"),
tooltipInfoElem = document.getElementById("tooltipInfo"),
tooltipCostElem = document.getElementById("tooltipCost")

/**
 * Creates tooltips for buttons
 * 
 * @param what either the name of an object with the info in it, hide, or the title of the tooltip
 * @param event what triggered the tooltip, or update
 * @param info1 only used if there is no object - what the button does
 * @param info2 only used if there is no object - what the button requires to click
 */
function tooltip(what, event, infoA, infoB){
    currentTooltip = what;
    title = "";
    info = "";
    cost = "";
    if (what == "hide") {
        tooltipElem.classList.add("hidden");
        tooltipVisible = false;
    } else if (what == "save") {
        if (event != "update") {
            title = "Export Save";
            info = "<textarea id='exportBox' class='saveBox' rows='5' cols='38' readonly='readonly'></textarea>";
            cost = "<button class='headerButton' onmousedown='tooltip(\x22hide\x22)'>Got it!</button><button class='headerButton' float='right' onmousedown='document.execCommand(\x22copy\x22)'>Copy</button>";
            coordX = screen.width / 2;
            coordY = screen.height / 4;
            drawTooltip("save");
        }
    } else if (what == "load") {
        if (event != "update") {
            title = "Import Save";
            info = "<textarea id='importBox' class='saveBox' rows='5' cols='38'></textarea>";
            cost = "<button class='headerButton' onmousedown='tooltip(\x22hide\x22);load(\x22import\x22);'>Import</button>";
            coordX = screen.width / 2;
            coordY = screen.height / 4;
            drawTooltip("load");
        }
    } else {
        if (TOOLTIPS.hasOwnProperty(what)) {
            if (window.clones[what] && TOOLTIPS[what].info) {
                title = what.charAt(0).toUpperCase() + what.slice(1);
                info = TOOLTIPS[what].info;
                info += window.clones[what].benefit;

                if (TOOLTIPS[what].info2) {
                    info += TOOLTIPS[what].info2;
                }
                
                for (const i in window.clones[what].requires) {
                    if (window.clones[what].requires[i] != 0) {
                        cost += Math.floor(window.resources[i].total) + "/" + window.clones[what].requires[i] + " " + i.charAt(0).toUpperCase() + i.slice(1) + ", ";
                    }
                }
                if (cost != "") {
                    cost = cost.substring(0, cost.length - 2);
                } 
            } else if (window.purchases[what] && TOOLTIPS[what].info) {
                title = what.charAt(0).toUpperCase() + what.slice(1);
                info = TOOLTIPS[what].info;

                if (window.purchases[what].benefit) {
                    info += window.purchases[what].benefit;
                }

                if (TOOLTIPS[what].info2) {
                    info += TOOLTIPS[what].info2;
                }
                
                for (const i in window.purchases[what].requires) {
                    if (window.purchases[what].requires[i] != 0) {
                        cost += Math.floor(window.resources[i].total) + "/" + window.purchases[what].requires[i] + " " + i.charAt(0).toUpperCase() + i.slice(1) + ", ";
                    }
                }
                if (cost != "") {
                    cost = cost.substring(0, cost.length - 2);
                }
            } else {
                title = what.charAt(0).toUpperCase() + what.slice(1);
                info = infoA;
                cost = infoB;
            }
            drawTooltip(event);
        }
    }
}

/**
 * Positions the tooltip above or below the mouse, and puts in the text
 * 
 * @param event the event that triggered the tooltip - used for getting mouse coords
 */
function drawTooltip(event) {
    
    //Put the text in the tooltip
    tooltipTitleElem.innerHTML = title;
    tooltipInfoElem.innerHTML = info;
    tooltipCostElem.innerHTML = cost;

    //If the tooltip was called by an event, get the new mouse coords and reposition the tooltip
    if (event && (event.clientX || event == "save" || event == "load")) {
        
        if (event.clientX) {
            coordX = event.clientX;
            coordY = event.clientY;
        }

        //Position on the x-axis
        if (coordX - 150 > 4 && coordX + 150 < screen.width - 4) {
            tooltipElem.style.left = (coordX - 150) + "px";
        } else if (coordX - 150 <= 4) {
            tooltipElem.style.left =  "5px";
        } else {
            tooltipElem.style.left = (screen.width - 305) + "px";
        }

        //Position on the y-axis
        if (coordY - tooltipElem.offsetHeight - 20 > 4) {
            tooltipElem.style.top = (coordY - tooltipElem.offsetHeight - 20) + "px";
        } else {
            tooltipElem.style.top = (coordY + 40) + "px";
        }

        if (event == "save") {
            save("export");
        }

        //Show the tooltip
        tooltipElem.classList.remove("hidden");
        tooltipVisible = true;
    }
}

function updateTooltip() {
    if (tooltipVisible) {
        tooltip(currentTooltip, "update");
    }
}