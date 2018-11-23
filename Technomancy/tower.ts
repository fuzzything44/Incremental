let TOWER_DATA = [
    { /* Boss 0. "Noodles" */
        "boss": "a noodle",
        "text": "It's just a wet noodle",
        "reward_text": "nothing, sorry",
        reward: function () {

        }
    },
    { /* Boss 1. */
        "boss": "a bowl of spaghetti",
        "text": "That's a lot of noodles!",
        "reward_text": "cheaper essence",
        reward: function () {
            adventure_data["total_esssence"] -= 5;
        }
    },
    { /* Boss 2. */
        "boss": "some linguini",
        "text": "These are evil noodles, I tell you. Eviiiil!",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a whole lot of time";
            }
            else if (adventure_data["tower_ascension"] < 5) {
                return "a decent amount of time";
            }
            else {
                return "a bit of time";
            }
        },
        reward: function () {
            let div_amount = 1;
            if (!adventure_data["tower_ascension"]) {
                div_amount = Math.min(adventure_data["tower_ascension"] + 1, 10);
            }
            resources["time"].amount += tower_ascension_scale(1000000, 100000, false); /* That's 1 mil, I think. */
        }
    },
    { /* Boss 3. */
        "boss": "ramen noodles",
        "text": "Seriously, what's with all these noodles?",
        get reward_text() {
            if (adventure_data["tower_ascension"] < 5) {
                return "extra mana";
            }
            else {
                return "a bit of extra mana";
            }
        },
        reward: function () {
            var amt=tower_ascension_scale(250,25,true);
            resources_per_sec["mana"] += amt;
            buildings["s_manastone"].amount += amt;
            update_building_amount("s_manastone");
        }
    },
    { /* Boss 4. */
        "boss": "a guy named Mac",
        "text": "Finally, no more pasta. Oh wait, what's that? Dangit, looks like he has his own block of cheese with him.",
        "reward_text": "extra power",
        reward: function () {
            adventure_data["tower_power"] += 10;
        }
    },
    { /* Boss 5. */
        "boss": "the Flying Spaghetti Monster",
        "text": "Well, it's finally come to kill you. Guess you shouldn't have beaten up all those helpless bowls of pasta.",
        "reward_text": "extra toughness",
        reward: function () {
            adventure_data["tower_toughness"] += 10;
        }
    },
    { /* Boss 6. "Things that rhyme with Trimp" */
        "boss": "a shrimp",
        "text": "This is literally just a normal shrimp. How is it more powerful than the god you just killed?",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "600 starting time each prestige";
            }
            else {
                return "some extra starting time each prestige";
            }
        },
        reward: function () {
            if (adventure_data["perm_resources"] == undefined) {
                adventure_data["perm_resources"] = {};
            }
            if (adventure_data["perm_resources"]["time"] == undefined) {
                adventure_data["perm_resources"]["time"] = 0;
            }

            adventure_data["perm_resources"]["time"] += tower_ascension_scale(600,10,true);
        }
    },
    { /* Boss 7. */
        "boss": "a chimp",
        "text": "Oh, now you're fighting a monkey. Of course. This is totally normal.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "MORE UPGRADES";
            }
            else {
                return "more upgrades, again";
            }
        },
        reward: function () { }
    },
    { /* Boss 8. */
        "boss": "a blimp",
        "text": "Zeppelin, blimp, airship, dirigible, whatever you want to call it. Okay, I know that those mean slightly different things, but does it really matter if you're about to destroy it?",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "another tower";
            }
            else {
                return "the small tower, again";
            }
        },
        reward: function () {
            adventure_data["grind_tower_time"] = 0;
        }
    },
    { /* Boss 9. */
        "boss": "a pimp",
        "text": "He's about to mess up your face with his dope bling. Better fight back.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a few (20) purified mana to start each prestige with";
            }
            else {
                return "a little more purified mana to start each prestige with";
            }
        },
        reward: function () {
            if (adventure_data["perm_resources"]["purified_mana"] == undefined) {
                adventure_data["perm_resources"]["purified_mana"] = 0;
            }
            adventure_data["perm_resources"]["purified_mana"] += tower_ascension_scale(20,1,true);
        }
    },
    { /* Boss 10. */
        "boss": "a trimp",
        "text": "Wait, isn't this from a completely different <a href='https://trimps.github.io/' target='_blank' class='fgc'>game</a>?",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a new party member";
            }
            else {
                return "a small upgrade to your healer";
            }
        },
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_healer"] = { "power": 10, "health": 5, "action": "heal" };
            } else {
                adventure_data["tower_healer"]["power"]+=tower_ascension_scale(10,2,true);
                adventure_data["tower_healer"]["health"]+=tower_ascension_scale(5,1,true);
            }           
        }
    },
    { /* Boss 11. "Spooky stuff" */
        "boss": "the monster under your bed",
        "text": "It's a completely different species than the monster in your closet.",
        "reward_text": "an upgrade for your healer",
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_healer"].power *= 2;
            } else {
                adventure_data["tower_healer"]["power"]+=tower_ascension_scale(20,5,true);
            }
        }
    },
    { /* Boss 12 */
        "boss": "the monster in your closet",
        "text": "It's a completely different species than the monster under your bed.",
        "reward_text": "an upgrade for your healer",
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_healer"].power *= 1.5;
            } else {
                adventure_data["tower_healer"]["power"]+=tower_ascension_scale(10,3,true);
            }
        }
    },
    { /* Boss 13 */
        "boss": "a vampyre",
        "text": "The y makes it spookier than your regular vampire. It also makes it much more flammable.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "100 fuel every prestige";
            }
            else {
                return "some more fuel each prestige";
            }
        },
        reward: function () {
            if (adventure_data["perm_resources"]["fuel"] == undefined) {
                adventure_data["perm_resources"]["fuel"] = 0;
            }
            adventure_data["perm_resources"]["fuel"] += tower_ascension_scale(100,10,true);
        }
    },
    { /* Boss 14 */
        "boss": "a glass of milk",
        "text": "Wait, what's so scary about this?",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a lowered cooldown on the tower of grinding";
            }
            else {
                return "the return of a lowered cooldown on the tower of grinding";
            }
        },
        reward: function () { }
    },
    { /* Boss 15 */
        "boss": "mr. skeltal",
        "text": "oh, no. he came to doot doot you because you didn't drink your milk. prepare your weak bones.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "another party member";
            }
            else {
                return "a small upgrade to your warrior";
            }
        },
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_warrior"] = { "power": 20, "health": 100, "action": "defend" };
            } else {
                adventure_data["tower_warrior"]["power"]+=tower_ascension_scale(20,4,true);
                adventure_data["tower_warrior"]["health"]+=tower_ascension_scale(100,10,true);
            }           
        }
    },
    { /* Boss 16 "Britain or somewhere" */
        "boss": "some random British dude",
        "text": "How nice, he's offering you some tea. And he just put in the milk before the tea. There's now only one reasonable course of action. KILL HIM!",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "spikey kneepads";
            }
            else {
                return "spikey kneepads again";
            }
        },
        reward: function () { }
    },
    { /* Boss 17 */
        "boss": "the same dude, but angrier",
        "text": "Huh, turns out that if you attack someone, the get angry at you. He's really pissed off. And you're in a tower. That seems somehow <a href='https://www.kongregate.com/games/somethingggg/ngu-idle' target='_blank' class='fgc'>familiar</a>. Whatever, time to mercilessly kill him.",
        "reward_text": "an upgrade for your warrior",
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_warrior"].health *= 1.5;
            } else {
                adventure_data["tower_warrior"].health += tower_ascension_scale(10,2,true);
            }
        }
    },
    { /* Boss 18 */
        "boss": "a guy in a kilt",
        "text": "This is the british guy's brother. He has a kilt and a sweet sword. Good luck.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "his sweet sword";
            }
            else {
                return "his sweet sword, again";
            }
        },
        reward: function () { }
    },
    { /* Boss 19 */
        "boss": "King Arfur",
        "text": "It's an adorable puppy with a sword in it's mouth. Ow! Bad dog!",
        "reward_text": "nothing. Reflect on what you just did.",
        reward: function () { }
    },
    { /* Boss 20 "Money" */
        "boss": "a pile of gold",
        "text": "This is a medium sized pile of gold. Probably big enough to pay off your student loans. ",
        "reward_text": "yet another party upgrade",
        reward: function () {
            if (!adventure_data["tower_ascension"]) {
                adventure_data["tower_warrior"].health = 500;
                adventure_data["tower_healer"].power *= 5;
                adventure_data["tower_healer"].health = 100;
            } else {
                adventure_data["tower_warrior"].health += tower_ascension_scale(500,10,true);
                adventure_data["tower_healer"].power += tower_ascension_scale(150,10,true);
                adventure_data["tower_healer"].health += tower_ascension_scale(100,5,true);
            }
        }
    },
    { /* Boss 21 */
        "boss": "a lawyer",
        "text": "It turns out that gold wasn't yours. You're now being sued. ",
        "reward_text": "a better rate on toughness",
        reward: function () { }
    }, 
    { /* Boss 22 */
        "boss": "a suitcase of gold",
        "text": "You know all that gold you picked up? Well the lawyer put it in his suitcase. Also, the suitcase has legs and isn't happy. ",
        "reward_text": "all the gold in the suitcase, which you use to buy a tavern nearby instead of paying off your loans. Maybe next time",
        reward: function () { }
    }, 
    { /* Boss 23 */
        "boss": "Kombast©™ Cable",
        "text": "This is the greediest company of all and they're here for your money!",
        "reward_text": "a whole lot of gold and money for your magic bag!",
        reward: function () { }
    }, 
    { /* Boss 24 */
        "boss": "The Entire Continent of America",
        "text": "No, not the people living there. You're fighting the continent itself. How did it fit in the tower? Don't ask.",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "an option for autobuild to repeat the last building";
            }
            else {
                return "nothing";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 25 */
        "boss": "Kristoffer Kolumbus",
        "text": "The Legendary Explorer himself! He's rumored to be the original person to find the mystical land of Canadia!",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "10 more autobuild spaces";
            }
            else {
                return "nothing";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 26 */
        "boss": "A Very Large Telescope",
        "text": "It's used for finding exoplanets. Also, you're fighting it now. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "an extra autobuild slot for every tower boss you kill";
            } else {
                return "an extra autobuild slot for every new tower boss you  kill";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 27 */
        "boss": "A globe",
        "text": "What's so tough about just a regular globe? Well, maybe the fact that this one is to scale. 1:1 scale that is. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "a lot more mana on every prestige";
            }
            else {
                return "a lot more mana on every prestige, again";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 28 */
        "boss": "a little swimmy fishy",
        "text": "It's just swimming around. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "being able to kill the environment faster";
            }
            else {
                return "being able to kill the environment faster, again";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 29 */
        "boss": "a little golden swimmy fishy",
        "text": "It's just swimming around. It's also very shiny. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "being able to kill the economy faster";
            }
            else {
                return "being able to kill the economy faster, again";
            }
        },
        reward: function () { }
    }, 
    { /* Boss 30 */
        "boss": "a little sparkly swimmy fishy",
        "text": "It's just swimming around. It's also very extremely shiny. ",
        get reward_text() {
            if (!adventure_data["tower_ascension"]) {
                return "even more mana per prestige";
            }
            else {
                return "even more mana per prestige, again";
            }
        },
        reward: function () { }
    },
    { /* Boss Repeat, for extra levels */
        get boss() {
            return "A " + tower_adj_a[adventure_data["tower_floor"] % tower_adj_a.length]
                   + tower_adj_b[adventure_data["tower_floor"] % tower_adj_b.length]
                   + tower_adj_c[adventure_data["tower_floor"] % tower_adj_c.length]
                   + tower_noun[adventure_data["tower_floor"] % tower_noun.length];
        }
        get text() {
            return tower_rooms[adventure_data["tower_floor"] % tower_rooms.length];
        }
        "reward_text": "nothing but boasting rights",
        reward: function () { }
    },
    { /* Boss Final, for each tower. */
        "boss": "The final tower guardian",
        "text": "It bounces around the room like a demented ferret, hissing and snarling as it goes. ",
        "reward_text": "a new bigger shinier tower; oh and cheaper essence",
        reward: function () { }
    },
]

