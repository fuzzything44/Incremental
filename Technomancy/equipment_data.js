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
    "cannon": {
        on_combat: function (slot) {
            /* Add charge button */
            $("#stats_area").append("<span class='clickable' id='weapon_" + slot + "_charger'>(1) Charge Cannon " + slot[slot.length - 1] + " [3]</span><br>");
            /* Add what happens when they charge */
            $("#stats_area > span").last().click(function (e) {
                /* Not player's turn. Do nothing. */
                if (player_data["actions_left"] < 3) {
                    return;
                }
                if (player_data["energy_left"] < 1) {
                    $("#combat_log").text("Not enough energy to allocate.");
                    return;
                }
                /* Use energy, charge weapon */
                player_data["energy_left"] -= 1;
                player_data[slot].charge_level += 1;
                /* Update visuals */
                $("#combat_" + slot).text('(' + player_data[slot].charge_level.toString() + ") Fire Cannon " + slot[slot.length - 1] + " [1]");
                $("#combat_log").text("1 Energy allocated to Cannon " + slot[slot.length - 1]);
                /* Update and use actions */
                $("#weapon_" + slot + "_charger").remove(); /* Can only fire once! */
                update_combat(3);
            });
            /* Add Fire button*/
            $("#attack_area").append("<span class='clickable' id='combat_" + slot + "'>(0) Fire Cannon " + slot[slot.length - 1] + " [1]</span>");
            $("#attack_area > span").last().click(function () {
                if (player_data["actions_left"] < 1) {
                    return;
                }
                if (player_data[slot].charge_level < 1) {
                    $("#combat_log").text("Weapon not charged");
                    return;
                }
                /* Attack! */
                enemy_data["shields"] -= 3;
                /* Update visuals */
                $("#combat_" + slot).remove();
                $("#combat_log").text("Cannon " + slot[slot.length - 1] + " fired for 3 damage!");
                update_combat(1);
            });
        },
        type: "weapon",
        name: "Cannon",
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
    "dimension_shard": {
        type: "item",
        name: "Dimension Shard",
    },
    "conv_cube": {
        type: "item",
        name: "Convolution Cube",
        modify: function (self, data) {
            function verify_data() {
                /* Make sure we have all the data fields. */
                /* Basic values */
                ["color", "shape", "stripes", "corners"].forEach(function (type) {
                    if (data[type] == undefined) {
                        data[type] = 0;
                    }
                });
                /* Points are useful! */
                if (data.points == undefined) {
                    data.points = 0;
                }
                /* Levers as a whole. */
                if (data.levers == undefined) {
                    data.levers = {};
                }
                /*Individual levers. All set down. */
                [
                    "cyan", "magenta", "yellow",
                    "iron", "copper", "lead",
                    "squishy", "slimy",
                    "flaming", "shaking", "ghostly"
                ].forEach(function (type) {
                    if (data.levers[type] == undefined) {
                        data.levers[type] = false;
                    }
                });
                /* Last action. */
                if (data.last_action == undefined) {
                    data.last_action = 0;
                }
            }
            verify_data();
            self.use = function (index, location) {
                /* Definitions of stuff. */
                var COLORS = ["red", "green", "blue", "black", "white"];
                var SHAPES = ["pyramid", "cube", "octahedron", "cylinder"];
                var STRIPES = ["no", "thin", "thick"];
                var CORNERS = ["sharp", "rounded"];
                /* Runs an action if possible. Oh boy will this be fun. */
                function run_action(action) {
                    /* Check time limit. */
                    if (Date.now() - data.last_action < 5000 && (data.points < 500 || data.points > 600)) {
                        /* Too fast. */
                        $("#events_content").prepend("Please wait, your cube is still working from your last action.<br />");
                        return;
                    }
                    /* Tracking what will be modified. */
                    var modification = {
                        /* How much to add/subtract from color. */
                        color: 0,
                        shape: 0,
                        stripes: 0,
                        corners: 0,
                        points: 0,
                        /* Flip these levers? */
                        levers: {
                            cyan: false,
                            magenta: false,
                            yellow: false,
                            iron: false,
                            copper: false,
                            /* None */
                            lead: false,
                            squishy: false,
                            slimy: false,
                            flaming: false,
                            shaking: false,
                            ghostly: false,
                        },
                        /* Cost 1s of production. */
                        resource_costs: JSON.parse(JSON.stringify(resources_per_sec)),
                    };
                    /* Apply our action. */
                    action(modification);
                    /* Apply all other actions. */
                    /* Lever modifications. This is the biggest part. */
                    /* Color levers */
                    if (data.levers.cyan) {
                        modification.shape++;
                    }
                    if (data.levers.magenta) {
                        modification.corners++;
                    }
                    if (data.levers.yellow) {
                        modification.resource_costs.gold += 2000;
                        /* Remove costs */
                        if (modification.resource_costs.money < 0) {
                            modification.resource_costs.money = 0;
                        }
                        /* And give bonus. */
                        modification.resource_costs.money -= 150000;
                    }
                    /* Shape levers */
                    if (data.levers.iron) {
                        modification.stripes--;
                    }
                    if (data.levers.copper) {
                        if (data.color + data.shape + data.stripes + data.corners > 7) {
                            $("#events_content").prepend("Nothing happens.<br/>");
                            return;
                        }
                        /* Remove costs */
                        if (modification.resource_costs.diamond < 0) {
                            modification.resource_costs.diamond = 0;
                        }
                        /* And give bonus. */
                        modification.resource_costs.diamond -= 1234;
                    }
                    if (data.levers.lead) {
                        /* TODO: Don't have these wrap backwards maybe? Not sure. */
                        modification.color--;
                        modification.shape--;
                        modification.stripes--;
                        modification.corners--;
                    }
                    /* Stripe levers */
                    if (data.levers.squishy) {
                        /* Flip self */
                        modification.levers.squishy = true;
                        /* Remove costs */
                        if (modification.resource_costs.water < 0) {
                            modification.resource_costs.water = 0;
                        }
                        /* And give bonus. */
                        modification.resource_costs.water -= 5678;
                    }
                    if (data.levers.slimy) {
                        /* Flip all other levers. */
                        Object.keys(modification.levers).forEach(function (lever) {
                            if (lever != "slimy") {
                                modification.levers[lever] = true;
                            }
                        });
                    }
                    /* Corner levers */
                    if (data.levers.flaming) {
                        modification.points++;
                    }
                    if (data.levers.shaking) {
                        modification.points--;
                    }
                    if (data.levers.ghostly) {
                        /* Collatz points. */
                        if (data.points % 2) {
                            modification.points = data.points * 3 + 1;
                        }
                        else {
                            modification.points = data.points / 2;
                        }
                    }
                    /* Yay, that's all the levers! Literally only other thing is the point range of 700-900 removing resource costs. */
                    if (data.points >= 700 && data.points <= 900) {
                        Object.keys(modification.resource_costs).forEach(function (res) {
                            if (modification.resource_costs[res] < 0) {
                                modification.resource_costs[res] = 0;
                            }
                        });
                    }
                    /* Make sure we can actually run the action. */
                    Object.keys(modification.resource_costs).forEach(function (res) {
                        if (modification.resource_costs[res] > resources[res].amount) {
                            $("#events_content").prepend("The cube shakes slightly.<br />");
                            throw "Not enough resources for cube.";
                        }
                    });
                    /* Okay, time to run it! */
                    /* Pay resources */
                    Object.keys(modification.resource_costs).forEach(function (res) {
                        resources[res].amount -= modification.resource_costs[res];
                    });
                    /* Change color/shape/... state. These wrap around. */
                    /* We need this because javascript doesn't do negative modulo. */
                    function modulo(n, m) {
                        return ((n % m) + m) % m;
                    }
                    data.color = modulo(data.color + modification.color, COLORS.length);
                    data.shape = modulo(data.shape + modification.shape, SHAPES.length);
                    data.stripes = modulo(data.stripes + modification.stripes, STRIPES.length);
                    data.corners = modulo(data.corners + modification.corners, CORNERS.length);
                    /* Change points. This doesn't wrap and is limited 0-1190. */
                    data.points = Math.max(Math.min(data.points + modification.points, 1190), 0);
                    /* Change levers */
                    Object.keys(modification.levers).forEach(function (lever) {
                        /* Okay, so this is a bit weird but it effectively flips all levers that need to be and no others. */
                        /* Remember, modification.levers.XXX being true means that it needs to be flipped. */
                        data.levers[lever] = modification.levers[lever] != data.levers[lever];
                    });
                    /* Set last action */
                    data.last_action = Date.now();
                    /* Refresh the page. */
                    self.use();
                }
                $("#events_topbar").html("A strange cube");
                /* State description. */
                $("#events_content").html("You look at the puzzle. It is currently a " + COLORS[data.color] + " " + SHAPES[data.shape] + " with " + STRIPES[data.stripes] + " stripes and " + CORNERS[data.corners] + " corners.<br />");
                /*
                 Describe points.

                 */
                if (data.points < 200) {
                    /* Do nothing, but make the flow control here much better. */
                }
                else if (data.points < 500) {
                    $("#events_content").append("You hear a low beeping.<br/>");
                }
                else if (data.points < 600) {
                    /* No action time limit. Handled elsewhere. */
                }
                else if (data.points <= 650) {
                    /* TODO: Add crank. */
                    $("#events_content").append("There's a crank, but it's still unimplemented so you can't crank it.<br />");
                }
                else if (data.points == 651) {
                    /* TODO: add drawer. */
                    $("#events_content").append("There's a drawer, but it's still unimplemented so you can't open it.<br />");
                }
                else if (data.points < 700) {
                    /* TODO: Add rope. */
                    $("#events_content").append("There's a rope, but it's still unimplemented so you can't yank it.<br />");
                }
                else if (data.points < 900) {
                    /* No action resource cost. Handled elsewhere. */
                }
                else {
                    $("#events_content").append("You see some lights on the case: ⚪⚫⚪⚫⚪⚪⚪⚫⚪⚫⚫<br/>");
                }
                /* Describe buttons. There will always be some as the value is nonzero. */
                var button_val = 1;
                /* Add 1 because it's 0-4 and we want 1-5. */
                button_val *= (data.color + 1);
                button_val *= (data.shape + 1);
                button_val *= (data.stripes + 1);
                button_val *= (data.corners + 1);
                button_val += data.color + data.stripes + 2;
                /* Theoretically it should now be bounded by 3-128 */
                /* Test first bit. Large button. */
                if (button_val & 1) {
                    $("#events_content").append("There is a large button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        mod.color++;
                        if (data.corners) {
                            mod.shape++;
                        }
                    }); });
                }
                /* Test second bit.*/
                if (button_val & 2) {
                    $("#events_content").append("There is a small button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        mod.shape++;
                        mod.corners++;
                        mod.color--;
                        mod.stripes--;
                    }); });
                }
                /* Third */
                if (button_val & 4) {
                    $("#events_content").append("There is a clear button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        mod.resource_costs["glass"] = -10000;
                        mod.shape--;
                    }); });
                }
                /* 4 */
                if (button_val & 8) {
                    $("#events_content").append("There is a ticking button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* TODO: Turn off visible levers... */
                        $("#events_content").prepend("Oh man, this isn't implemented. Go bug fuzzything44.<br/>");
                        throw "Come on man, implement the ticking button";
                    }); });
                }
                /* 5 */
                if (button_val & 16) {
                    $("#events_content").append("There is a cold button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* Remove costs */
                        if (mod.resource_costs.fuel < 0) {
                            mod.resource_costs.fuel = 0;
                        }
                        /* And give bonus. */
                        mod.resource_costs.fuel -= 3;
                    }); });
                }
                /* 6 */
                if (button_val & 32) {
                    $("#events_content").append("There is an inverse button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* TODO: Swap some resource costs... Also need to change cube state somehow. */
                        $("#events_content").prepend("Oh man, this isn't implemented. Go bug fuzzything44.<br/>");
                        throw "Come on man, implement the inverse button";
                    }); });
                }
                /* 7 */
                if (button_val & 64) {
                    $("#events_content").append("There is a shiny button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* TODO: Turn on visible levers... */
                        $("#events_content").prepend("Oh man, this isn't implemented. Go bug fuzzything44.<br/>");
                        throw "Come on man, implement the shiny button";
                    }); });
                }
                /* 8th. If this is set no others should be. Hopefully. */
                if (button_val & 128) {
                    $("#events_content").append("There is a dull button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* TODO: Flip visible levers, give 1 min of resources. */
                        $("#events_content").prepend("Oh man, this isn't implemented. Go bug fuzzything44.<br/>");
                        throw "Come on man, implement the dull button";
                    }); });
                }
                $("#events_content").append("There is a gray button. <span class='clickable'>Press</span><br/>");
                $("#events_content > span").last().click(function () {
                    data = { name: data.name }; /* Reset cube. */
                    verify_data();
                    self.use();
                    $("#events_content").prepend("You see a bright flash of light and get a strange sense of déjà vu.<br />");
                });
                /* Now describe levers. Is this fun yet? */
                $("#events_content").append("There's some levers here, but fuzzything44 hasn't finished them yet.<br/>");
                return 1;
            }; /* End use function */
        },
    },
};
//# sourceMappingURL=equipment_data.js.map