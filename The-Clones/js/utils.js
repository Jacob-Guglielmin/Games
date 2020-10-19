"use strict";

var STORY = [
    /* 0 */"You awaken in a dark room. You aren't quite sure exactly who you are, or what you were doing.",
    /* 1 */"You start searching the room you are in for any hint as to what might have happened, but it's a difficult task with no lights.",
    /* 2 */"Everything in the room seems to be damaged in some way or another. Most of what you find looks very complex. You start to wonder what could have caused the damage. An explosion, maybe? Whatever happened, the door is blocked with a lot of debris. You aren't going to be able to get it out of the way.",
    /* 3 */"In the center of the room, you find a large, cylindrical machine. It looks like it mostly survived whatever happened, but you can't really tell what it's for.",
    /* 4 */"It looks like there are some buttons on the side of the machine. You push one of them, and a screen starts up, flashes a little, and fades again. The power to wherever you are must be down.",
    /* 5 */"You found what looks like a big battery. It might have enough power left to turn on the lights for a while, if you could find out where to put it.",
    /* 6 */"There is a slot near the machine that looks like it might hold the battery.",
    /* 7 */"The battery fits perfectly inside the slot. A button on the machine starts to glow. When you push it, the lights in the room come on. Now that you can actually see, maybe you can look for a clue as to where you are.",
    /* 8 */"No luck. Looks like most of the stuff in the room was completely destroyed by whatever happened in here. However, it looks like there is some sort of door on the front of the machine.",
    /* 9 */"You press a couple buttons on the panel. Eventually, the door hisses and pops open a little bit. Inside, there appears to be what looks like space for a person. You're really tired after whatever happened to you, and the inside of the machine looks really comfortable. You step inside, and take a nap.",
    /* 10 */"You wake up. The door has closed since you fell asleep. You push on the door, and it opens with a hiss.",
    /* 11 */"You heard something in a corner of the room. You go over to look, and find a machine that seems to be activated.",
    /* 12 */"There is some sort of chamber behind the machine in the corner, but you can't find any way to get it open. It seems like you're going to be in here for a while, so you'll need some food, and your battery won't supply power for much longer. Maybe the machines that are broken could still be of use?",
    /* 13 */"Taking apart a machine, you have gotten a bunch of metal fragments. You seem to be able to remember some things about mechanics, so you might be able to build a simple generator out of some of your parts.",
    /* 14 */"Well, your generator isn't very efficient, but it'll do for now. Your battery is still charged, so you don't bother with it yet. That machine in the corner seems to have turned off. Maybe you'll be able to see inside the chamber now.",
    /* 15 */"You pull on the door, but it still won't open. You try pushing some buttons on the machine, and one of them opens the door. When you look inside, you see what looks like yourself in the chamber. Frightened, you close the door and block it with some debris. It doesn't seem like a good idea to open that door again unless you have a way to defend yourself.",
    /* 16 */"Satisfied that you'll be protected now, you push away the debris and open the door again. You pull... yourself? An alien? Whatever it is, out of the chamber. It looks like it is sleeping for now, but you aren't sure how long it'll stay that way. In the meantime, you should hook up your generator to the power system.",
    /* 17 */"Whatever came from the chamber just woke up. It stands up, looks around, and sees you. It looks frightened. You tell it your name, and it hesitantly replies that it thought that was its name too. At least that clears up one thing. However it happened, there is now two of you stuck in this room. In other news, the generator system seems like it works.",
    /* 18 */"Talking to the Clone, you find out that it doesn't have all your memories. After explaining your situation to it, it says that it would happily help you. You both agree that the priority should be research into what exactly the machine in the middle of the room does.",
    /* 19 */"After being busy examining wire pathways with you, the Clone tells you that the machine in the middle of the room seems to be connected in a lot of ways to the machine the Clone came out of. They suggest that maybe when you got into the tube, it may have activated the machines that created the Clone. Getting in again would give you a better idea of whether that is the case.",
    /* 20 */"You step into the machine again and close the door. After waiting a few minutes, you hear a whirring sound from the roof. It continues for about 30 seconds, and then it stops again. You step out of the machine, and the Clone examines the machine it came out of. It seems to have been activated again. Looks like there'll be three of you in a while. As long as you still have power, you should be able to make as many Clones as you need. Unfortunately, you don't have enough space for all of the clones to be working, so you will only give half of them jobs.",
    /* 21 */"With this many Clones, you are going to run out of food by the end of the day. You all decide that if you're going to make it out of here, you'll need to spend most of your time looking for a way out.",
    /* 22 */"You've been looking at some of the machines in the room, and one of the Clones thinks that you could make a small explosive that you could detonate next to the door to dislodge it.",
    /* 23 */"With your explosive armed, you all hide behind machines and detonate it. After everything has settled, you go over to the door and open it up. You look at where you are, but all that is outside of the room is forests and mountains. Looking at the outside of the building, you see that there should be more to the building, but the whole planet is absent of buildings and technology, except for your little room. It doesn't look like you're just going to be able to ask someone where you are. Before you do anything else, you're going to need some food.",
    /* 24 */"After a while, you think that you've managed to get your farm doing fairly well. However, it's going to take a lot of food to sustain any more clones that would be working with you. You spot a cave in a mountain that could have metal in it, which would be a better source than taking apart machines that you don't know much about. Now that you have access to a lot more metal, you'll be able to create some rudimentary weapons to fight off the creatures that you have seen nearby. However, before anyone leaves, you'll need to do some planning.",
    /* 25 */"After working with all of your clones, you think you have figured out how to start to venture out into the rest of the world. You've come up with a system for dividing up areas to explore, with each area being called a Zone. Each Zone will be made up of 100 smaller areas to map out, called Cells. You will go through each Cell one by one until you have mapped out the entire Zone, then you will move on to the next. However, each Cell might have a creature in it that would be a threat to your explorers, so you will have to send them all with weapons.",
    /* 26 */"Boy, generating all this power is getting tough. Your Clones could probably do it themselves, if you taught them.",
    /* 27 */"Coordinating the exploration of your army has really lost its appeal. You should get some of your Clones to do it for you!",
    /* 28 */"You've made a cool mold for the tools that you are using in the mine. With more, your Clones could mine too!"
],
HINTS = [
    /* 0 */"After getting a bunch of scrap metal, you realize that you don't have a lot of space to put it. If you built a storage crate, you could keep some more.",
    /* 1 */"I guess food won't be too much of an issue now, but food storage, maybe. You could build a shed outside to store a lot more."
],
TOOLTIPS = {
    //Story-based purchases
    generator: {
        info: "A simple hand crank generator. It doesn't look like much, but it provides some power."
    },
    spear: {
        info: "Well, you can't really call it a spear. More like a pointy club, really, but it'll do."
    },
    escape: {
        info: "Come up with something that could open the door with nothing but what you find in the room."
    },
    explosive: {
        info: "A small explosive device made from chemicals you were able to find in some machines. It shouldn't do much damage to anything it isn't next to."
    },
    plans: {
        info: "Work with your researchers to figure out what you'll need to get before you can start exploring."
    },


    //Buildings

    //Storages
    crate: {
        info: "Keeps some scrap metal better organized, allowing you to store ",
        info2: " more metal."
    },
    shed: {
        info: "Keeps some extra food out of the rain, allowing you to keep ",
        info2: " more food."
    },

    //Clones
    farmer: {
        info: "Farmers will make sure that all the crops that get planted are tended to, resulting in each farmer producing ",
        info2: " food per second."
    },
    miner: {
        info: "Miners work to break up rocks that you find in the nearby mountains, and occasionally find some metal in them. Each miner can find ",
        info2: " pieces of metal per second."
    },
    researcher: {
        info: "Researchers will spend their time thinking, and will produce ",
        info2: " science every second."
    },
    engineer: {
        info: "Train one of the Clones in the upkeep of machinery to keep your generator going. Each engineer will produce ",
        info2: " power every second."
    },

    //Upgrades

    //Job upgrades

    engineers: {
        info: "Make an instruction manual for the generator, so that your Clones can fix it when it breaks."
    },

    miners: {
        info: "Get enough tools made that your clones will be able to find and smelt metal."
    },

    speedfarming: {
        info: "Work with your researchers to develop better planting methods, allowing your farmers to work 25% faster!"
    },

    speedmining: {
        info: "Dig another mine into a mountain, allowing your miners to work 25% faster!"
    },

    speedscience: {
        info: "Build your scientists a fancy lab with sciency gizmos, allowing them to work 25% faster!"
    },

    //Equipment/battle upgrades

    scouts: {
        info: "Send a few Clones ahead to let you know what's coming. With that knowledge, your Clones should be able to work through the zones on their own!"
    },

    organization: {
        info: "This will allow you to learn about better battle strategies. Fighting will require 25% more Clones (rounded up), but with each new Clone, your army's attack and health will grow."
    }
},
MAP_LOCATIONS = {
    //Drops which follow no pattern/unique drops
    zones: {
        /*  
            LOCATION SCHEME: [row, cell, iconName, reward, story, title]

            Reward can only be a resource or upgrade name.
            If no story should be shown, put undefined.

            Zones that contain no special drops can and should be omitted.
        */

        zone0: [[0, 4, "glyphicon-wrench", "engineers", 26, "Engineers"], [0, 9, "icon-fast-forward", "scouts", 27, "Scouts"], [2, 9, "glyphicon-question-sign", "miners", 28, "Miners"]]
    },

    //Drops that repeat after a certain number of zones
    repeated: {
        //Organization
        organization: {
            start: 0,
            repeat: 1,
            row: 9,
            col: 9,
            icon: "glyphicon-book"
        },
        //Speedfarming
        speedfarming: {
            start: 0,
            repeat: 1,
            row: 6,
            col: 9,
            icon: "glyphicon-book"
        },
        //Speedmining
        speedmining: {
            start: 0,
            repeat: 1,
            row: 7,
            col: 9,
            icon: "glyphicon-book"
        },
        //Speedscience
        speedscience: {
            start: 1,
            repeat: 3,
            row: 4,
            col: 9,
            icon: "glyphicon-book"
        }
        //Generator upgrade
    },

    //Resource drops every zone
    resources: {
        food: {
            amount: 10,
            icon: "glyphicon-apple"
        },
        metal: {
            amount: 10,
            icon: "icon-cubes"
        }
    }
}

