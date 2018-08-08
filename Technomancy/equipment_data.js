function gen_equipment(equip_data) {
    var equip = $.extend(true, {}, equipment[equip_data.name]);
    /* Here we do modification on equip if we have stuff that can. */
    if (equip.modify != undefined) {
        equip.modify(equip, equip_data);
    }
    return equip;
}
var presents_used = {
    "2017": false,
};
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
    "const_shield": {
        on_combat: function (slot) {
            player_data["max_shields"] += 4;
            player_data["shields"] += 4;
            player_data["power_shields"] += 1;
        },
        type: "shield",
        name: "Mithril Plating",
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
                var damage = 1 + player_data[slot].extra_damage;
                enemy_data["shields"] -= damage;
                player_data[slot].charge_level -= 1;
                /* Update visuals */
                $("#combat_" + slot).text('(' + player_data[slot].charge_level.toString() + ") Fire Small Lazer " + slot[slot.length - 1] + " [1]");
                $("#combat_log").text("Small Lazer " + slot[slot.length - 1] + " fired for " + format_num(damage, false) + " damage!");
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
                var damage = 1 + player_data[slot].extra_damage;
                $("#combat_log").text("Small Lazer " + slot[slot.length - 1] + " fired for " + format_num(damage, false) + " damage " + player_data[slot].charge_level.toString() + " times!");
                while (player_data[slot].charge_level > 0) {
                    enemy_data["shields"] -= damage;
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
                var damage = 3 + player_data[slot].extra_damage;
                enemy_data["shields"] -= damage;
                /* Update visuals */
                $("#combat_" + slot).remove();
                $("#combat_log").text("Cannon " + slot[slot.length - 1] + " fired for " + format_num(damage, false) + " damage!");
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
            if (data.elem == undefined) {
                return; /* Can't modify based off of data we don't have. */
            }
            /* from Umbra: const elements = ["time", "energy", "space", "force"]; */
            self.name += " (" + data.elem + ")";
            self.use = function (index, location) {
                switch (data.elem) {
                    case "time": {
                        resources["time"].amount += 120;
                        break;
                    }
                    case "energy": {
                        resources_per_sec["energy"] += 8;
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
            var LEVER_COLORS = {
                "cyan": "cyan",
                "magenta": "magenta",
                "yellow": "yellow",
                "iron": "steelblue",
                "copper": "sandybrown",
                "lead": "darkgray",
                "squishy": "palevioletred",
                "slimy": "green",
                "flaming": "orangered",
                "shaking": "olive",
                "ghostly": "turquoise"
            };
            var LEVERS = [
                "cyan", "magenta", "yellow",
                "iron", "copper", "lead",
                "squishy", "slimy",
                "flaming", "shaking", "ghostly"
            ];
            function verify_data() {
                /* Make sure we have all the data fields. If not, add them. If cubes have been previously solved, then we don't start in a nice place. */
                if (adventure_data["cubes_solved"]) {
                    /* Base state */
                    if (data["color"] == undefined) {
                        data["color"] = prng(adventure_data["cubes_solved"]) % 5;
                    }
                    if (data["shape"] == undefined) {
                        data["shape"] = prng(adventure_data["cubes_solved"]) % 4;
                    }
                    if (data["stripes"] == undefined) {
                        data["stripes"] = prng(adventure_data["cubes_solved"]) % 3;
                    }
                    if (data["corners"] == undefined) {
                        data["corners"] = prng(adventure_data["cubes_solved"]) % 2;
                    }
                    /* Points are useful! */
                    if (data.points == undefined) {
                        data.points = prng(adventure_data["cubes_solved"]) % 1190;
                    }
                    /* Levers as a whole. */
                    if (data.levers == undefined) {
                        data.levers = {};
                    }
                    /*Individual levers. All set down. */
                    var lcount_1 = 0;
                    LEVERS.forEach(function (type) {
                        if (data.levers[type] == undefined) {
                            data.levers[type] = (prng(adventure_data["cubes_solved"] + lcount_1) % 2 == 0);
                        }
                        lcount_1++;
                    });
                }
                else {
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
                    LEVERS.forEach(function (type) {
                        if (data.levers[type] == undefined) {
                            data.levers[type] = false;
                        }
                    });
                }
                /* Last action. Should always be 0.  */
                if (data.last_action == undefined) {
                    data.last_action = 0;
                }
            }
            verify_data();
            self.use = function (index, location) {
                $("#character").addClass("hidden");
                /* Definitions of stuff. */
                var COLORS = ["red", "green", "blue", "black", "white"];
                var SHAPES = ["pyramid", "cube", "octahedron", "cylinder"];
                var STRIPES = ["no", "thin", "thick"];
                var CORNERS = ["sharp", "rounded"];
                /* Is the given lever visible? We need to calculate this in a few places, so let's do it in a function. */
                function lever_visible(lever) {
                    /* We don't do the nice way because writing a horrible switch is easier and the cube design is finished, so I won't be adding levers later. */
                    var vsum = data.color + data.shape + data.stripes + data.corners;
                    switch (lever) {
                        case "cyan": {
                            return ((vsum + data.color) % 3) == 0;
                        }
                        case "magenta": {
                            return ((vsum + data.color) % 3) == 1;
                        }
                        case "yellow": {
                            return ((vsum + data.color) % 3) == 2;
                        }
                        case "iron": {
                            return ((vsum + data.shape) % 4) == 0;
                        }
                        case "copper": {
                            return ((vsum + data.shape) % 4) == 1;
                        }
                        case "lead": {
                            return ((vsum + data.shape) % 4) == 3;
                        }
                        case "squishy": {
                            return ((vsum + data.stripes) % 2) == 0;
                        }
                        case "slimy": {
                            return ((vsum + data.stripes) % 2) == 1;
                        }
                        case "flaming": {
                            return ((vsum + data.corners) % 3) == 0;
                        }
                        case "shaking": {
                            return ((vsum + data.corners) % 3) == 1;
                        }
                        case "ghostly": {
                            return ((vsum + data.corners) % 3) == 2;
                        }
                    }
                    throw "That's not a lever.";
                }
                /* Runs an action if possible. Oh boy will this be fun. */
                var run_action = function (action, callback) {
                    if (callback === void 0) { callback = null; }
                    /* Check time limit. */
                    if ((Date.now() - data.last_action < 15000 && (data.points < 400 || data.points > 600)) || (Date.now() - data.last_action < 3000)) {
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
                    delete modification.resource_costs["antibag"];
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
                            $("#events_content").prepend("Weird...<br/>");
                            data.color = 0;
                            data.shape = 3;
                            data.stripes = 2;
                            data.corners = 1;
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
                        /* Flip all other levers. But if you're already flipping, it should then flip back so they can get levers out of sync. */
                        Object.keys(modification.levers).forEach(function (lever) {
                            if (lever != "slimy") {
                                modification.levers[lever] = !modification.levers[lever];
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
                            modification.points += data.points * 2 + 1;
                        }
                        else {
                            modification.points -= data.points / 2;
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
                        if (modification.resource_costs[res] > resources[res].amount && resources[res].value != 0) {
                            $("#events_content").prepend("The cube shakes slightly. (You need more " + res.replace("_", " ") + ")<br />");
                            throw "Not enough resources for cube.";
                        }
                    });
                    /* Okay, time to run it! */
                    /* Pay resources */
                    Object.keys(modification.resource_costs).forEach(function (res) {
                        if (resources[res].value != 0) {
                            resources[res].amount -= modification.resource_costs[res];
                        }
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
                    self.use(index, location);
                    /* Run callback wayyyy back here. So that stuff can be added to the use page. */
                    if (callback) {
                        callback();
                    }
                };
                $("#events_topbar").html("A strange cube");
                /* State description. */
                $("#events_content").html("You look at the puzzle. It is currently a " + COLORS[data.color] + " " + SHAPES[data.shape] + " with " + STRIPES[data.stripes] + " stripes and " + CORNERS[data.corners] + " corners.<br />");
                /*
                 Describe points.

                 */
                if (data.points < 200) {
                    /* Do nothing, but make the flow control here much better. */
                }
                else if (data.points < 400) {
                    $("#events_content").append("You hear a low beeping.<br/>");
                }
                else if (data.points < 600) {
                    /* No action time limit. Handled elsewhere. */
                }
                else if (data.points <= 650) {
                    $("#events_content").append("There's a crank here. <span class='clickable'>Crank</span><br />");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* Doesn't change cube. Does cost fuel for not-ridiculous carrot farming. */
                        mod.resource_costs["fuel"] += 1;
                    }, function () {
                        $("#events").addClass("hidden");
                        handle_event(false);
                    }); });
                }
                else if (data.points == 651) {
                    $("#events_content").append("There's a drawer here. <span class='clickable'>Open</span><br />");
                    $("#events_content > span").last().click(function () {
                        $("#events_content").html("There's a key in here! <br/>After removing it, the box crumbles to dust.");
                        /* Box turns into a key. */
                        adventure_data[location][index] = { name: "conv_key" };
                        $("#character").removeClass("hidden");
                        update_inventory();
                        if (adventure_data["cubes_solved"]) {
                            adventure_data["cubes_solved"]++;
                        }
                        else {
                            adventure_data["cubes_solved"] = 1;
                        }
                    });
                }
                else if (data.points < 700) {
                    $("#events_content").append("There's a rope here. <span class='clickable'>Yank!</span><br />");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                    }, function () {
                        $("#events_content").prepend("The number " + format_num(data.points, false) + " appears on the cube. <br />");
                    }); });
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
                        mod.shape--;
                        mod.resource_costs["refined_mana"] += 50;
                    }, function () {
                        var elem = ["time", "energy", "space", "force"][prng(button_val) % 4];
                        var orb = { name: "magic_orb", elem: elem };
                        adventure_data.warehouse.push(orb);
                        $("#events_content").prepend("You gained a " + gen_equipment(orb).name + "<br />");
                    }); });
                }
                /* 4 */
                if (button_val & 8) {
                    $("#events_content").append("There is a ticking button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* Turn off visible levers. So flip all visible ones that are on. */
                        LEVERS.forEach(function (lever) {
                            if (lever_visible(lever) && data.levers[lever]) {
                                mod.levers[lever] = true;
                            }
                        });
                        /* Also, we should do something to change cube state. */
                        mod.corners++;
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
                        mod.resource_costs["refined_mana"] += 300;
                    }); });
                }
                /* 6 */
                if (button_val & 32) {
                    $("#events_content").append("There is an inverse button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        for (var i = 0; i < 5; i++) {
                            /* Swap costs of two random resources. */
                            var first_res = Object.keys(mod.resource_costs)[prng(button_val) % (Object.keys(mod.resource_costs).length)];
                            var second_res = Object.keys(mod.resource_costs)[prng(button_val + 1) % (Object.keys(mod.resource_costs).length)];
                            var temp_amt = mod.resource_costs[first_res];
                            mod.resource_costs[first_res] = mod.resource_costs[second_res];
                            mod.resource_costs[second_res] = temp_amt;
                        }
                        if (prng(button_val) % 2) {
                            mod.stripes--;
                        }
                        else {
                            mod.stripes++;
                        }
                    }); });
                }
                /* 7 */
                if (button_val & 64) {
                    $("#events_content").append("There is a shiny button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* Turn on visible levers. */
                        LEVERS.forEach(function (lever) {
                            if (lever_visible(lever) && !data.levers[lever]) {
                                mod.levers[lever] = true;
                            }
                        });
                        /* Also, we should do something to change cube state. */
                        mod.corners--;
                    }); });
                }
                /* 8th. If this is set no others should be. Hopefully. */
                if (button_val & 128) {
                    $("#events_content").append("There is a dull button. <span class='clickable'>Press</span><br/>");
                    $("#events_content > span").last().click(function () { return run_action(function (mod) {
                        /* Flip visible levers, give 1 min of resources. */
                        LEVERS.forEach(function (lever) {
                            if (lever_visible(lever)) {
                                mod.levers[lever] = true;
                            }
                        });
                        Object.keys(mod.resource_costs).forEach(function (res) {
                            /* Give bonus resources. */
                            mod.resource_costs[res] -= resources_per_sec[res] * 60;
                        });
                    }); });
                }
                $("#events_content").append("There is a gray button. <span class='clickable'>Press</span><br/><br/>");
                $("#events_content > span").last().click(function () {
                    adventure_data[location][index] = { name: "conv_cube" }; /* Reset cube. */
                    var equip = gen_equipment(adventure_data[location][index]); /* Re-generate it */
                    equip.use(index, location); /* Use it. */
                    $("#events_content").prepend("You see a bright flash of light and get a strange sense of déjà vu.<br />");
                });
                /* Now describe levers. They all do the same thing, so that makes this nice at least. */
                LEVERS.forEach(function (lever) {
                    if (lever_visible(lever)) {
                        $("#events_content").append("There is a <span style='color:" + LEVER_COLORS[lever] + ";'>" + lever + "</span> lever. <span class='clickable'>" + (data.levers[lever] ? "Push" : "Pull") + "</span><br/>");
                        $("#events_content > span").last().click(function () { return run_action(function (mod) {
                            mod.levers[lever] = true;
                        }); });
                    }
                });
                /* Let them go back */
                $("#events_content").append(exit_button("Stop fiddling"));
                return 1;
            }; /* End use function */
        },
    },
    "conv_key": {
        type: "item",
        name: "Weird Key",
    },
    "turkey_leg": {
        type: "item",
        name: "Turkey Leg",
        modify: function (self, data) {
            self.use = function (index, location) {
                if (adventure_data.current_potion != undefined) {
                    gen_equipment(adventure_data["current_potion"].data).stop();
                }
                adventure_data.current_potion = {
                    name: self.name,
                    effect: "Gobble Gobble Gobble",
                    time: 60,
                    data: data,
                    power: 1,
                };
                /* Remove it from inventory after use */
                adventure_data[location].splice(index, 1);
                update_inventory();
            }; /* End use function */
            /* When we stop nothing happens. */
            self.stop = function () { };
            /* Give +50% to any positive gains. Yay Thanksgiving! */
            self.effect = function (power, on_combat) {
                if (on_combat === void 0) { on_combat = false; }
                /* Also gives a shield boost when starting combat. */
                if (on_combat) {
                    if (player_data["shields"] < 5) {
                        player_data["shields"]++;
                    }
                    return;
                }
                Object.keys(resources_per_sec).forEach(function (res) {
                    if (resources[res].value > 0) {
                        resources[res].amount += Math.max(0, resources_per_sec[res] / 2);
                    }
                });
            };
        },
    },
    "potion": {
        type: "item",
        name: "Potion",
        modify: function (self, data) {
            /* Figure out values for everything. */
            self.name = data.disp_name;
            /* data should have fields for index of major/time/power ingredients */
            self.stop = ingredients[data.major].ending_func; /* What do we do when we finish? */
            self.effect = ingredients[data.major].effect_func; /* Major ingredient determines effect */
            self.use = function (index, location) {
                if (adventure_data.current_potion != undefined) {
                    gen_equipment(adventure_data["current_potion"].data).stop();
                }
                adventure_data.current_potion = {
                    name: self.name,
                    effect: ingredients[data.major].effect_desc,
                    time: ingredients[data.time].effect_time,
                    data: data,
                    power: ingredients[data.power].effect_strength,
                };
                if (event_flags["wanderer_knowledge"] == "alchemy") {
                    adventure_data.current_potion["power"]++;
                    adventure_data.current_potion["time"] += 5;
                }
                /* Remove it from inventory after use */
                adventure_data[location].splice(index, 1);
                update_inventory();
            }; /* End use function */
        },
    },
    "present": {
        type: "item",
        name: "Wrapped Present",
        modify: function (self, data) {
            if (data.open) {
                switch (data.year) {
                    case "2017": {
                        self.name = "Spaceship Figurine (2017)";
                        self.use = function (index, location) {
                            $("#events_content").html("You admire your figurine. It's pretty cool. <br />");
                            if (!presents_used["2017"]) {
                                resources["fuel"].mult *= 1.1;
                                presents_used["2017"] = true;
                            }
                            else {
                                $("#events_content").append("You've already admired it.");
                            }
                            update_inventory();
                        }; /* End use function */
                    } /* 2017 */
                }
            }
            else {
                self.name += " (" + data.year + ")";
                self.use = function (index, location) {
                    switch (data.year) {
                        case "2017": {
                            $("#events_content").html("You tear open the bright red present. Inside, there's a small figurine of your spaceship.");
                            break;
                        }
                    }
                    data.open = true;
                    update_inventory();
                    return 1;
                }; /* End use function */
            }
        },
    },
    "bag": {
        type: "item",
        name: "Bag of Holding",
        modify: function (self, data) {
            if (data.resource == undefined) {
                self.use = function (index, location) {
                    $("#character").addClass("hidden");
                    $("#events_topbar").html("Bag of Holding");
                    $("#events_content").html("What would you like to put in your bag?<br />");
                    /* Let them put some resources in. */
                    Object.keys(resources).forEach(function (res) {
                        if (resources[res].value > 0 && resources[res].amount > 0) {
                            var amount_1 = Math.min(resources[res].amount, 100000 / resources[res].value); /* Can hold 100k value. */
                            $("#events_content").append("<span class='clickable'>Add</span> " + format_num(amount_1, true) + " " + res.replace("_", " ") + "<br />");
                            $("#events_content > span").last().click(function () {
                                /* Add them. */
                                data.resource = res;
                                data.amount = amount_1;
                                resources[res].amount -= amount_1;
                                start_adventure();
                            });
                        }
                    });
                    return 1;
                };
            }
            else {
                self.name += " (" + format_num(data.amount, true) + " " + data.resource.replace("_", " ") + ")";
            }
        },
    },
    "replicator": {
        type: "item",
        name: "Replicator",
        modify: function (self, data) {
            self.use = function (index, location) {
                $("#character").addClass("hidden");
                $("#events_topbar").html("Replicator");
                $("#events_content").html("What would you like to replicate?<br />");
                /* Let them replicate something. */
                Object.keys(resources).forEach(function (res) {
                    if (resources[res].value > 0 && resources[res].amount > 0 && event_flags["replicated_" + res] == undefined) {
                        var amount_2 = resources[res].amount / 2;
                        $("#events_content").append("<span class='clickable'>Copy</span> " + format_num(amount_2, true) + " " + res.replace("_", " ") + "<br >");
                        $("#events_content > span").last().click(function () {
                            resources[res].amount += amount_2;
                            event_flags["replicated_" + res] = true;
                            adventure_data[location].splice(index, 1);
                            update_inventory();
                            start_adventure();
                        });
                    }
                });
                return 1;
            };
        },
    },
};
//# sourceMappingURL=equipment_data.js.map