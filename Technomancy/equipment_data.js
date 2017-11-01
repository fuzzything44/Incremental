function gen_equipment(equip_data) {
    var equip = $.extend(true, {}, equipment[equip_data.name]);
    /* Here we do modification on equip if we have stuff that can. */
    if (equip.modify != undefined) {
        equip.modify(equip, equip_data);
    }
    return equip;
}
var equipment = {
    /* Engines */
    "basic_engine": {
        on_combat: function (slot) {
            player_data["energy"] += 4;
            player_data["actions_per_turn"] += 4;
            $("#stats_area").append("<span class='clickable'>Pass Turn</span><br>");
            $("#stats_area > span").last().click(function () {
                update_combat(player_data["actions_left"]);
            });
        },
        type: "engine",
        name: "Basic Engine",
    },
    "time_engine": {
        on_combat: function (slot) {
            player_data["energy"] += 3;
            player_data["actions_per_turn"] += 7;
            add_effect(enemy_data, function (data) {
                data["actions_left"] = 0;
                return true;
            });
            $("#stats_area").append("<span class='clickable'>Pass Turn</span><br>");
            $("#stats_area > span").last().click(function () {
                update_combat(player_data["actions_left"]);
            });
        },
        type: "engine",
        name: "Warp Drive",
    },
    /* Shields */
    "basic_shield": {
        on_combat: function (slot) {
            player_data["max_shields"] += 3;
            player_data["shields"] += 3;
        },
        type: "shield",
        name: "Basic Shields",
    },
    /* Weapons */
    "basic_weapon": {
        on_combat: function (slot) {
            /* Add charge button */
            $("#stats_area").append("<span class='clickable'>(2) Charge Small Lazer " + slot[slot.length - 1] + " [1]</span><br>");
            /* Add what happens when they charge */
            $("#stats_area > span").last().click(function (e) {
                /* Not player's turn. Do nothing. */
                if (player_data["actions_left"] < 1) {
                    return;
                }
                if (player_data["energy_left"] < 2) {
                    $("#combat_log").text("Not enough energy to allocate.");
                    return;
                }
                /* Use energy, charge weapon */
                player_data["energy_left"] -= 2;
                player_data[slot].charge_level += 1;
                /* Update visuals */
                $("#combat_" + slot).text('(' + player_data[slot].charge_level.toString() + ") Fire Small Lazer " + slot[slot.length - 1] + " [1]");
                $("#combat_log").text("2 Energy allocated to Small Lazer " + slot[slot.length - 1]);
                /* Update and use actions */
                update_combat(1);
            });
            /* Add Fire button*/
            $("#attack_area").append("<span class='clickable' id='combat_" + slot + "'>(0) Fire Small Lazer " + slot[slot.length - 1] + " [1]</span>");
            $("#attack_area > span").last().click(function () {
                if (player_data["actions_left"] < 1) {
                    return;
                }
                if (player_data[slot].charge_level < 1) {
                    $("#combat_log").text("Weapon not charged");
                    return;
                }
                /* Attack! */
                enemy_data["shields"] -= 1;
                player_data[slot].charge_level -= 1;
                /* Update visuals */
                $("#combat_" + slot).text('(' + player_data[slot].charge_level.toString() + ") Fire Small Lazer " + slot[slot.length - 1] + " [1]");
                $("#combat_log").text("Small Lazer " + slot[slot.length - 1] + " fired for 1 damage!");
                update_combat(1);
            });
            /* Rapid fire option */
            $("#attack_area").append("<span class='clickable' id='combat_" + slot + "'>Multishot Small Lazer " + slot[slot.length - 1] + " [3]</span><br>");
            $("#attack_area > span").last().click(function () {
                if (player_data["actions_left"] < 1) {
                    return;
                }
                else if (player_data["actions_left"] < 3) {
                    $("#combat_log").text("Not enough actions left.");
                }
                /* Attack! */
                $("#combat_log").text("Small Lazer " + slot[slot.length - 1] + " fired for 1 damage " + player_data[slot].charge_level.toString() + " times!");
                while (player_data[slot].charge_level > 0) {
                    enemy_data["shields"] -= 1;
                    if (update_combat(0)) {
                        return;
                    }
                    player_data[slot].charge_level -= 1;
                }
                /* Update visuals */
                $("#combat_" + slot).text('(' + player_data[slot].charge_level.toString() + ") Fire Small Lazer " + slot[slot.length - 1] + " [1]");
                /* Add burnout effect */
                add_effect(player_data, function (plr) {
                    plr.energy_left -= 1;
                    return true;
                });
                update_combat(3);
            });
        },
        type: "weapon",
        name: "Small Laser",
    },
    /* Other */
    "machine_part": {
        type: "item",
        name: "Machine Part",
    },
    "magic_orb": {
        type: "item",
        name: "Magic Orb",
        modify: function (self, data) {
            /* from Umbra: const elements = ["time", "energy", "space", "force"]; */
            self["element"] = data.elem;
            self.name += " (" + data.elem + ")";
            self.use = function (index, location) {
                switch (data.elem) {
                    case "time": {
                        resources["time"].amount += 120;
                        break;
                    }
                    case "energy": {
                        resources_per_sec["energy"].amount += 8;
                        setTimeout(function () { return resources_per_sec["energy"] -= 8; }, 60000);
                        break;
                    }
                    case "space": {
                        if (location == "warehouse") {
                            alert("Using that right now wouldn't do anything.");
                            return;
                        }
                        /* If they have 4 fuel and at least 4 inventory spaces open. */
                        if (resources["fuel"].amount >= 4 && (adventure_data.inventory_size - adventure_data.inventory.length - adventure_data.inventory_fuel) >= 4) {
                            resources["fuel"].amount -= 4;
                            adventure_data.inventory_fuel += 4;
                            break;
                        }
                        else {
                            return;
                        }
                    }
                    case "force": {
                        resources["fuel"].amount += 12;
                        break;
                    }
                }
                /* Remove it from inventory after use */
                adventure_data[location].splice(index, 1);
                update_inventory();
            }; /* End use function */
        },
    },
};
//# sourceMappingURL=equipment_data.js.map