let tower_ascension_growth=4;
let grinding_level = 1;

/* Adjectives and nouns to describe the boss.  Please ensure that the lengths of each set are mutually coprime with all the others. */
/* Also, adjectives must end with a space or be totally empty. */
let tower_adj_a = [ "beautiful ", "ugly ", "", "strange ", "corrupt ", "quaint ", "cute ", ""];
let tower_adj_b = [ "big ", "small ", "baby ", "huge ", ""];
let tower_adj_c = [ "green ", "", "blue ", "purple ", "red ", "striped ", "spotty " ];
let tower_noun = ["fish", "frog", "triffid", "dog", "cat", "dove", "eagle", "goat", "golem"];
/* Room descriptions.  Want to be a multiple of noun length so that the rooms match the noun. */
let tower_rooms = ["It's just swimming around, looking angry. ",
                   "It's hopping mad at you. ",
                   "It's nearly filling the whole room, waiting to strike. ",
                   "It looks like it might just sit if you told it to firmly.  Maybe not. ",
                   "It gives you that look that says it knows that you're just a peasant in its eyes. ",
                   "It flutters around looking innocent.  Maybe it is, maybe it isn't. ",
                   "It soars round and round your head just waiting for you to take another step. ",
                   "It nibbles the vegetation while watching you carefully. ",
                   "It stands guard so still.  Will it move if you try and walk past? "];

