var adventure_data = {
    actions: 5,
    shields: 3,
    power_shields: 1,
    energy: 5,
};
var combat_data = {};
var enemy_data = {};
/* Sets up the adventure pane */
function start_adventure() {
    $("#character").removeClass("hidden");
    $("#events").removeClass("hidden");
    $("#events_topbar").html("Adventure!");
    $("#events_content").html("Welcome to Adventure Mode! <br /> I\'m glad you want to adventure, but this feature is still a long ways from being finished. Please message me on discord if you manage to get this far though! <br />");
    $("#events_content").append("<span style='color: red'>Note: Until this announcement is removed, adventure mode gives nothing and takes nothing. Progress on it will not be saved between reloads. It exists purely for testing purposes.</span><br />");
    $("#events_content").append("<span class='clickable' onclick='setup_combat()'>Start adventure!</span>");
}
function setup_combat() {
    $("#events_topbar").html("Combat Test");
    $("#events_content").html("<span id='combat_log'>Combat Log</span><div id='combat' style='height: 30em; width: 40em; margin: auto;'></div>");
    $("#combat").html("<div id='combat_attack' style='height: 15em; border: solid white 1px;'>Attack</div>");
    $("#combat").append("<div id='combat_stats' style='height: 15em; border: solid white 1px;'>Stats</div>");
    $("#combat").append("<div id='combat_counter' style='width: 4em; height: 1.5em; border: solid white 1px; background: #444; position: relative; top: -16em;'></div>");
    $("#combat_stats").html("<div id='combat_energy' style='position: relative; top: 1em; height: 14em; width: 2em;'></div>");
    combat_data["enemy_actions"] = 3;
    combat_data["actions_per_turn"] = adventure_data.actions;
    combat_data["actions_left"] = adventure_data.actions;
    /* Setup energy */
    $("#combat_energy").html("<img src='images/power.png' alt='' style='width: 1.5em; height: 1.5em;' />");
    for (var i = 0; i < 10; i++) {
        $("#combat_energy").append("<div id='combat_energy_" + i.toString() + "' class='energy_box_disabled'></div>");
    }
    combat_data["energy"] = adventure_data.energy;
    combat_data["energy_used"] = 0;
    /* Setup shields */
    $("#combat_attack").html("<div id='combat_shield' style='height: 14em; width: 2em; vertical-align: bottom; display: table-cell;'></div>");
    for (var i = 4; i >= 0; i--) {
        $("#combat_shield").append("<img id='combat_shield_" + i.toString() + "' src='images/shield_off.png' style='height: 2.5em; width: 2.5em;' />");
    }
    combat_data["shields"] = adventure_data.shields;
    combat_data["power_shields"] = adventure_data.power_shields;
    $("#combat_stats").append("<div id='stats_area' style='position: relative; top: -14em; left: 2.5em; width: 35em; height: 15em; margin: auto;'></div>");
    $("#combat_attack").append("<div id='attack_area' style='position: relative; top: -14em; left: 2.5em; width: 35em; height: 15em; margin: auto;'></div>");
    /* Setup weapons */
    $("#attack_area").append("<span id='weapon' class='clickable' onclick='attack()'>Fire Laser</span>");
    combat_data["weapon_charge"] = 0;
    /* Setup power use */
    $("#stats_area").append("<span id='shields' class='clickable' onclick='allocate_energy(\"shields\")'>Boost Shields</span>");
    $("#stats_area").append("<span id='shields' class='clickable' onclick='allocate_energy(\"weapons\")'>Power Laser</span>");
    /* Setup enemy. Probably will be done in it's own function, but we need a fake enemy for now. */
    enemy_data = { "shields": 3, "attack": 1, "moves": 3 };
    update_combat(0);
}
function attack() {
    /* Make sure it's their turn before acting */
    if (combat_data["actions_left"] < 1) {
        return;
    }
    else if (combat_data["actions_left"] < 2) {
        $("#combat_log").text("Not enough actions!");
    }
    if (combat_data["weapon_charge"] > 0) {
        combat_data["weapon_charge"] -= 1;
        enemy_data["shields"] -= 1;
        $("#combat_log").text("You attack! Enemy shields at " + enemy_data["shields"].toString());
        update_combat(2);
    }
    else {
        $("#combat_log").text("Weapons not charged.");
        update_combat(0);
    }
}
function allocate_energy(to_what) {
    /* Make sure it's their turn before acting */
    if (combat_data["actions_left"] < 1) {
        return;
    }
    if (combat_data["energy_used"] >= combat_data["energy"]) {
        $("#combat_log").text("Not enough energy!");
        update_combat(0);
        return;
    }
    switch (to_what) {
        case "shields": {
            if (combat_data["shields"] < 5) {
                combat_data["energy_used"] += 1;
                combat_data["shields"] += 1;
            }
            else {
                $("#combat_log").text("Shields at max power!");
                update_combat(0);
                return;
            }
            break;
        }
        case "weapons": {
            combat_data["weapon_charge"] += 1;
            combat_data["energy_used"] += 1;
            break;
        }
    }
    $("#combat_log").text("Energy allocated to " + to_what);
    update_combat(1);
}
function update_combat(actions_used) {
    /* Check for win/loss */
    if (combat_data["shields"] < 0) {
        alert("You lost...");
        start_adventure();
        return;
    }
    if (enemy_data["shields"] < 0) {
        alert("You won!");
        start_adventure();
        return;
    }
    /* Update shields */
    if (combat_data["shields"] < combat_data["power_shields"]) {
        combat_data["shields"] = combat_data["power_shields"];
    }
    for (var i = 4; i >= 0; i--) {
        var shield_state = "off";
        if (i < combat_data["shields"]) {
            shield_state = "on";
        }
        if (i < combat_data["power_shields"]) {
            shield_state = "power";
        }
        $("#combat_shield_" + i.toString()).attr("src", "images/shield_" + shield_state + ".png");
    }
    /* Update energy */
    for (var i = 0; i < 10; i++) {
        $("#combat_energy_" + i.toString()).removeClass("energy_box_on energy_box_off energy_box_disabled");
        var box_state = "off";
        if (i < combat_data["energy"] - combat_data["energy_used"]) {
            box_state = "on";
        }
        if (i >= combat_data["energy"]) {
            box_state = "disabled";
        }
        $("#combat_energy_" + i.toString()).addClass("energy_box_" + box_state);
    }
    /* Update how many actions left. */
    combat_data["actions_left"] -= actions_used;
    $("#combat_counter").html(combat_data["actions_left"].toString());
    if (actions_used > 0) {
        if (combat_data["actions_left"] <= 0) {
            for (var i = 0; i < combat_data["enemy_actions"]; i++) {
                setTimeout(enemy_action, 1000 * (i + 1));
            }
            setTimeout(function () { combat_data["actions_left"] = combat_data["actions_per_turn"]; combat_data["energy_used"] = 0; $("#combat_log").text("Your turn"); update_combat(0); }, 1000 * (combat_data["enemy_actions"] + 1));
        }
    }
}
function enemy_action() {
    combat_data["shields"] -= 1;
    update_combat(0);
    $("#combat_log").text("Enemy attacks! You take 1 damage. Shields at " + combat_data["shields"].toString());
}
//# sourceMappingURL=adventure.js.map