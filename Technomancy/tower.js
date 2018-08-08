var TOWER_DATA = [
    {
        "boss": "a noodle",
        "text": "It's just a wet noodle",
        "reward_text": "nothing, sorry",
        reward: function () {
        }
    },
    {
        "boss": "a bowl of spaghetti",
        "text": "That's a lot of noodles!",
        "reward_text": "cheaper essence",
        reward: function () {
            adventure_data["total_esssence"] -= 5;
        }
    },
    {
        "boss": "some linguini",
        "text": "These are evil noodles, I tell you. Eviiiil!",
        "reward_text": "a whole lot of time",
        reward: function () {
            resources["time"].amount += 1000000; /* That's 1 mil, I think. */
        }
    },
    {
        "boss": "ramen noodles",
        "text": "Seriously, what's with all these noodles?",
        "reward_text": "extra mana",
        reward: function () {
            resources_per_sec["mana"] += 100;
            buildings["s_manastone"].amount += 100;
            try {
                purchase_building("s_manastone");
            }
            catch (e) { }
        }
    },
    {
        "boss": "a guy named Mac",
        "text": "Finally, no more pasta. Oh wait, what's that? Dangit, looks like he has his own block of cheese with him.",
        "reward_text": "extra power",
        reward: function () {
            adventure_data["tower_power"] += 10;
        }
    },
    {
        "boss": "the Flying Spaghetti Monster",
        "text": "Well, it's finally come to kill you. Guess you shouldn't have beaten up all those helpless bowls of pasta.",
        "reward_text": "extra toughness",
        reward: function () {
            adventure_data["tower_toughness"] += 10;
        }
    },
];
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
    $("#events_topbar").html("The Tower of Magic");
    $("#events_content").html("Welcome to the Tower of Magic. Your essence allows you to enter. Oh, also if you're here please message fuzzything44 on the Discord channel. <br/>");
    var essence_cost = Math.round(Math.pow(adventure_data["total_essence"], 1.2));
    $("#events_content").append("<span class='clickable'>Compress</span> some magic into 1 essence (" + format_num(essence_cost, false) + " Mana Stones)<br/>");
    $("#events_content span").last().click(function () {
        if (buildings["s_manastone"].amount > essence_cost && resources["mana"].amount >= essence_cost) {
            buildings["s_manastone"].amount -= essence_cost;
            resources_per_sec["mana"] -= essence_cost;
            toggle_building_state("s_essence");
            buildings["s_essence"].amount++;
            toggle_building_state("s_essence");
            adventure_data["current_essence"]++;
            adventure_data["total_essence"]++;
            tower();
            $("#events_content").prepend("You compress some magic into essence.<br/>");
        }
        else {
            $("#events_content").prepend("You need a more mana stones. Or free up some mana. <br/>");
        }
    });
    $("#events_content").append("You currently have " + format_num(adventure_data["tower_power"], false) + " power. <span class='clickable'>Increase</span> by <input id='tower_power_increase' class='fgc bgc_second' type='number' min='0' value='1'> at a cost of 1 essence per power.<br/>");
    $("#events_content span").last().click(function () {
        /* Save both values to set inputs to previous values. */
        var pow_increase = Math.round(parseFloat($("#tower_power_increase").val()));
        var tough_increase = Math.round(parseFloat($("#tower_tough_increase").val()));
        if (buildings["s_essence"].amount > pow_increase) {
            toggle_building_state("s_essence", true);
            buildings["s_essence"].amount -= pow_increase;
            adventure_data["tower_power"] += pow_increase;
            adventure_data["current_essence"] -= pow_increase;
            toggle_building_state("s_essence", true);
        }
        tower();
        $("#tower_power_increase").val(pow_increase);
        $("#tower_tough_increase").val(tough_increase);
    });
    $("#events_content").append("You currently have " + format_num(adventure_data["tower_toughness"], false) + " toughness. <span class='clickable'>Increase</span> by <input id='tower_tough_increase' class='fgc bgc_second' type='number' min='0' value='1'> at a cost of 1 essence per toughness.<br/>");
    $("#events_content span").last().click(function () {
        /* Save both values to set inputs to previous values. */
        var pow_increase = Math.round(parseFloat($("#tower_power_increase").val()));
        var tough_increase = Math.round(parseFloat($("#tower_tough_increase").val()));
        if (buildings["s_essence"].amount > tough_increase) {
            toggle_building_state("s_essence", true);
            buildings["s_essence"].amount -= tough_increase;
            adventure_data["tower_toughness"] += tough_increase;
            adventure_data["current_essence"] -= tough_increase;
            toggle_building_state("s_essence", true);
        }
        tower();
        $("#tower_power_increase").val(pow_increase);
        $("#tower_tough_increase").val(tough_increase);
    });
    $("#events_content").append("<span class='clickable'>Enter</span> the tower. (Costs one mana stone). <br/>");
    $("#events_content span").last().click(function () { climb_tower(); });
    if (adventure_data["tower_floor"]) {
        $("#events_content").append("Start at tower floor: " + format_num(adventure_data["tower_floor"]));
    }
    $("#events").removeClass("hidden");
}
function climb_tower(health, ehealth) {
    if (health === void 0) { health = undefined; }
    if (ehealth === void 0) { ehealth = undefined; }
    $("#events_topbar").html("Tower floor " + format_num(adventure_data["tower_floor"]));
    if (health == undefined) {
        if (resources_per_sec["mana"] >= 1) {
            resources_per_sec["mana"]--;
            buildings["s_manastone"].amount--;
            try {
                purchase_building("s_manastone");
            }
            catch (e) { }
            health = adventure_data["tower_toughness"];
            ehealth = Math.pow(adventure_data["tower_floor"], 2);
        }
        else {
            $("#events_content").html("It seems you don't have enough mana to attempt fighting this boss. Maybe come back later?");
            return;
        }
    }
    if (adventure_data["tower_floor"] >= TOWER_DATA.length) {
        $("#events_content").html("You're at the current top of the tower!");
    }
    else {
        var boss = TOWER_DATA[adventure_data["tower_floor"]].boss;
        var description = TOWER_DATA[adventure_data["tower_floor"]].text;
        $("#events_content").html("This floor contains " + boss + ". " + description + "<br/>");
        $("#events_content").append("Your health: " + format_num(health, true) + "<br/>");
        $("#events_content").append("Enemy health: " + format_num(ehealth, true) + "<br/>");
        function fight_enemy(attack) {
            var rval = Math.random(); /* Roll random enemy attack. */
            var enemy_attack = "";
            if (rval < 1 / 3) {
                enemy_attack = "attack";
            }
            else if (rval < 2 / 3) {
                enemy_attack = "dodge";
            }
            else {
                enemy_attack = "spaz";
            }
            var winstate = "won"; /* Figure out who won. */
            if (attack == enemy_attack) {
                winstate = "tie";
            }
            else if ((attack == "attack" && enemy_attack == "dodge") || (attack == "dodge" && enemy_attack == "spaz") || (attack == "spaz" && enemy_attack == "attack")) {
                winstate = "lost";
            }
            if (winstate == "won") {
                /* Deal damage*/
                ehealth -= adventure_data["tower_power"];
                if (ehealth <= 0) {
                    defeat_floor();
                }
                else {
                    climb_tower(health, ehealth);
                    $("#events_content").append("You hit it!");
                }
            }
            else if (winstate == "tie") {
                /* Both take damage */
                health -= Math.pow(adventure_data["tower_floor"], 2);
                ehealth -= adventure_data["tower_power"];
                if (health <= 0) {
                    $("#events_content").html("Ouch! You were defeated.<br /><span class='clickable'>Try</span> again?");
                    $("#events_content span").last().click(function () { climb_tower(); });
                }
                else if (ehealth <= 0) {
                    defeat_floor();
                }
                else {
                    climb_tower(health, ehealth);
                    $("#events_content").append("You hit it! But it also hit you...");
                }
            }
            else {
                health -= Math.pow(adventure_data["tower_floor"], 2);
                if (health <= 0) {
                    $("#events_content").html("Oof! You were defeated.<br /><span class='clickable'>Try</span> again?");
                    $("#events_content span").last().click(function () { climb_tower(); });
                }
                else {
                    climb_tower(health, ehealth);
                    $("#events_content").append("It hit you. That hurts.");
                }
            }
        }
        $("#events_content").append("<span class='clickable'>Attack</span>");
        $("#events_content span").last().click(function () { fight_enemy("attack"); });
        $("#events_content").append("<span class='clickable'>Dodge</span>");
        $("#events_content span").last().click(function () { fight_enemy("dodge"); });
        $("#events_content").append("<span class='clickable'>Spaz</span><br/>");
        $("#events_content span").last().click(function () { fight_enemy("spaz"); });
    }
}
function defeat_floor() {
    $("#events_content").html("Yay, you won! That was a hard battle.<br/>");
    $("#events_content").append("For defeating the boss on floor " + format_num(adventure_data["tower_floor"]) + ", you are awarded with " + TOWER_DATA[adventure_data["tower_floor"]].reward_text + ". You're also a floor higher now. <br/>");
    TOWER_DATA[adventure_data["tower_floor"]].reward();
    adventure_data["tower_floor"]++;
    $("#events_content").append("<span class='clickable'>Continue</span> climbing the tower.<br/>");
    $("#events_content span").last().click(function () { climb_tower(); });
    $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
    $("#events_content span").last().click(function () { tower(); });
}
//# sourceMappingURL=tower.js.map