function tower_ascension_scale( initial, min, round ) {
    if (round) {
        Math.round(Math.max(initial / (1 + adventure_data["tower_ascension"]), min));
    } else {
        return Math.max(initial / (1 + adventure_data["tower_ascension"]), min);
    }
}

/* Number of floors before final boss.
function tower_height() {
    return 30 + (adventure_data["tower_ascension"] * tower_ascension_growth);
}

function tower() {
    if (adventure_data["tower_floor"] == undefined) {
        adventure_data["tower_floor"] = 0;
    }
    if (adventure_data["tower_power"] == undefined) {
        adventure_data["tower_power"] = 1;
    }
    if (adventure_data["tower_toughness"] == undefined) {
        adventure_data["tower_toughness"] = 1;
    }
    if (adventure_data["tower_ascension"] == undefined) {
        adventure_data["tower_ascension"] = 0;
    }

    $("#events_topbar").html("The Tower of Magic");
    $("#events_content").html("Welcome to the Tower of Magic. Your essence allows you to enter.<br/>");

    let essence_cost = Math.round(Math.pow(adventure_data["total_essence"], 1.2))
    $("#events_content").append("<span class='clickable'>Compress</span> some magic into 1 essence (" + format_num(essence_cost, false) + " Mana Stones)<br/>");
    $("#events_content span").last().click(function () {
        if (buildings["s_manastone"].amount > essence_cost && resources["mana"].amount >= essence_cost) {
            buildings["s_manastone"].amount -= essence_cost;
            resources_per_sec["mana"] -= essence_cost;
            update_building_amount("s_manastone")

            toggle_building_state("s_essence", true);
            buildings["s_essence"].amount++;
            update_building_amount("s_essence");
            toggle_building_state("s_essence");

            adventure_data["current_essence"]++;
            adventure_data["total_essence"]++;
            tower();
            $("#events_content").prepend("You compress some magic into essence.<br/>")
        } else {
            $("#events_content").prepend("You need a more mana stones. Or free up some mana. <br/>")
        }
    });

    $("#events_content").append("You currently have " + format_num(adventure_data["tower_power"], false) + " power. <span class='clickable'>Spend</span> <input id='tower_power_increase' class='fgc bgc_second' type='number' min='0' value='1'> essence at a rate of 1 essence per power.<br/>");
    $("#events_content span").last().click(function () {
        /* Save both values to set inputs to previous values. */
        let pow_increase = Math.round(parseFloat($("#tower_power_increase").val()));
        let tough_increase = Math.round(parseFloat($("#tower_tough_increase").val()));

        if (buildings["s_essence"].amount > pow_increase) {
            spend_essence(pow_increase);
            adventure_data["tower_power"] += pow_increase;
        }

        tower();
        $("#tower_power_increase").val(pow_increase);
        $("#tower_tough_increase").val(tough_increase);

    });

    let toughness_per_essence = "";
    if (adventure_data["tower_floor"] > 21) { toughness_per_essence = "5 " }
    $("#events_content").append("You currently have " + format_num(adventure_data["tower_toughness"], false) + " toughness. <span class='clickable'>Spend</span> <input id='tower_tough_increase' class='fgc bgc_second' type='number' min='0' value='1'> essence at a rate of 1 essence per " + toughness_per_essence + "toughness.<br/>");
    $("#events_content span").last().click(function () {
        /* Save both values to set inputs to previous values. */
        let pow_increase = Math.round(parseFloat($("#tower_power_increase").val()));
        if (isNaN(pow_increase) || pow_increase < 0) { pow_increase = 0; }
        let tough_increase = Math.round(parseFloat($("#tower_tough_increase").val()));
        if (isNaN(tough_increase) || tough_increase < 0) { tough_increase = 0; }

        if (buildings["s_essence"].amount > tough_increase) {

            spend_essence(tough_increase);

            if (adventure_data["tower_floor"] > 21) {
                adventure_data["tower_toughness"] += 5 * tough_increase;
            } else {
                adventure_data["tower_toughness"] += tough_increase;
            }
        }

        tower();
        $("#tower_power_increase").val(pow_increase);
        $("#tower_tough_increase").val(tough_increase);
    });

    /* They're in a challenge. Disable entering tower */
    if (adventure_data["challenge"] == CHALLENGES.NONE) {
        $("#events_content").append("<span class='clickable'>Enter</span> the tower. (Costs one mana stone). <br/>");
        $("#events_content span").last().click(function () { climb_tower() });
    }

    if (adventure_data["tower_floor"]) {
        $("#events_content").append("You're at tower floor: " + format_num(adventure_data["tower_floor"]) + "<br/>")
    }

    if (adventure_data["grind_tower_time"] != undefined) {
        let grind_tower_time = 24 * 60 * 60;
        if (adventure_data["tower_floor"] > 14) {
            grind_tower_time -= 60 * 60; /* 1 hour quicker! */
        }

        if (Date.now() - adventure_data["grind_tower_time"] > grind_tower_time * 1000 || document.URL == "http://localhost:8000/") {
            $("#events_content").append("<span class='clickable'>Enter</span> the small tower nearby. (Costs one mana stone, enterable once every 24 hours). <br/>");
            $("#events_content span").last().click(function () { climb_tower(undefined, undefined, true) });
        } else {
            let date = new Date(null)
            let elapsed_time = (Date.now() - adventure_data["grind_tower_time"]) / 1000
            date.setSeconds(grind_tower_time - elapsed_time);
            let dates = date.toISOString().substr(11, 8);
            let result = dates.split(":")
            $("#events_content").append("The small tower is still closed. Come back in " + parseInt(result[0]).toString() + "hours " + parseInt(result[1]).toString() + " minutes<br/>");
        }
    }

    if (adventure_data["tower_floor"] > 22) {
        $("#events_content").append("<span class='clickable'>Enter</span> the tavern");
        $("#events_content span").last().click(function () {
            tavern();
        });
    }

    $("#events").removeClass("hidden");
}

