var adventure_data = {
    ship: {
        engine: {
            name: "basic_engine",
        },
        shield: {
            name: "basic_shield",
        },
        weapon_1: {
            name: "basic_weapon",
        },
        weapon_2: null,
        weapon_3: null,
    },
    inventory_size: 100,
    inventory_fuel: 0,
    inventory: [],
    current_location: "home",
};
var player_data = {};
var enemy_data = {};
/* Sets up the adventure pane */
function start_adventure() {
    $("#character").removeClass("hidden"); /* Show adventure panels */
    $("#events").removeClass("hidden");
    update_inventory();
    /* Location name */
    $("#events_topbar").html(locations[adventure_data.current_location].name);
    /* Let them choose to adventure there or go somewhere else. */
    $("#events_content").html("Welcome to Adventure Mode! <br /> I\'m glad you want to adventure, but this feature is still a long ways from being finished. Please message me on discord if you manage to get this far though! <br />");
    $("#events_content").append("<span style='color: red'>Note: Until this announcement is removed, adventure mode gives nothing and takes nothing. Progress on it will not be saved between reloads. It exists purely for testing purposes. <em></em></span><br />");
    $("#events_content").append("<span class='clickable' onclick='travel(\"" + adventure_data.current_location + "\")'>Stay Here (" + locations[adventure_data.current_location].enter_cost.toString() + ")</span><br />");
    locations[adventure_data.current_location].connects_to.forEach(function (loc) {
        if (locations[loc].unlocked()) {
            var fuel_cost = (locations[loc].enter_cost + locations[adventure_data.current_location].leave_cost).toString();
            $("#events_content").append("<span class='clickable' onclick='travel(\"" + loc + "\");'>Go to " + locations[loc].name + " (" + fuel_cost + ")</span>");
        }
    });
}
function travel(where) {
    var fuel_cost = locations[where].enter_cost + locations[adventure_data.current_location].leave_cost;
    if (where == adventure_data.current_location) {
        fuel_cost = locations[where].enter_cost;
    }
    if (adventure_data.inventory_fuel >= fuel_cost) {
        adventure_data.current_location = where;
        adventure_data.inventory_fuel -= fuel_cost;
        update_inventory();
        run_adventure(where);
    }
}
function update_inventory() {
    $("#character_content").html('Your Ship: <br>');
    $("#character_content").append('Engines: ' + (adventure_data.ship.engine ? gen_equipment(adventure_data.ship.engine).name : "None") + "<br>");
    $("#character_content").append('Shields: ' + (adventure_data.ship.shield ? gen_equipment(adventure_data.ship.shield).name : "None") + "<br>");
    $("#character_content").append('Weapon 1: ' + (adventure_data.ship.weapon_1 ? gen_equipment(adventure_data.ship.weapon_1).name : "None") + "<br>");
    $("#character_content").append('Weapon 2: ' + (adventure_data.ship.weapon_2 ? gen_equipment(adventure_data.ship.weapon_2).name : "None") + "<br>");
    $("#character_content").append('Weapon 3: ' + (adventure_data.ship.weapon_3 ? gen_equipment(adventure_data.ship.weapon_3).name : "None") + "<hr>");
    $("#character_content").append("Ship Inventory (" + (adventure_data.inventory.length + adventure_data.inventory_fuel).toString() + "/" + adventure_data.inventory_size.toString() + "): <br>");
    $("#character_content").append("Fuel: " + adventure_data.inventory_fuel.toString() + "<br />");
}
function set_equipment() {
    $("#events_topbar").html("Equipment Management");
    $("#events_content").html("You think you can do stuff, but you can't. <br> At least you can see what you have equipped to your ship.");
    update_inventory();
}
/* Selects an adventure at a given location and runs it */
function run_adventure(location) {
    var chosen_encounter = null;
    var available_encounters = [];
    var forced_encounters = [];
    var total_weight = 0;
    locations[location].encounters.forEach(function (loc) {
        if (loc.condition()) {
            if (loc.weight > 0) {
                available_encounters.push(loc); /* Add encounter */
                total_weight += loc.weight; /* Add weight to total. */
            }
            else {
                forced_encounters.push(loc); /* Add it to forced encounters. */
            }
        }
    });
    /* Choose a forced encounter if possible */
    if (forced_encounters.length > 0) {
        chosen_encounter = forced_encounters[Math.floor(Math.random() * forced_encounters.length)];
    }
    else if (available_encounters.length > 0) {
        var roll_1 = Math.floor(Math.random() * total_weight);
        available_encounters.some(function (enc) {
            if (roll_1 < enc.weight) {
                chosen_encounter = enc;
                return true;
            }
            else {
                roll_1 -= enc.weight;
                return false;
            }
        });
    }
    else {
        $("#events_topbar").html("Oops...");
        $("#events_content").html("Something went wrong and no encounter could be selected. Please contact fuzzything44 about this. Include in your report where you were trying to adventure.");
        return;
    }
    $("#events_topbar").html(chosen_encounter.title);
    chosen_encounter.run_encounter();
    //setup_combat({});
    /* Currently player always gets to start.*/
    //start_turn(player_data);
}
/* Sets up combat */
function setup_combat(enemy_info) {
    $("#events_topbar").html("Combat Test");
    $("#events_content").html("<span id='combat_log'>Combat Log</span><div id='combat' style='height: 30em; width: 40em; margin: auto;'></div>");
    $("#combat").html("<div id='combat_attack' style='height: 15em; border: solid white 1px;'>Attack</div>");
    $("#combat").append("<div id='combat_stats' style='height: 15em; border: solid white 1px;'>Stats</div>");
    $("#combat").append("<div id='combat_counter' style='width: 4em; height: 1.5em; border: solid white 1px; background: #444; position: relative; top: -16em;'></div>");
    $("#combat_stats").html("<div id='combat_energy' style='position: relative; top: 1em; height: 14em; width: 2em;'></div>");
    /* Setup energy */
    $("#combat_energy").html("<img src='images/power.png' alt='' style='width: 1.5em; height: 1.5em;' />");
    for (var i = 0; i < 10; i++) {
        $("#combat_energy").append("<div id='combat_energy_" + i.toString() + "' class='energy_box_disabled'></div>");
    }
    /* Setup shields */
    $("#combat_attack").html("<div id='combat_shield' style='height: 14em; width: 2em; vertical-align: bottom; display: table-cell;'></div>");
    for (var i = 4; i >= 0; i--) {
        $("#combat_shield").append("<img id='combat_shield_" + i.toString() + "' src='images/shield_off.png' style='height: 2.5em; width: 2.5em;' />");
    }
    $("#combat_stats").append("<div id='stats_area' style='position: relative; top: -14em; left: 2.5em; width: 35em; height: 15em; margin: auto;'></div>");
    $("#combat_attack").append("<div id='attack_area' style='position: relative; top: -14em; left: 2.5em; width: 35em; height: 15em; margin: auto;'></div>");
    /* Setup player stats */
    player_data = {
        max_shields: 0,
        shields: 0,
        power_shields: 0,
        energy: 0,
        energy_left: 0,
        actions_per_turn: 0,
        actions_left: 0,
        weapon_1: {
            charge_level: 0,
            extra_damage: 0,
        },
        weapon_2: {
            charge_level: 0,
            extra_damage: 0,
        }, weapon_3: {
            charge_level: 0,
            extra_damage: 0,
        },
        dodge_chance: 0,
        effects: []
    };
    /* Go through ship and update stuff */
    ["engine", "shield", "weapon_1", "weapon_2", "weapon_3"].forEach(function (equip_type) {
        if (adventure_data.ship[equip_type]) {
            gen_equipment(adventure_data.ship[equip_type]).on_combat(equip_type);
        }
    });
    /* Setup enemy. May do this differently in the future. */
    enemy_data = {
        max_shields: 0,
        shields: 1,
        power_shields: 0,
        energy: 0,
        energy_left: 0,
        actions_per_turn: 7,
        actions_left: 0,
        weapon_1: {
            charge_level: 0,
            extra_damage: 0,
            on_charge: function () { },
            on_fire: function () { }
        },
        weapon_2: {
            charge_level: 0,
            extra_damage: 0,
            on_charge: function () { },
            on_fire: function () { }
        }, weapon_3: {
            charge_level: 0,
            extra_damage: 0,
            on_charge: function () { },
            on_fire: function () { }
        },
        dodge_chance: 0,
        effects: []
    };
}
function start_turn(run_on) {
    /* Start a turn, so refresh energy/actions and update effects */
    run_on.energy_left = run_on.energy;
    run_on.actions_left = run_on.actions_per_turn;
    Object.keys(run_on.effects).forEach(function (eff_id) {
        /* Effects return true if they should be deleted. We give them who they're effecting. */
        if (run_on.effects[eff_id](run_on)) {
            remove_effect(run_on, eff_id);
        }
    });
    update_combat(0);
    if (run_on == player_data) {
        $("#combat_log").text("Your turn");
    }
    else {
        /* Enemy turn, so we grant the AI control */
        enemy_action();
    }
}
function add_effect(to_who, eff_func) {
    if (typeof this.eff_num == "undefined") {
        this.eff_num = 0;
    }
    to_who.effects[this.eff_num] = eff_func;
    return this.eff_num++;
}
function remove_effect(to_who, eff_num) {
    delete to_who.effects[eff_num];
}
function update_combat(actions_used) {
    /* Check for win/loss */
    if (player_data["shields"] < 0) {
        alert("You lost...");
        start_adventure();
        return 1;
    }
    if (enemy_data["shields"] < 0) {
        alert("You won!");
        start_adventure();
        return 1;
    }
    /* Update shields */
    if (player_data["shields"] < player_data["power_shields"]) {
        player_data["shields"] = player_data["power_shields"];
    }
    for (var i = 4; i >= 0; i--) {
        var shield_state = "off";
        if (i < player_data["shields"]) {
            shield_state = "on";
        }
        if (i < player_data["power_shields"]) {
            shield_state = "power";
        }
        $("#combat_shield_" + i.toString()).attr("src", "images/shield_" + shield_state + ".png");
    }
    /* Update energy */
    for (var i = 0; i < 10; i++) {
        $("#combat_energy_" + i.toString()).removeClass("energy_box_on energy_box_off energy_box_disabled");
        var box_state = "off";
        if (i < player_data["energy_left"]) {
            box_state = "on";
        }
        if (i >= player_data["energy"]) {
            box_state = "disabled";
        }
        $("#combat_energy_" + i.toString()).addClass("energy_box_" + box_state);
    }
    /* Update weapons + stats. TODO: dynamically update depending on what they have */
    //$("#weapon").text('(' + player_data["weapon_charge"].toString() + ") Fire Laser [2]");
    /* Update how many actions left. */
    player_data["actions_left"] -= actions_used;
    $("#combat_counter").html(player_data["actions_left"].toString());
    if (actions_used > 0) {
        if (player_data["actions_left"] <= 0) {
            /* Give enemy control */
            setTimeout(start_turn(enemy_data), 1000);
        }
    }
    return 0;
}
function enemy_action() {
    if (enemy_data["actions_left"] <= 0) {
        start_turn(player_data);
        return;
    }
    player_data["shields"] -= 1;
    enemy_data["actions_left"] -= 1;
    if (update_combat(0)) {
        return;
    }
    $("#combat_log").text("Enemy attacks! You take 1 damage. Shields at " + player_data["shields"].toString());
    setTimeout(enemy_action, 1000);
}
//# sourceMappingURL=adventure.js.map