/**
 * Returns a random number between min and max (inclusive)
 * 
 * @param min Lower bound for number
 * @param max Upper bound for number
 */
function random(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    );
}

/**
 * Converts a number to something readable (adds a suffix)
 * 
 * @param number The number to prettify
 */
function prettify(number) {
    let base = Math.floor(Math.log(number)/Math.log(1000));
    if (base <= 0 && !(number >= 999.5)) {
        return prettifySmall(number);
    }

    number /= Math.pow(1000, base)

    console.log(number);

    //Prevent errors due to rounding
    if (number >= 999.5) {
        number /= 1000;
        base++;
    }
    let suffix;
    let suffixes = [
        "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud",
        "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Od", "Nd", "V", "Uv", "Dv",
        "Tv", "Qav", "Qiv", "Sxv", "Spv", "Ov", "Nv", "Tg", "Utg", "Dtg", "Ttg",
        "Qatg", "Qitg", "Sxtg", "Sptg", "Otg", "Ntg", "Qaa", "Uqa", "Dqa", "Tqa",
        "Qaqa", "Qiqa", "Sxqa", "Spqa", "Oqa", "Nqa", "Qia", "Uqi", "Dqi",
        "Tqi", "Qaqi", "Qiqi", "Sxqi", "Spqi", "Oqi", "Nqi", "Sxa", "Usx",
        "Dsx", "Tsx", "Qasx", "Qisx", "Sxsx", "Spsx", "Osx", "Nsx", "Spa",
        "Usp", "Dsp", "Tsp", "Qasp", "Qisp", "Sxsp", "Spsp", "Osp", "Nsp",
        "Og", "Uog", "Dog", "Tog", "Qaog", "Qiog", "Sxog", "Spog", "Oog",
        "Nog", "Na", "Un", "Dn", "Tn", "Qan", "Qin", "Sxn", "Spn", "On",
        "Nn", "Ct", "Uc"
    ];
    suffix = suffixes[base - 1];

    return prettifySmall(number) + suffix;
}

/**
 * Converts a small number to a number with an acceptable number of decimal places
 * 
 * @param number The number to prettify
 */
function prettifySmall(number) {
    let floor = Math.floor(number);
    if (number == floor) {
        return number;
    }
    return number.toFixed(3 - floor.toString().length);
}