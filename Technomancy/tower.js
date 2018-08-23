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
            resources_per_sec["mana"] += 250;
            buildings["s_manastone"].amount += 250;
            update_building_amount("s_manastone");
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
    {
        "boss": "a shrimp",
        "text": "This is literally just a normal shrimp. How is it more powerful than the god you just killed?",
        "reward_text": "600 starting time each prestige",
        reward: function () {
            if (adventure_data["perm_resources"] == undefined) {
                adventure_data["perm_resources"] = {};
            }
            adventure_data["perm_resources"]["time"] = 600;
        }
    },
    {
        "boss": "a chimp",
        "text": "Oh, now you're fighting a monkey. Of course. This is totally normal.",
        "reward_text": "MORE UPGRADES",
        reward: function () { }
    },
    {
        "boss": "a blimp",
        "text": "Zeppelin, blimp, airship, dirigible, whatever you want to call it. Okay, I know that those mean slightly different things, but does it really matter if you're about to destroy it?",
        "reward_text": "another tower",
        reward: function () {
            adventure_data["grind_tower_time"] = 0;
        }
    },
    {
        "boss": "a pimp",
        "text": "He's about to mess up your face with his dope bling. Better fight back.",
        "reward_text": "a few (20) purified mana to start each prestige with",
        reward: function () {
            adventure_data["perm_resources"]["purified_mana"] = 20;
        }
    },
    {
        "boss": "a trimp",
        "text": "Wait, isn't this from a completely different game?",
        "reward_text": "a new party member",
        reward: function () {
            adventure_data["tower_healer"] = { "power": 10, "health": 5, "action": "heal" };
        }
    },
    {
        "boss": "the monster under your bed",
        "text": "It's a completely different species than the monster in your closet.",
        "reward_text": "an upgrade for your healer",
        reward: function () {
            adventure_data["tower_healer"].power *= 2;
        }
    },
    {
        "boss": "the monster in your closet",
        "text": "It's a completely different species than the monster under your bed.",
        "reward_text": "an upgrade for your healer",
        reward: function () {
            adventure_data["tower_healer"].power *= 1.5;
        }
    },
    {
        "boss": "a vampyre",
        "text": "The y makes it spookier than your regular vampire. It also makes it much more flammable.",
        "reward_text": "100 fuel every prestige",
        reward: function () {
            adventure_data["perm_resources"]["fuel"] = 100;
        }
    },
    {
        "boss": "a glass of milk",
        "text": "Wait, what's so scary about this?",
        "reward_text": "a lowered cooldown on the tower of grinding",
        reward: function () { }
    },
    {
        "boss": "mr. skeltal",
        "text": "oh, no. he came to doot doot you because you didn't drink your milk. prepare your weak bones.",
        "reward_text": "another party member (currently useless, because fuzzything44 is bad at stuff)",
        reward: function () {
            adventure_data["tower_warrior"] = { "power": 20, "health": 100, "action": "defend" };
        }
    },
];
var grinding_level = 1;
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
            update_building_amount("s_manastone");
            toggle_building_state("s_essence", true);
            buildings["s_essence"].amount++;
            update_building_amount("s_essence");
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
            update_building_amount("s_essence");
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
            update_building_amount("s_essence");
            toggle_building_state("s_essence", true);
        }
        tower();
        $("#tower_power_increase").val(pow_increase);
        $("#tower_tough_increase").val(tough_increase);
    });
    $("#events_content").append("<span class='clickable'>Enter</span> the tower. (Costs one mana stone). <br/>");
    $("#events_content span").last().click(function () { climb_tower(); });
    if (adventure_data["tower_floor"]) {
        $("#events_content").append("You're at tower floor: " + format_num(adventure_data["tower_floor"]) + "<br/>");
    }
    if (adventure_data["grind_tower_time"] != undefined) {
        var grind_tower_time = 24 * 60 * 60;
        if (adventure_data["tower_floor"] > 14) {
            grind_tower_time -= 60 * 60; /* 1 hour quicker! */
        }
        if (Date.now() - adventure_data["grind_tower_time"] > grind_tower_time * 1000 || document.URL == "http://localhost:8000/") {
            $("#events_content").append("<span class='clickable'>Enter</span> the small tower nearby. (Costs one mana stone, enterable once every 24 hours). <br/>");
            $("#events_content span").last().click(function () { climb_tower(undefined, undefined, true); });
        }
        else {
            var date = new Date(null);
            var elapsed_time = (Date.now() - adventure_data["grind_tower_time"]) / 1000;
            date.setSeconds(grind_tower_time - elapsed_time);
            var dates = date.toISOString().substr(11, 8);
            var result = dates.split(":");
            $("#events_content").append("The small tower is still closed. Come back in " + parseInt(result[0]).toString() + "hours " + parseInt(result[1]).toString() + " minutes<br/>");
        }
    }
    $("#events").removeClass("hidden");
}
function climb_tower(health, ehealth, grinding) {
    if (health === void 0) { health = undefined; }
    if (ehealth === void 0) { ehealth = undefined; }
    if (grinding === void 0) { grinding = false; }
    if (grinding) {
        $("#events_topbar").html("Small tower floor " + format_num(grinding_level));
    }
    else {
        $("#events_topbar").html("Tower floor " + format_num(adventure_data["tower_floor"]));
    }
    if (health == undefined) {
        if (resources_per_sec["mana"] >= 1) {
            resources_per_sec["mana"]--;
            buildings["s_manastone"].amount--;
            update_building_amount("s_manastone");
            health = adventure_data["tower_toughness"];
            if (grinding) {
                grinding_level = 1;
                ehealth = Math.pow(grinding_level, 2);
            }
            else {
                ehealth = Math.pow(adventure_data["tower_floor"], 2);
            }
        }
        else {
            $("#events_content").html("It seems you don't have enough mana to attempt fighting this boss. Maybe come back later?");
            return;
        }
    }
    if (adventure_data["tower_floor"] >= TOWER_DATA.length && !grinding) {
        $("#events_content").html("You're at the current top of the tower!");
    }
    else {
        var boss = "";
        var description = "";
        if (grinding) {
            boss = TOWER_DATA[grinding_level].boss;
            description = TOWER_DATA[grinding_level].text;
            adventure_data["grind_tower_time"] = Date.now();
        }
        else {
            boss = TOWER_DATA[adventure_data["tower_floor"]].boss;
            description = TOWER_DATA[adventure_data["tower_floor"]].text;
        }
        $("#events_content").html("This floor contains " + boss + ". " + description + "<br/>");
        $("#events_content").append("Your health: " + format_num(health, true) + "<br/>");
        $("#events_content").append("Enemy health: " + format_num(ehealth, true) + "<br/>");
        function fight_enemy(attack) {
            var fight_results_message = "";
            if (attack == "attack") {
                fight_results_message += "You attack!";
            }
            else if (attack == "dodge") {
                fight_results_message += "You dodge!";
            }
            else if (attack == "spaz") {
                fight_results_message += "You flail around!";
            }
            var rval = Math.random(); /* Roll random enemy attack. */
            var enemy_attack = "";
            if (rval < 1 / 3) {
                enemy_attack = "attack";
                fight_results_message += " Your enemy attacks!";
            }
            else if (rval < 2 / 3) {
                enemy_attack = "dodge";
                fight_results_message += " Your enemy defends!";
            }
            else {
                enemy_attack = "spaz";
                fight_results_message += " Your enemy spins in circles for 20 minutes!";
            }
            fight_results_message += "<br/>";
            var winstate = "won"; /* Figure out who won. */
            if (attack == enemy_attack) {
                winstate = "tie";
            }
            else if ((attack == "attack" && enemy_attack == "dodge") || (attack == "dodge" && enemy_attack == "spaz") || (attack == "spaz" && enemy_attack == "attack")) {
                winstate = "lost";
            }
            var enemy_damage = Math.pow(adventure_data["tower_floor"], 2);
            if (grinding) {
                enemy_damage = Math.pow(grinding_level, 2);
            }
            if (winstate == "won") {
                /* Deal damage*/
                ehealth -= adventure_data["tower_power"];
                fight_results_message += "You hit it!";
            }
            else if (winstate == "tie") {
                /* Both take damage */
                health -= enemy_damage;
                ehealth -= adventure_data["tower_power"];
                fight_results_message += "You hit it! But it also hit you...";
            }
            else {
                health -= enemy_damage;
                fight_results_message += "It hit you. That hurts.";
            }
            fight_results_message += "<br/>";
            if (adventure_data["tower_healer"] != undefined) {
                var heal_action = $("input:radio[name='healer_action']:checked").val();
                if (heal_action == "heal") {
                    var heal_amount = adventure_data["tower_healer"].power;
                    heal_amount = Math.min(adventure_data["tower_toughness"] - health, heal_amount); /* Can't heal past max health. */
                    health += heal_amount;
                    fight_results_message += "Your healer heals you for " + format_num(heal_amount, false) + " health.";
                }
                else { /* It's attack */
                    var heal_damage = Math.round(adventure_data["tower_healer"].power / 2);
                    ehealth -= heal_damage;
                    fight_results_message += "Your healer attacks for " + format_num(heal_damage, false) + " damage.";
                }
                adventure_data["tower_healer"].action = heal_action;
                fight_results_message += "<br/>";
            }
            /* Check for deaths. */
            if (health <= 0) {
                if (grinding) {
                    $("#events_content").html("Ouch! You were defeated.<br /> Well, that's all the grinding you can do right now. Come back in 24 hours.<br/>");
                }
                else {
                    $("#events_content").html("Ouch! You were defeated.<br /><span class='clickable'>Try</span> again? (Costs 1 mana stone)");
                    $("#events_content span").last().click(function () { climb_tower(); });
                }
            }
            else if (ehealth <= 0) {
                if (grinding) {
                    defeat_floor(health);
                }
                else {
                    defeat_floor();
                }
            }
            else {
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
        if (adventure_data["tower_healer"] != undefined) {
            $("#events_content").append("Healer Action: <div class='radio-group'>" +
                "<input type='radio' name='healer_action' id='healer_heal' value='heal'><label for='healer_heal'>Heal</label>" +
                "<input type='radio' name='healer_action' id='healer_attack' value='attack'><label for='healer_attack'>Attack</label>" +
                "</div>");
            $("#healer_" + adventure_data["tower_healer"].action).click();
        }
    }
}
function defeat_floor(health) {
    if (health === void 0) { health = undefined; }
    $("#events_content").html("Yay, you won! That was a hard battle.<br/>");
    if (health == undefined) {
        $("#events_content").append("For defeating the boss on floor " + format_num(adventure_data["tower_floor"]) + ", you are awarded with " + TOWER_DATA[adventure_data["tower_floor"]].reward_text + ". You're also a floor higher now. <br/>");
        TOWER_DATA[adventure_data["tower_floor"]].reward();
        adventure_data["tower_floor"]++;
        $("#events_content").append("<span class='clickable'>Continue</span> climbing the tower.<br/>");
        $("#events_content span").last().click(function () { climb_tower(); });
        $("#events_content").append("<span class='clickable'>Back</span> to tower base.<br/>");
        $("#events_content span").last().click(function () { tower(); });
    }
    else {
        $("#events_content").append("For defeating the boss on floor " + format_num(grinding_level) + ", you are awarded with 1 essence<br/>");
        /* Give one essence */
        toggle_building_state("s_essence", true);
        buildings["s_essence"].amount++;
        update_building_amount("s_essence");
        toggle_building_state("s_essence");
        adventure_data["current_essence"]++;
        grinding_level++;
        $("#events_content").append("<span class='clickable'>Continue</span> climbing the tower.<br/>");
        $("#events_content span").last().click(function () { climb_tower(health, Math.pow(grinding_level, 2), true); });
    }
}
//# sourceMappingURL=tower.js.map