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
            /* Somehow we handle adding of items to ship inventory. */
            $("#events_content > span").last().prev().click(function add_to_inv() {
                $("#events_topbar").html("Stock Your Ship");
                $("#events_content").html("<span>Add Fuel: <input id='add_fuel' type='number' min='1'/><span class='clickable'>Add!</span></span> (You have " + format_num(resources["fuel"].amount, false) + " fuel)<br />");
                $("#events_content > span > span").last().click(function () {
                    let fuel_to_add = parseInt($("#add_fuel").val())
                    /* Check to make sure the ship has enough space. Space is total size - used space. */
                    let ship_space = adventure_data.inventory_size - (adventure_data.inventory_fuel + adventure_data.inventory.length);
                    if (ship_space < fuel_to_add) {
                        fuel_to_add = ship_space;
                    }
                    if (resources["fuel"].amount > fuel_to_add) {
                        adventure_data.inventory_fuel += fuel_to_add;
                        resources["fuel"].amount -= fuel_to_add;
                        update_inventory();
                    } else {
                        alert("Not enough fuel.");
                    }
                });
                for (let i = 0; i < adventure_data.warehouse.length; i++) {
                    let equip = gen_equipment(adventure_data.warehouse[i]);
                    /* They can add it to their ship. */
                    $("#events_content").append("<span class='clickable'>Add</span> ");
                    $("#events_content > span").last().click(function (e) {
                        /* They have space to add it */
                        if (adventure_data.inventory_size - (adventure_data.inventory_fuel + adventure_data.inventory.length) > 0) {
                            /* Remove item from warehouse and add it to inventory */
                            adventure_data.inventory.push(adventure_data.warehouse.splice(i, 1)[0]);
                            update_inventory();
                            add_to_inv();
                        } else {
                            $("#events_content").prepend("Not enough storage space<br />");
                        }
                    });
                    /* They can use it. */
                    if (equip.use != undefined) {
                        $("#events_content").append("<span class='clickable'>Use</span> ");
                        $("#events_content > span").last().click(() => {
                            if (!equip.use(i, "warehouse")) {
                                add_to_inv();
                            }
                        });
                    }
                    /* And display what it actually is. */
                    $("#events_content").append(gen_equipment(adventure_data.warehouse[i]).name + "<br />");

                }
                $("#events_content").append("<span class='clickable' onclick='run_adventure(\"home\");'>Go Back</span>");

            }); /* End adding items to ship */


            /* Handle removing items from ship inventory */
            $("#events_content > span").last().click(function rem_from_inv() {
                $("#events_topbar").html("Empty Your Ship");
                $("#events_content").html("<span>Remove Fuel: <input id='remove_fuel' type='number' min='1'/><span class='clickable'>Remove</span></span><br />");
                $("#events_content > span > span").last().click(function () {
                    let fuel_to_remove = parseInt($("#remove_fuel").val())
                    if (isNaN(fuel_to_remove)) { fuel_to_remove = 0; }
                    /* Check to make sure they can remove that much */
                    if (adventure_data.inventory_fuel < fuel_to_remove) {
                        fuel_to_remove = adventure_data.inventory_fuel;
                    }
                    adventure_data.inventory_fuel -= fuel_to_remove;
                    resources["fuel"].amount += fuel_to_remove;
                    update_inventory();
                });
                for (let i = 0; i < adventure_data.inventory.length; i++) {
                    $("#events_content").append("<span class='clickable'>Remove</span> " + gen_equipment(adventure_data.inventory[i]).name + "<br />");
                    $("#events_content > span").last().click(function (e) {
                        /* Remove item from warehouse and add it to inventory */
                        adventure_data.warehouse.push(adventure_data.inventory.splice(i, 1)[0]);
                        update_inventory();
                        rem_from_inv();
                    });
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
                            buildings["library"].price_ratio["iron"] *= 1.05;
                            buildings["library"].price_ratio["wood"] *= 1.05;
                            buildings["library"].price_ratio["book"] *= 1.05;
                            buildings["library"].price_ratio["money"] *= 1.05;
                            study();
                        });
                    }
                    if (event_flags["wanderer_knowledge"] == "magic") {
                        $("#events_content").append("Yay, you can do magic! Message fuzzything44 on Discord if you get this far.<br />");
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
                            } else {
                                $("#events_content").prepend("You're missing an orb. Check your warehouse.<br />");
                            }
                        });
                    } else if (event_flags["wanderer_knowledge"] == "alchemy") {
                        $("#events_content").append("Yay, you can do alchemy! Message fuzzything44 on Discord if you get this far.<br />");
                    } else if (event_flags["wanderer_knowledge"] == "inventor") {
                        $("#events_content").append("Yay, you can make machines! Message fuzzything44 on Discord if you get this far.<br />");
                        $("#events_content").append("<span class='clickable'>Make</span> a Giant Magnet (Costs 1 Machine Part and 1 KP)<br />");
                        $("#events_content > span").last().click(function () {
                            if (count_item("machine_part", adventure_data.warehouse)) {
                                if (event_flags["know_pts"]) {
                                    let build_state = buildings["magnet"].on;
                                    if (build_state) {
                                        toggle_building_state("magnet");
                                    }

                                    /* Give a free magnet. */
                                    buildings["magnet"].amount++;
                                    buildings["magnet"].free++;
                                    if (build_state) { /* Only turn on if it already was on */
                                        toggle_building_state("magnet");
                                    }

                                    /* Spend costs. */
                                    event_flags["know_pts"]--;
                                    adventure_data.warehouse.splice(find_item("machine_part", adventure_data.warehouse), 1);
                                    purchase_building("magnet", 0); /* Update amount visible. */
                                    /* Redraw. */
                                    study();
                                } else {
                                    $("#events_content").prepend("Not enough Knowledge Points. Build more libraries.<br />");
                                }
                            } else {
                                $("#events_content").prepend("No machine part found. Check your warehouse.<br />");
                            }
                        }); /* End building magnet. */
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
})