function climb_tower(health = undefined, ehealth = undefined, grinding = false) {
    if (grinding) {
        $("#events_topbar").html("Small tower floor " + format_num(grinding_level));
    } else {
        $("#events_topbar").html("Tower floor " + format_num(adventure_data["tower_floor"]));
    }
    if (health == undefined) {
        if (resources_per_sec["mana"] >= 1) {
            resources_per_sec["mana"]--;
            buildings["s_manastone"].amount--;
            update_building_amount("s_manastone");
            health = adventure_data["tower_toughness"];

            if (adventure_data["tower_healer"] != undefined) { /* Give healer health */
                adventure_data["tower_healer"].current_health = adventure_data["tower_healer"].health;
            }
            if (adventure_data["tower_warrior"] != undefined) { /* Give warrior health */
                adventure_data["tower_warrior"].current_health = adventure_data["tower_warrior"].health;
            }
            if (grinding) {
                grinding_level = 1;
                ehealth = Math.pow(grinding_level, 2) * (1 + adventure_data["tower_ascension"]);
            } else {
                ehealth = Math.pow(adventure_data["tower_floor"], 2) * (1 + adventure_data["tower_ascension"]);
            }
        } else {
            $("#events_content").html("It seems you don't have enough mana to attempt fighting this boss. Maybe come back later?<br />");
            $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
            $("#events_content span").last().click(function () { tower(); });
            return;
        }

    }

    if (adventure_data["tower_floor"] > tower_height) && !grinding) {
        $("#events_content").html("You're at the current top of the tower! Oh, also if you're here please message fuzzything44 on the Discord channel.<br/>");
        /* Reset the tower information, increment ascension count and reset cost of essence. */
        adventure_data["tower_floor"]=1;
        adventure_data["tower_ascension"] += 1;
        adventure_data["total_essence"] = 1;

        $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
        $("#events_content span").last().click(function () { tower(); });
    } else if (grinding && grinding_level > tower_height()) ) {
        $("#events_content").html("Congratulations on grinding to the very top of the tower! As a reward, the essence cost has been reduced!<br/>");
        adventure_data["total_essence"] = 0;
        $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
        $("#events_content span").last().click(function () { tower(); });
    } else {

        let boss = ""; 
        let description = ""; 

        if (grinding) {
	    if (grinding_level < tower_height()) {
                if (grinding_level < TOWER_DATA.length - 2) {
                    boss = TOWER_DATA[grinding_level].boss;
                    description = TOWER_DATA[grinding_level].text;
                } else {
                    boss = TOWER_DATA[TOWER_DATA.length - 2].boss;
                    description = TOWER_DATA[TOWER_DATA.length - 2].description;
                }
            } else {
	        boss = TOWER_DATA[TOWER_DATA.length - 1].boss;
                description = TOWER_DATA[TOWER_DATA.length - 1].description;
	    }
            adventure_data["grind_tower_time"] = Date.now();
        } else {
	    if (adventure_data["tower_floor"] < tower_height()) {
                if (adventure_data["tower_floor"] < TOWER_DATA.length - 2) {
                    boss = TOWER_DATA[adventure_data["tower_floor"]].boss;
                    description = TOWER_DATA[adventure_data["tower_floor"]].text;
                } else {
                    boss = TOWER_DATA[TOWER_DATA.length - 2].boss;
                    description = TOWER_DATA[TOWER_DATA.length - 2].description;
                }
            } else {
	        boss = TOWER_DATA[TOWER_DATA.length - 1].boss;
                description = TOWER_DATA[TOWER_DATA.length - 1].description;
	    }
        }

        $("#events_content").html("This floor contains " + boss + ". " + description + "<br/>");
        $("#events_content").append("Your health: " + format_num(health, true) + "<br/>");
        $("#events_content").append("Enemy health: " + format_num(ehealth, true) + "<br/>");

        function fight_enemy(attack) {
            let fight_results_message = "";
            if (attack == "attack") {
                fight_results_message += "You attack!";
            } else if (attack == "dodge") {
                fight_results_message += "You dodge!";
            } else if (attack == "spaz") {
                let spaz_messages = ["You flail around!", "You do the TEACUP EXTERMINATION.", "You start tapdancing.", "You attack! Wait, no. You don't.", "You suddenly become happy."];
                fight_results_message += spaz_messages[Math.floor(Math.random() * spaz_messages.length)];
            }

            let rval = Math.random(); /* Roll random enemy attack. */
            let enemy_attack = "";
            if (rval < 1 / 3) {
                enemy_attack = "attack";
                fight_results_message += " Your enemy attacks!";
            } else if (rval < 2 / 3) {
                enemy_attack = "dodge";
                fight_results_message += " Your enemy defends!";
            } else {
                enemy_attack = "spaz";
                let spaz_messages = ["Your enemy spins in circles for 20 minutes!", "Your enemy does something unspeakable.", "Your enemy pulls out a giant hammer and hits you with it! Oh good, it was foam.", "Your enemy throws a tomato at you.", "... maybe?"];
                fight_results_message += " " + spaz_messages[Math.floor(Math.random() * spaz_messages.length)];
            }

            fight_results_message += "<br/>";

            let winstate = "won"; /* Figure out who won. */
            if (attack == enemy_attack) {
                winstate = "tie";
            } else if ((attack == "attack" && enemy_attack == "dodge") || (attack == "dodge" && enemy_attack == "spaz") || (attack == "spaz" && enemy_attack == "attack")) {
                winstate = "lost";
            }
            let enemy_damage = Math.pow(adventure_data["tower_floor"], 2) * (1 + adventure_data["tower_ascension"]);
            if (grinding) {
                enemy_damage = Math.pow(grinding_level, 2) * (1 + adventure_data["tower_ascension"]);
            }

            function damage_player(amt) {
                /* Warrior exists and is defending. And is alive. */
                if (adventure_data["tower_warrior"] != undefined && $("input:radio[name='warrior_action']:checked").val() == "defend" && adventure_data["tower_warrior"].current_health > 0) {
                    adventure_data["tower_warrior"].current_health -= amt;
                    fight_results_message += " Your warrior deflects the damage!";
                } else {
                    health -= amt;
                    /* They have spikey kneepads */
                    if (adventure_data["tower_floor"] > 16) {
                        fight_results_message += " Your spikey kneepads poke your enemy for 5 damage!";
                        ehealth -= 5;
                    }
                }
            }
            if (winstate == "won") {
                /* Deal damage*/
                ehealth -= adventure_data["tower_power"];
                fight_results_message += "You hit it!"

                if (adventure_data["tower_floor"] > 18) {
                    fight_results_message += " And your sweet sword is really good at damaging this guy!";
                    ehealth -= Math.floor(adventure_data["tower_power"] / 3);
                }
            } else if (winstate == "tie") {
                /* Both take damage */
                ehealth -= adventure_data["tower_power"];
                fight_results_message += "You hit it! But it also hit you..."
                damage_player(enemy_damage);
            } else {
                fight_results_message += "It hit you. That hurts."
                damage_player(enemy_damage);
            }
            fight_results_message += "<br/>";
            if (adventure_data["tower_healer"] != undefined) {
                let heal_action = $("input:radio[name='healer_action']:checked").val();
                if (heal_action == "heal") {
                    let heal_amount = adventure_data["tower_healer"].power;
                    heal_amount = Math.min(adventure_data["tower_toughness"] - health, heal_amount); /* Can't heal past max health. */
                    health += heal_amount;
                    fight_results_message += "Your healer heals you for " + format_num(heal_amount, false) + " health.";
                } else { /* It's attack */
                    let heal_damage = Math.round(adventure_data["tower_healer"].power / 2);
                    ehealth -= heal_damage;
                    fight_results_message += "Your healer attacks for " + format_num(heal_damage, false) + " damage.";
                }
                adventure_data["tower_healer"].action = heal_action;
                fight_results_message += "<br/>";
            }

            if (adventure_data["tower_warrior"] != undefined) {
                let warrior_action = $("input:radio[name='warrior_action']:checked").val();
                if (warrior_action == "attack" && adventure_data["tower_warrior"].current_health > 0) {
                    let warr_damage = Math.round(adventure_data["tower_warrior"].power);
                    ehealth -= warr_damage;
                    fight_results_message += "Your warrior attacks for " + format_num(warr_damage, false) + " damage.";
                } 
                adventure_data["tower_warrior"].action = warrior_action;
                fight_results_message += "<br/>";
            }

            /* Check for deaths. */
            if (health <= 0) {
                if (grinding) {
                    $("#events_content").html("Ouch! You were defeated.<br /> Well, that's all the grinding you can do right now. Come back in 24 hours.<br/>");
                } else {
                    $("#events_content").html("Ouch! You were defeated.<br /><span class='clickable'>Try</span> again? (Costs 1 mana stone)<br/>");
                    $("#events_content span").last().click(function () { climb_tower() });

                }
                $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
                $("#events_content span").last().click(function () { tower(); });
            } else if (ehealth <= 0) {
                if (grinding) {
                    defeat_floor(health);
                } else {
                    defeat_floor();
                }
            } else {
                climb_tower(health, ehealth, grinding);
            }

            $("#events_content").prepend(fight_results_message + "<br/>");

        }
        $("#events_content").append("<span class='clickable'>Attack</span>");
        $("#events_content span").last().click(function () { fight_enemy("attack"); });
        $("#events_content").append("<span class='clickable'>Dodge</span>");
        $("#events_content span").last().click(function () { fight_enemy("dodge"); });
        $("#events_content").append("<span class='clickable'>Spaz</span><br/>");
        $("#events_content span").last().click(function () { fight_enemy("spaz"); });

        function class_stats(classname) {
            let current = adventure_data["tower_" + classname].current_health;
            let max = adventure_data["tower_" + classname].health;
            let pow = adventure_data["tower_" + classname].power;
            if (current <= 0) {
                return "(DEAD)";
            }
            return "(" + format_num(current) + "/" + format_num(max) + " health, " + format_num(pow) + " power)";
        }
        if (adventure_data["tower_healer"] != undefined) {
            $("#events_content").append("Healer Action " + class_stats("healer") + ": <div class='radio-group'>" +
                "<input type='radio' name='healer_action' id='healer_heal' value='heal'><label for='healer_heal'>Heal</label>" +
                "<input type='radio' name='healer_action' id='healer_attack' value='attack'><label for='healer_attack'>Attack</label>" +
                "</div><br/>");
            $("#healer_" + adventure_data["tower_healer"].action).click();

        }

        if (adventure_data["tower_warrior"] != undefined) {
            $("#events_content").append("Warrior Action " + class_stats("warrior") + ": <div class='radio-group'>" +
                "<input type='radio' name='warrior_action' id='warrior_defend' value='defend'><label for='warrior_defend'>Defend</label>" +
                "<input type='radio' name='warrior_action' id='warrior_attack' value='attack'><label for='warrior_attack'>Attack</label>" +
                "</div><br/>");
            $("#warrior_" + adventure_data["tower_warrior"].action).click();

        }
    }
}

