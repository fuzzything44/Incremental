/*
* Alright, location info goes here because this is where you start.
* Each location has a name and some various encounters that can happen.
* An encounter consists of the following:
*   condition(): Can the encounter actually happen? If not, removed from the options when selecting an encounter.
*   run_encounter(): Actually runs the encounter.
*   weight: How relatively likely it is to happen. Note that 0 weight is treated specially - it WILL happen. Other than that, all weights are added and rolled for the encounter.
*   title: what the top gets set to.
*   types: What types of encounter so some ones can be selectively removed. List of string types. Current types are:
*       combat              noncombat
*
*/
/*
//Also, for copy+pastability, here's a blank template for a locations

({
    "unlocked": function () { return true; },
    "go_again_text": "-----",
    "encounters": [
        ({
        "condition": function () { return true; },
        "types": [],
        "weight": 0,
        "title": "-----",
        "run_encounter": function () {
            return;
        }
        }),
    ],
    "connects_to": [],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "-----",
})

*/
({
    "unlocked": function () { return true; },
    "go_again_text": "Setup your ship",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "Adventure!",
            "run_encounter": function () {
                $("#events_content").html("<span class='clickable'>Add</span> or <span class='clickable'>Remove</span> items from your ship inventory.<br />");
                /* Handle adding of items to ship inventory. */
                $("#events_content > span").last().prev().click(function add_to_inv() {
                    $("#events_topbar").html("Stock Your Ship");
                    $("#events_content").html("<span>Add Fuel: <input id='add_fuel' type='number' min='1'/><span class='clickable'>Add!</span></span> (You have " + format_num(resources["fuel"].amount, false) + " fuel)<br />");
                    $("#events_content > span > span").last().click(function () {
                        var fuel_to_add = parseInt($("#add_fuel").val());
                        /* Check to make sure the ship has enough space. Space is total size - used space. */
                        var ship_space = adventure_data.inventory_size - (adventure_data.inventory_fuel + adventure_data.inventory.length);
                        if (ship_space < fuel_to_add) {
                            fuel_to_add = ship_space;
                        }
                        if (resources["fuel"].amount > fuel_to_add) {
                            adventure_data.inventory_fuel += fuel_to_add;
                            resources["fuel"].amount -= fuel_to_add;
                            update_inventory();
                        }
                        else {
                            alert("Not enough fuel.");
                        }
                    });
                    var _loop_1 = function (i) {
                        var equip = gen_equipment(adventure_data.warehouse[i]);
                        /* They can add it to their ship. */
                        $("#events_content").append("<span class='clickable'>Add</span> ");
                        $("#events_content > span").last().click(function (e) {
                            /* They have space to add it */
                            if (adventure_data.inventory_size - (adventure_data.inventory_fuel + adventure_data.inventory.length) > 0) {
                                /* Remove item from warehouse and add it to inventory */
                                adventure_data.inventory.push(adventure_data.warehouse.splice(i, 1)[0]);
                                update_inventory();
                                add_to_inv();
                            }
                            else {
                                $("#events_content").prepend("Not enough storage space<br />");
                            }
                        });
                        /* They can use it. */
                        if (equip.use != undefined) {
                            $("#events_content").append("<span class='clickable'>Use</span> ");
                            $("#events_content > span").last().click(function () {
                                if (!equip.use(i, "warehouse")) {
                                    add_to_inv();
                                }
                            });
                        }
                        /* And display what it actually is. */
                        $("#events_content").append(gen_equipment(adventure_data.warehouse[i]).name + "<br />");
                    };
                    for (var i = 0; i < adventure_data.warehouse.length; i++) {
                        _loop_1(i);
                    }
                    $("#events_content").append("<span class='clickable' onclick='run_adventure(\"home\");'>Go Back</span>");
                }); /* End adding items to ship */
                /* Handle removing items from ship inventory */
                $("#events_content > span").last().click(function rem_from_inv() {
                    $("#events_topbar").html("Empty Your Ship");
                    $("#events_content").html("<span>Remove Fuel: <input id='remove_fuel' type='number' min='1'/><span class='clickable'>Remove</span></span><br />");
                    $("#events_content > span > span").last().click(function () {
                        var fuel_to_remove = parseInt($("#remove_fuel").val());
                        if (isNaN(fuel_to_remove)) {
                            fuel_to_remove = 0;
                        }
                        /* Check to make sure they can remove that much */
                        if (adventure_data.inventory_fuel < fuel_to_remove) {
                            fuel_to_remove = adventure_data.inventory_fuel;
                        }
                        adventure_data.inventory_fuel -= fuel_to_remove;
                        resources["fuel"].amount += fuel_to_remove;
                        update_inventory();
                    });
                    var _loop_2 = function (i) {
                        $("#events_content").append("<span class='clickable'>Remove</span> " + gen_equipment(adventure_data.inventory[i]).name + "<br />");
                        $("#events_content > span").last().click(function (e) {
                            /* Remove item from warehouse and add it to inventory */
                            adventure_data.warehouse.push(adventure_data.inventory.splice(i, 1)[0]);
                            update_inventory();
                            rem_from_inv();
                        });
                    };
                    for (var i = 0; i < adventure_data.inventory.length; i++) {
                        _loop_2(i);
                    }
                    $("#events_content").append("<span class='clickable' onclick='run_adventure(\"home\");'>Go Back</span>");
                }); /* End removing items from ship. */
                $("#events_content").append("<span class='clickable' onclick='set_equipment();'>Equip</span> your ship <br />");
                if (event_flags["wanderer_knowledge"]) {
                    if (event_flags["know_pts"] == undefined) {
                        event_flags["know_pts"] = 0;
                    }
                    $("#events_content").append("<span class='clickable'>Go</span> to your study.<br />");
                    $("#events_content > span").last().click(function study() {
                        $("#events_content").html("You have " + format_num(event_flags["know_pts"]) + " knowledge points.<br />");
                        if (buildings["library"].amount > 25) {
                            $("#events_content").append("<span class='clickable'>Study</span><i style='text: small'>(Gain 1 knowledge point (KP), but destroy 25 libraries without the cost decrease.)</i><br />");
                            $("#events_content span").last().click(function () {
                                destroy_building("library", 25); /* Remove libraries. */
                                buildings["library"].free -= 25;
                                event_flags["know_pts"]++;
                                study(); /* Redraw. */
                            });
                        }
                        if (event_flags["know_pts"] && buildings["library"].free < buildings["library"].amount && purchased_upgrades.indexOf("better_library_3") != -1) {
                            $("#events_content").append("<span class='clickable'>Reset</span> library base cost.<i style='text: small'> (Libraries go to their base cost, but the cost scaling of them is increased. This costs 1 KP.)</i><br />");
                            $("#events_content span").last().click(function () {
                                buildings["library"].free = buildings["library"].amount;
                                event_flags["know_pts"]--;
                                buildings["library"].price_ratio["iron"] += .025;
                                buildings["library"].price_ratio["wood"] += .025;
                                buildings["library"].price_ratio["book"] += .025;
                                buildings["library"].price_ratio["money"] += .025;
                                study();
                            });
                        }
                        if (event_flags["wanderer_knowledge"] == "magic") {
                            $("#events_content").append("Yay, you can do magic! Message fuzzything44 on Discord if you get this far.<br />");
                            $("#events_content").append("Also, please note that this is how the skill tree will look when finished. But it currently doesn't do anything than look pretty.<br />");
                            $("#events_content").append("<span class='clickable'>Make</span> a Bag of Holding (requires one of each magic orb)<br />");
                            $("#events_content span").last().click(function () {
                                if (count_item("magic_orb", adventure_data.warehouse, { elem: "time" }) &&
                                    count_item("magic_orb", adventure_data.warehouse, { elem: "space" }) &&
                                    count_item("magic_orb", adventure_data.warehouse, { elem: "energy" }) &&
                                    count_item("magic_orb", adventure_data.warehouse, { elem: "force" })) {
                                    adventure_data.warehouse.splice(find_item("magic_orb", adventure_data.warehouse, { elem: "force" }), 1);
                                    adventure_data.warehouse.splice(find_item("magic_orb", adventure_data.warehouse, { elem: "time" }), 1);
                                    adventure_data.warehouse.splice(find_item("magic_orb", adventure_data.warehouse, { elem: "energy" }), 1);
                                    adventure_data.warehouse.splice(find_item("magic_orb", adventure_data.warehouse, { elem: "space" }), 1);
                                    adventure_data.warehouse.push({ name: "bag" });
                                }
                                else {
                                    $("#events_content").prepend("You're missing an orb. Check your warehouse.<br />");
                                }
                            });
                            $("#events_content").append("<div id='skill_tree'></div>");
                            /* Tier 1 */
                            $("#skill_tree").append("<div class='skill_box purchased' style='position: absolute; left: 23em; top: 0em; z-index: 1;'><br />Artificing<br />1 KP</div>");
                            /* Connecting lines */
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:360px;height: 280px;position: absolute; left: 30em; top: -12.5em; transform: rotate(20deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:360px;height: 280px;position: absolute; left: 5em; top: -12.5em; transform: rotate(340deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:50px;height: 280px;position: absolute; left: 36em; top: -2em; transform: rotate(90deg);'></div>");
                            /* Tier 2 */
                            $("#skill_tree").append("<div class='skill_box buyable bgc_second' style='position: absolute; left: 4em;  top: 8em; z-index: 1;'><br />Efficient Refining<br />1 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 23em; top: 8em; z-index: 1;'><br />EVENTS<br />1 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 43em; top: 8em; z-index: 1;'><br />LOOT<br />1 KP</div>");
                            /* Connecting lines */
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 12em; top: 9em; transform: rotate(100deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 54em; top: 5em; transform: rotate(80deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 26em; top: 13em; transform: rotate(140deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 34em; top: 0em; transform: rotate(40deg);'></div>");
                            /* Tier 3 */
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 3em;  top: 18em; z-index: 1;'><br />Distributed Mana<br />1 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 17em; top: 16em; z-index: 1;'><br />COMBAT I<br />1 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 30em; top: 16em; z-index: 1;'><br />NONCOMBAT I<br />1 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 44em; top: 18em; z-index: 1;'><br />LOOT II?<br />1 KP</div>");
                            /* Connecting lines */
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 11.5em; top: 15em; transform: rotate(90deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 55em; top: 18em; transform: rotate(90deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:100px;height: 280px;position: absolute; left: 28em; top: 14em; transform: rotate(90deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:100px;height: 280px;position: absolute; left: 41em; top: 14em; transform: rotate(90deg);'></div>");
                            /* Tier 4 */
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 3em;  top: 28em; z-index: 1;'><br />Instant Mana<br />2 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 17em; top: 25em; z-index: 1;'><br />COMBAT II<br />2 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 30em; top: 25em; z-index: 1;'><br />NONCOMBAT II<br />2 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 44em; top: 28em; z-index: 1;'><br />LOOT III?<br />2 KP</div>");
                            /* Connecting lines */
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 12em; top: 27em; transform: rotate(80deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 54em; top: 27em; transform: rotate(100deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 24em; top: 15em; transform: rotate(40deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:150px;height: 280px;position: absolute; left: 34em; top: 30em; transform: rotate(140deg);'></div>");
                            /* Tier 5 */
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 5em; top: 37em; z-index: 1;'><br />LIBRARY<br />2 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 23em; top: 33em; z-index: 1;'><br />Foresight<br />3 KP</div>");
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 42em; top: 37em; z-index: 1;'><br />LOOT IV?<br />2 KP</div>");
                            /* Connecting Lines */
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:200px;height: 280px;position: absolute; left: 18em; top: 26em; transform: rotate(40deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:200px;height: 280px;position: absolute; left: 37em; top: 41em; transform: rotate(145deg);'></div>");
                            $("#skill_tree").append("<div style='border-bottom: 5px solid gray;width:100px;height: 280px;position: absolute; left: 34.5em; top: 33em; transform: rotate(90deg);'></div>");
                            /* Ultimate Skill */
                            $("#skill_tree").append("<div class='skill_box bgc_second' style='position: absolute; left: 23em; top: 42em; z-index: 1;'><br />Super Skill<br />4 KP</div>");
                            $("#events_content").append("<br /><br />");
                        }
                        else if (event_flags["wanderer_knowledge"] == "alchemy") {
                            $("#events_content").append("Yay, you can do alchemy! Message fuzzything44 on Discord if you get this far.<br />");
                        }
                        else if (event_flags["wanderer_knowledge"] == "inventor") {
                            $("#events_content").append("Yay, you can make machines! Message fuzzything44 on Discord if you get this far.<br />");
                            $("#events_content").append("<span class='clickable'>Make</span> a Giant Magnet (Costs 1 Machine Part and 1 KP)<br />");
                            $("#events_content > span").last().click(function () {
                                if (count_item("machine_part", adventure_data.warehouse)) {
                                    if (event_flags["know_pts"]) {
                                        var build_state = buildings["magnet"].on;
                                        if (build_state) {
                                            toggle_building_state("magnet");
                                        }
                                        /* Give a free magnet. */
                                        buildings["magnet"].amount++;
                                        buildings["magnet"].free++;
                                        if (build_state) {
                                            toggle_building_state("magnet");
                                        }
                                        /* Spend costs. */
                                        event_flags["know_pts"]--;
                                        adventure_data.warehouse.splice(find_item("machine_part", adventure_data.warehouse), 1);
                                        purchase_building("magnet", 0); /* Update amount visible. */
                                        /* Redraw. */
                                        study();
                                    }
                                    else {
                                        $("#events_content").prepend("Not enough Knowledge Points. Build more libraries.<br />");
                                    }
                                }
                                else {
                                    $("#events_content").prepend("No machine part found. Check your warehouse.<br />");
                                }
                            }); /* End building magnet. */
                            $("#events_content").append("<span class='clickable'>Make</span> a Book Recycler (Costs 1 KP)<br />");
                            $("#events_content > span").last().click(function () {
                                if (event_flags["know_pts"]) {
                                    var build_state = buildings["book_boost"].on;
                                    if (build_state) {
                                        toggle_building_state("book_boost");
                                    }
                                    /* Give a free magnet. */
                                    buildings["book_boost"].amount++;
                                    if (build_state) {
                                        toggle_building_state("book_boost");
                                    }
                                    /* Spend costs. */
                                    event_flags["know_pts"]--;
                                    /* Redraw. */
                                    study();
                                    purchase_building("book_boost", 0);
                                }
                                else {
                                    $("#events_content").prepend("Not enough Knowledge Points. Build more libraries.<br />");
                                }
                            }); /* End building books. */
                            if (buildings["steel_smelter"].amount > 1) {
                                $("#events_content").append("<span class='clickable'>Upgrade</span> a Steel Foundry (Costs 1 KP)<br />");
                                $("#events_content > span").last().click(function () {
                                    if (buildings["steel_smelter"].amount > 1) {
                                        if (event_flags["know_pts"]) {
                                            /* Remove a steel foundry, give a mithril forge. */
                                            var build_state = buildings["steel_smelter"].on;
                                            if (build_state) {
                                                toggle_building_state("steel_smelter");
                                            }
                                            buildings["steel_smelter"].amount--;
                                            buildings["steel_smelter"].free--;
                                            if (build_state) {
                                                toggle_building_state("steel_smelter");
                                            }
                                            /* Giving the forge. */
                                            build_state = buildings["mithril_smelter"].on;
                                            if (build_state) {
                                                toggle_building_state("mithril_smelter");
                                            }
                                            buildings["mithril_smelter"].amount++;
                                            if (build_state) {
                                                toggle_building_state("mithril_smelter");
                                            }
                                            /* Spend knowledge point. */
                                            event_flags["know_pts"]--;
                                            /* Redraw amounts. */
                                            study();
                                            purchase_building("steel_smelter", 0);
                                            purchase_building("mithril_smelter", 0);
                                        }
                                        else {
                                            $("#events_content").prepend("Not enough Knowledge Points. Build more libraries.<br />");
                                        }
                                    }
                                    else {
                                        $("#events_content").prepend("You need another Steel Foundry.<br />");
                                        study();
                                    }
                                });
                            }
                        }
                        $("#events_content").append(exit_button("Done"));
                    }); /* End study */
                }
                $("#events_content").append(exit_button("Go Back"));
            }
        }),
    ],
    "connects_to": ["moon", "warpgate"],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "Home Planet",
});
//# sourceMappingURL=home.js.map