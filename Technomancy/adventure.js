var base_adventure_data = {
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
    inventory_size: 20,
    inventory_fuel: 0,
    inventory: [],
    warehouse: [],
    current_location: "home",
};
var adventure_data = JSON.parse(JSON.stringify(base_adventure_data)); /* Make a copy so we can reset adv_data easily. */
var player_data = {};
var enemy_data = {};
/* Sets up the adventure pane */
function start_adventure() {
    $("#character").removeClass("hidden"); /* Show adventure panels */
    $("#events").removeClass("hidden");
    update_inventory();
    /* Load location */
    var location_data = get_location(adventure_data.current_location);
    /* Location name */
    $("#events_topbar").html(location_data.name);
    /* Let them choose to adventure there or go somewhere else. */
    $("#events_content").html("You are currently at " + location_data.name + ". What will you do?<br />");
    var color = location_data.leave_cost <= adventure_data.inventory_fuel ? "default" : "red";
    $("#events_content").append("<span class='clickable' style='color:" + color + ";' onclick='travel(\"" + adventure_data.current_location + "\")'>" + location_data.go_again_text + " (" + format_num(location_data.leave_cost, false) + ")</span><br />");
    location_data.connects_to.forEach(function (loc) {
        var test_connection = get_location(loc);
        if (test_connection.unlocked()) {
            var fuel_cost = test_connection.enter_cost + location_data.leave_cost;
            var color_1 = fuel_cost <= adventure_data.inventory_fuel ? "default" : "red";
            $("#events_content").append("<span class='clickable' onclick='travel(\"" + loc + "\");' style='color:" + color_1 + ";'>Go to " + test_connection.name + " (" + format_num(fuel_cost, false) + ")</span><br />");
        }
    });
    if (adventure_data.current_location != "home") {
        $("#events_content").append("<span class='clickable' onclick='travel(\"home\");'>Go Home (0)</span>");
    }
    /* Give Christmas present.
    if (adventure_data["last_gift"] == undefined || adventure_data["last_gift"] < 2018) {
        $("#events_content").append("<br /><br />Merry Christmas!<br />A small gift has been added to your warehouse!");
        adventure_data.warehouse.push({ name: "present", year: "2018", open: false });
        adventure_data["last_gift"] = 2018;
    } */
}
function get_location(where) {
    if (this["aloc_" + where]) {
        return this["aloc_" + where];
    }
    else {
        var loc_data_1 = {};
        $.getScript("locations/" + where + ".js", function (res) { loc_data_1 = eval(res); });
        this["aloc_" + where] = loc_data_1;
        return loc_data_1;
    }
}
function travel(where) {
    /* Get location data */
    var location_data = get_location(adventure_data.current_location);
    var to_where = get_location(where);
    var fuel_cost = to_where.enter_cost + location_data.leave_cost;
    /* If we're just doing an explore, only charge the exit cost. */
    if (where == adventure_data.current_location) {
        fuel_cost = to_where.leave_cost;
    }
    if (where == "home") {
        fuel_cost = 0;
    }
    if (adventure_data.inventory_fuel >= fuel_cost) {
        adventure_data.current_location = where;
        adventure_data.inventory_fuel -= fuel_cost;
        location_data = to_where;
        update_inventory();
        run_adventure(where);
    }
}
/* Checks how many items they have with a name in inventory (or warehouse) with data fields same as has_data*/
function count_item(name, from_where, has_data) {
    if (from_where === void 0) { from_where = adventure_data.inventory; }
    if (has_data === void 0) { has_data = {}; }
    var count = 0;
    var _loop_1 = function (i) {
        if (from_where[i].name == name) {
            try {
                /* Make sure all has_data paramaters are found. */
                Object.keys(has_data).forEach(function (param) {
                    /* Test one specific param. */
                    if (from_where[i][param] != has_data[param]) {
                        throw "This is not the object we're looking for.";
                    }
                });
                count++;
            }
            catch (e) {
                console.error(e);
            }
        }
    };
    for (var i = 0; i < from_where.length; i++) {
        _loop_1(i);
    }
    return count;
}
/* Returns index of item with given name, checking inventory (or warehouse) with data fields the same as has_data.
   Note: item could have extra data fields and will still return true.
*/
function find_item(name, from_where, has_data) {
    if (from_where === void 0) { from_where = adventure_data.inventory; }
    if (has_data === void 0) { has_data = {}; }
    var _loop_2 = function (i) {
        if (from_where[i].name == name) {
            try {
                /* Make sure all has_data paramaters are found. */
                Object.keys(has_data).forEach(function (param) {
                    /* Test one specific param. */
                    if (from_where[i][param] != has_data[param]) {
                        throw "This is not the object we're looking for.";
                    }
                });
                return { value: i };
            }
            catch (e) {
                console.error(e);
            }
        }
    };
    for (var i = 0; i < from_where.length; i++) {
        var state_1 = _loop_2(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return -1;
}
function update_inventory() {
    $("#character_content").html('Your Ship: <br>');
    $("#character_content").append('Engines: ' + (adventure_data.ship.engine ? gen_equipment(adventure_data.ship.engine).name : "None") + "<br>");
    $("#character_content").append('Shields: ' + (adventure_data.ship.shield ? gen_equipment(adventure_data.ship.shield).name : "None") + "<br>");
    $("#character_content").append('Weapon 1: ' + (adventure_data.ship.weapon_1 ? gen_equipment(adventure_data.ship.weapon_1).name : "None") + "<br>");
    $("#character_content").append('Weapon 2: ' + (adventure_data.ship.weapon_2 ? gen_equipment(adventure_data.ship.weapon_2).name : "None") + "<br>");
    $("#character_content").append('Weapon 3: ' + (adventure_data.ship.weapon_3 ? gen_equipment(adventure_data.ship.weapon_3).name : "None") + "<hr>");
    if (isNaN(adventure_data.inventory_fuel)) {
        adventure_data.inventory_fuel = 0;
    }
    $("#character_content").append("Ship Inventory (" + format_num(adventure_data.inventory.length + adventure_data.inventory_fuel, false) + "/" + format_num(adventure_data.inventory_size, false) + "): <br>");
    $("#character_content").append("Fuel: " + format_num(adventure_data.inventory_fuel, false) + "<br />");
    var _loop_3 = function (i) {
        var equip = gen_equipment(adventure_data.inventory[i]);
        $("#character_content").append(equip.name);
        if (equip.use != undefined) {
            $("#character_content").append("<span class='clickable'>Use</span>");
            $("#character_content > span").last().click(function () { return equip.use(i, "inventory"); });
        }
        $("#character_content").append("<br />");
    };
    for (var i = 0; i < adventure_data.inventory.length; i++) {
        _loop_3(i);
    }
}
/* Sets the equipment to the proper slot, moves previous to warehouse, moves equipped from warehouse, refreshes equipment menu.*/
function equip_item(slot, index) {
    var to_add = adventure_data.warehouse[index];
    var to_remove = adventure_data.ship[slot];
    var add_type = gen_equipment(to_add).type;
    /* Make sure equipment to set is actually of the proper type */
    if (add_type == slot || (add_type == "weapon" && slot.slice(0, 6) == "weapon")) {
        adventure_data.warehouse[index] = to_remove; /* Just swapping slots should make it a bit faster. */
        /* Unless the equip slot was null, so we need to check that and remove it. */
        if (to_remove == null) {
            adventure_data.warehouse.splice(index, 1);
        }
        adventure_data.ship[slot] = to_add;
    }
    set_equipment();
}
function set_equipment() {
    update_inventory();
    $("#events_topbar").html("Equipment Management");
    $("#events_content").html("Equipment Manager<br />");
    $("#events_content").append("<span class='clickable' onclick='travel(\"home\")'>Back</span>");
    /* Our equipment types and lists of equipment we have that goes to them. Each element is an object with equip and warehouse_index */
    var equip_mappings = { "engine": [], "shield": [], "weapon": [] };
    for (var i = 0; i < adventure_data.warehouse.length; i++) {
        /* Generate each item only once. */
        var generated = gen_equipment(adventure_data.warehouse[i]);
        /* Item is one of our equip types */
        if (equip_mappings[generated.type]) {
            equip_mappings[generated.type].push({ equip: generated, warehouse_index: i });
        }
    }
    /* For each equip type, add data for it. */
    Object.keys(equip_mappings).forEach(function (type) {
        /* Do nothing if they don't have anything of the type */
        if (equip_mappings[type].length == 0) {
            return;
        }
        $("#events_content").append("<hr />" + type.charAt(0).toUpperCase() + type.slice(1) + "s: <br />");
        /* Add all engine items. */
        equip_mappings[type].forEach(function (item) {
            $("#events_content").append(item.equip.name);
            if (type != "weapon") {
                $("#events_content").append("<span class='clickable' onclick='equip_item(\"" + type + "\"," + item.warehouse_index.toString() + ")'>Equip</span>");
            }
            else {
                $("#events_content").append("<span class='clickable' onclick='equip_item(\"weapon_1\"," + item.warehouse_index.toString() + ")'>Equip</span>");
                $("#events_content").append("<span class='clickable' onclick='equip_item(\"weapon_2\"," + item.warehouse_index.toString() + ")'>[2]</span>");
                $("#events_content").append("<span class='clickable' onclick='equip_item(\"weapon_3\"," + item.warehouse_index.toString() + ")'>[3]</span>");
            }
            $("#events_content").append("<br />");
        });
    });
}
/* Selects an adventure at a given location and runs it */
function run_adventure(location) {
    /* Get location data. */
    var location_data = get_location(location);
    var global_data = get_location("global");
    var chosen_encounter = null;
    var available_encounters = [];
    var forced_encounters = [];
    var total_weight = 0;
    var encounters = location_data.encounters;
    if (location_data.leave_cost) {
        encounters = encounters.concat(global_data.encounters);
    }
    encounters.forEach(function (loc) {
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
}
/* Sets up combat */
var on_win = function () { }; /* Called when player wins. If they lose, nothing gets called. */
var enemy_ai = function () { }; /* Called whenever enemy must take an action, once per second until out of actions. Must use up some amount of actions to avoid an infinite loop! */
function setup_combat(enemy_info, win_callback, ai) {
    on_win = win_callback;
    enemy_ai = ai;
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
    /* Setup enemy. This is everything the enemy can have. Then modified by enemy info. */
    enemy_data = {
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
            on_charge: function () { },
            on_fire: function () { }
        },
        weapon_2: {
            charge_level: 0,
            extra_damage: 0,
            on_charge: function () { },
            on_fire: function () { }
        },
        weapon_3: {
            charge_level: 0,
            extra_damage: 0,
            on_charge: function () { },
            on_fire: function () { }
        },
        dodge_chance: 0,
        effects: []
    };
    /* Update player stats as needed. Some stuff may change enemy stats so we do this after enemies can have stats. */
    ["engine", "shield", "weapon_1", "weapon_2", "weapon_3"].forEach(function (equip_type) {
        if (adventure_data.ship[equip_type]) {
            gen_equipment(adventure_data.ship[equip_type]).on_combat(equip_type);
        }
    });
    /* And perform a potion update. Just run it's update function with on_combat set to true. */
    if (adventure_data["current_potion"]) {
        gen_equipment(adventure_data["current_potion"].data).effect(adventure_data["current_potion"].power, true);
    }
    /* Update enemy stats as needed. */
    Object.keys(enemy_info).forEach(function (key) {
        enemy_data[key] = enemy_info[key];
    });
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
        $("#events_content").html("You lost. <br /><span class='clickable' onclick='start_adventure()'>Leave</span>");
        if (adventure_data["losses"]) {
            adventure_data["losses"]++;
        }
        else {
            adventure_data["losses"] = 1;
        }
        return 1;
    }
    if (enemy_data["shields"] < 0) {
        on_win();
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
    /* End turn if out of actions */
    if (enemy_data["actions_left"] <= 0) {
        start_turn(player_data);
        return;
    }
    /* Do whatever we need to do. */
    enemy_ai();
    /* Mostly done to check for player death. */
    if (update_combat(0)) {
        return;
    }
    /* Let's continue on next second. */
    setTimeout(enemy_action, 1000);
}
function exit_button(text) {
    return "<span class='clickable' onclick='start_adventure()'>" + text + "</span>";
}
//# sourceMappingURL=adventure.js.map