function defeat_floor(health = undefined) {
    $("#events_content").html("Yay, you won! That was a hard battle.<br/>");
    if (health == undefined) {
        var floor=adventure_data["tower_floor"];
        if (floor > TOWER_DATA.length - 2) {
           if (floor == TOWER_DATA.length - 2 + (tower_ascension_growth * adventure_data["tower_ascension"])) {
              floor=TOWER_DATA.length - 1;
           } else {
              floor=TOWER_DATA.length - 2;
           }
        }
        $("#events_content").append("For defeating the boss on floor " + format_num(adventure_data["tower_floor"]) + ", you are awarded with " + TOWER_DATA[floor].reward_text + ". You're also a floor higher now. <br/>");
        TOWER_DATA[floor].reward();
        adventure_data["tower_floor"]++;
        $("#events_content").append("<span class='clickable'>Continue</span> climbing the tower.<br/>");
        $("#events_content span").last().click(function () { climb_tower(); });

        $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
        $("#events_content span").last().click(function () { tower(); });
    } else {
        $("#events_content").append("For defeating the boss on floor " + format_num(grinding_level) + ", you are awarded with 1 essence<br/>")
        /* Give one essence */
        toggle_building_state("s_essence", true);
        buildings["s_essence"].amount++;
        update_building_amount("s_essence");
        toggle_building_state("s_essence");

        adventure_data["current_essence"]++;

        grinding_level++;

        $("#events_content").append("<span class='clickable'>Continue</span> climbing the tower.<br/>");
        $("#events_content span").last().click(function () { climb_tower(health, Math.pow(grinding_level, 2), true); });

        $("#events_content").append("<span class='clickable'>Back</span> to tower base (ends your run of grinding, so pretty pointless).<br/>");
        $("#events_content span").last().click(function () { tower(); });

    }

}

/* TODO: Add upgrade party, hire new people (when unlocked). */
function tavern() {
    $("#events_topbar").html("A tavern");
    $("#events_content").html("The tavern is pretty empty right now. It's just you, your party, and the bartender. Still, you could buy a drink for a party member.<br/>");

    function buydrink(name: string, pow_increase: number, health_increase: number, size: number = 1) {
        if (buildings["s_essence"].amount >= size) {
            spend_essence(size);
            let pow_gain = pow_increase * size;
            let health_gain = health_increase * size;

            adventure_data["tower_" + name].power += pow_gain;
            adventure_data["tower_" + name].health += health_gain;
            $("#events_content").prepend("You buy your " + name + " a drink. They gain " + format_num(pow_gain) + " power and " + format_num(health_gain) + " health!<br/>");

        } else {
            $("#events_content").prepend("You don't have enough essence<br/>");
        }
    }
    $("#events_content").append("<span class='clickable'>Buy</span> your Healer a drink (1 essence)");
    $("#events_content span").last().click(function () {
        buydrink("healer", 0.5, 1);
    });
    if (buildings["s_essence"].amount > 100) {
        $("#events_content").append(" <span class='clickable'>Buy 10</span>");
        $("#events_content span").last().click(function () {
            buydrink("healer", 0.5, 1, 10);
        });
    }
    $("#events_content").append("<br/>");
    $("#events_content").append("<span class='clickable'>Buy</span> your Warrior a drink (1 essence)");
    $("#events_content span").last().click(function () {
        buydrink("warrior", 1, 7);
    });
    if (buildings["s_essence"].amount > 100) {
        $("#events_content").append(" <span class='clickable'>Buy 10</span>");
        $("#events_content span").last().click(function () {
            buydrink("warrior", 1, 7, 10);
        });
    }
    $("#events_content").append("<br/>");
    $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
    $("#events_content span").last().click(function () { tower(); });

}

function spend_essence(amount) {
    toggle_building_state("s_essence", true);
    
    buildings["s_essence"].amount -= amount;

    adventure_data["current_essence"] -= amount;
    update_building_amount("s_essence");

    toggle_building_state("s_essence", true);
    
}