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
                $("#events_content").html("<span>Add Fuel: <input id='add_fuel' type='number' min='1'/><span class='clickable'>Add!</span></span> (You have " + format_num(resources["fuel"].amount) + " fuel)<br />");
                $("#events_content > span > span").last().click(function () {
                    let fuel_to_add = parseInt($("#add_fuel").val())

                    if (isNaN(fuel_to_add) || fuel_to_add < 0) {
                        fuel_to_add = 0;
                    }

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
                            if (event_flags["skills"] && event_flags["skills"][12]) {
                                event_flags["know_pts"]++;
                            }
                            study(); /* Redraw. */
                        });
                    }
                    if (event_flags["know_pts"] && buildings["library"].free < buildings["library"].amount && purchased_upgrades.indexOf("better_library_3") != -1) {
                        $("#events_content").append("<span class='clickable'>Reset</span> library base cost.<i style='text: small'> (Libraries go to their base cost, but the cost scaling of them is increased. This costs 1 KP.)</i><br />");
                        $("#events_content span").last().click(function () {
                            buildings["library"].free = buildings["library"].amount;
                            event_flags["know_pts"]--;
                            if (event_flags["skills"] && event_flags["skills"][12]) {
                                buildings["library"].price_ratio["iron"] += .02;
                                buildings["library"].price_ratio["wood"] += .02;
                                buildings["library"].price_ratio["book"] += .02;
                                buildings["library"].price_ratio["money"] += .02;
                            } else {
                                buildings["library"].price_ratio["iron"] += .025;
                                buildings["library"].price_ratio["wood"] += .025;
                                buildings["library"].price_ratio["book"] += .025;
                                buildings["library"].price_ratio["money"] += .025;
                            }
                            study();
                        });
                    }

                    if (event_flags["wanderer_knowledge"] == "magic") {
                        if (event_flags["skills"] == undefined) {
                            event_flags["skills"] = Array(16);
                        }
                        const SKILL_MAKE_BAG = 0;
                        const SKILL_BETTER_REFINE = 1;
                        const SKILL_EVENTS = 2;
                        const SKILL_LOOT = 3;
                        const SKILL_MANA_FORMULA = 4;
                        const SKILL_COMBAT = 5;
                        const SKILL_NONCOMBAT = 6;
                        const SKILL_OMNIVISION = 7;
                        const SKILL_QUICK_MANA = 8;
                        const SKILL_COMBAT_STRONG = 9;
                        const SKILL_NONCOMBAT_STRONG = 10;
                        const SKILL_LOOT_III = 11;
                        const SKILL_LIBRARY = 12;
                        const SKILL_FORESIGHT = 13;
                        const SKILL_MAKE_PERM_BAG = 14;
                        const SKILL_FINAL = 15;

                        if (event_flags["skills"][SKILL_FINAL]) {
                            $("#events_content").append("Good job getting this. But it's not quite implemented yet. <br />");
                        }

                        $("#events_content").append("Please note that some skills don't do anything yet. They're coming soon! Anything with an actual tooltip should work though.<br />");

                        if (event_flags["skills"][SKILL_MAKE_BAG]) {
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
                        }

                        if (event_flags["skills"][SKILL_MAKE_PERM_BAG]) {
                            $("#events_content").append("<span class='clickable'>Make</span> some mithril cloth. (Requires 150 mithril and 5 void)<br />");
                            $("#events_content span").last().click(function () {
                                if (resources["mithril"].amount >= 150 && resources["void"].amount >= 5) {
                                    resources["mithril"].amount -= 150;
                                    resources["void"].amount -= 5;

                                    if (adventure_data["perm_resources"] == undefined) {
                                        adventure_data["perm_resources"] = {}
                                    }
                                    if (adventure_data["perm_bag_bits"] == undefined) {
                                        adventure_data["perm_bag_bits"] = 0
                                    }

                                    adventure_data["perm_bag_bits"]++;
                                    resources_per_sec["magic_bag"] = 1;
                                } else {
                                    $("#events_content").prepend("You don't have the resources to make that.<br />");
                                }
                            });
                        }

                        if (event_flags["skills"][SKILL_COMBAT] != undefined || event_flags["skills"][SKILL_NONCOMBAT] != undefined) {
                            $("#events_content").append("<div id='c_nc_group' class='radio-group'></div>");
                                
                            if (event_flags["skills"][SKILL_COMBAT] != undefined) {
                                $("#c_nc_group").append("<input type='radio' name='c_nc_group' id='c_nc_c' value='combat'><label for='c_nc_c'>Combat</label></input>");
                            }

                            if (event_flags["skills"][SKILL_NONCOMBAT] != undefined) {
                                $("#c_nc_group").append("<input type='radio' name='c_nc_group' id='c_nc_nc' value='noncombat'><label for='c_nc_nc'>Noncombat</label></input>");
                            }

                            $("#c_nc_group").append("<input type='radio' name='c_nc_group' id='c_nc_off' value='off'><label for='c_nc_off'>Off</label></input>");

                            $("input[type=radio][name=c_nc_group]").change(function () {
                                if (this.value == "combat") {
                                    event_flags["skills"][SKILL_COMBAT] = true;
                                    if (event_flags["skills"][SKILL_NONCOMBAT] != undefined) {
                                        event_flags["skills"][SKILL_NONCOMBAT] = false;
                                    }
                                } else if (this.value == "noncombat") {
                                    event_flags["skills"][SKILL_NONCOMBAT] = true;
                                    if (event_flags["skills"][SKILL_COMBAT] != undefined) {
                                        event_flags["skills"][SKILL_COMBAT] = false;
                                    }
                                } else {
                                    if (event_flags["skills"][SKILL_NONCOMBAT] != undefined) {
                                        event_flags["skills"][SKILL_NONCOMBAT] = false;
                                    }
                                    if (event_flags["skills"][SKILL_COMBAT] != undefined) {
                                        event_flags["skills"][SKILL_COMBAT] = false;
                                    }
                                }
                            });
                            if (event_flags["skills"][SKILL_COMBAT]) {
                                $("#c_nc_c").prop("checked", true);
                                /* Turn off the nc one. */
                                if (event_flags["skills"][SKILL_NONCOMBAT] != undefined) {
                                    event_flags["skills"][SKILL_NONCOMBAT] = false;
                                }
                            } else if (event_flags["skills"][SKILL_NONCOMBAT]) {
                                $("#c_nc_nc").prop("checked", true);
                                /* We already know the combat one is off, so we don't need to turn it off. */
                            } else {
                                $("#c_nc_off").prop("checked", true);
                            }

                        }

                        if (event_flags["skills"][SKILL_COMBAT_STRONG] != undefined || event_flags["skills"][SKILL_NONCOMBAT] != undefined) {
                            if (event_flags["c_nc_strong"] == undefined) {
                                event_flags["c_nc_strong"] = false;
                            }
                            $("#events_content").append("<br/><div id='c_nc_strong_group' class='radio-group'></div>");

                            $("#c_nc_strong_group").append("<input type='radio' name='c_nc_strong_group' id='c_nc_strong_on' value='strong'><label for='c_nc_strong_on'>Strong</label></input>");

                            $("#c_nc_strong_group").append("<input type='radio' name='c_nc_strong_group' id='c_nc_strong_off' value='weak'><label for='c_nc_strong_off'>Weak</label></input>");

                            $("input[type=radio][name=c_nc_strong_group]").change(function () {
                                if (this.value == "strong") {
                                    event_flags["c_nc_strong"] = true
                                } else {
                                    event_flags["c_nc_strong"] = false;
                                }
                            });
                            if (event_flags["c_nc_strong"]) {
                                $("#c_nc_strong_on").prop("checked", true);
                            } else {
                                $("#c_nc_strong_off").prop("checked", true);
                            }

                        }

                        $("#events_content").append("<div id='skill_tree' style='positon: relative; left: 2em;'></div>");
                        /* Tier 1 */
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 23em; top: 0em; z-index: 16;'><br />Artificing<br />1 KP<span class='tooltiptext fgc bgc_second'>Lets you make bags of holding.</span></div>");

                        /* Connecting lines */
                        let color = "gray";
                        color = event_flags["skills"][SKILL_MAKE_BAG] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:360px;height: 1px;position: absolute; left: 30em; top: 5em; transform: rotate(20deg);'></div>");
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:360px;height: 1px;position: absolute; left: 5em; top: 5em; transform: rotate(340deg);'></div>");
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:50px;height: 1px;position: absolute; left: 27em; top: 7em; transform: rotate(90deg);'></div>");

                        /* Tier 2 */
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 4em;  top: 8em; z-index: 13;'><br />Efficient Refining<br />1 KP<span class='tooltiptext fgc bgc_second'>Get double mana when you refine.</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 23em; top: 8em; z-index: 14;'><br />Temporal Permanance<br />1 KP<span class='tooltiptext fgc bgc_second'>You can get events while offline. Works best with AutoEvents.</span></div>")
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 43em; top: 8em; z-index: 15;'><br />Advanced Looting<br />1 KP<span class='tooltiptext fgc bgc_second'>You find more stuff when killing enemies.</span></div>");

                        /* Connecting lines */
                        color = event_flags["skills"][SKILL_BETTER_REFINE] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 12em; top: 9em; transform: rotate(100deg);'></div>");
                        color = event_flags["skills"][SKILL_LOOT] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 54em; top: 5em; transform: rotate(80deg);'></div>");
                        color = event_flags["skills"][SKILL_EVENTS] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 26em; top: 13em; transform: rotate(140deg);'></div>");
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 34em; top: 0em; transform: rotate(40deg);'></div>");

                        /* Tier 3 */
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 3em;  top: 18em; z-index: 9;'><br />Distributed Mana<br />1 KP<span class='tooltiptext fgc bgc_second'>Provides a boost to the value of resources. The boost increases the closer resources are to balanced (weighted average of their amount * value)</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 17em; top: 16em; z-index: 10;'><br />Temporal Anger<br />1 KP<span class='tooltiptext fgc bgc_second'>When on, combat adventures are twice as likely.</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 30em; top: 16em; z-index: 11;'><br />Temporal Slow<br />1 KP<span class='tooltiptext fgc bgc_second'>When on, noncombat adventures are twice as likely.</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 44em; top: 18em; z-index: 12;'><br />Omnivision<br />1 KP<span class='tooltiptext fgc bgc_second'>More values are shown to you.</span></div>");

                        /* Connecting lines */
                        color = event_flags["skills"][SKILL_MANA_FORMULA] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 11.5em; top: 15em; transform: rotate(90deg);'></div>");
                        color = event_flags["skills"][SKILL_COMBAT] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:100px;height: 280px;position: absolute; left: 28em; top: 14em; transform: rotate(90deg);'></div>");
                        color = event_flags["skills"][SKILL_NONCOMBAT] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:100px;height: 280px;position: absolute; left: 41em; top: 14em; transform: rotate(90deg);'></div>");
                        color = event_flags["skills"][SKILL_OMNIVISION] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 55em; top: 18em; transform: rotate(90deg);'></div>");

                        

                        /* Tier 4 */
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 3em;  top: 28em; z-index: 5;'><br />Instant Mana<br />2 KP<span class='tooltiptext fgc bgc_second'>Gives you your mana instantly without need for prestige.</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 17em; top: 25em; z-index: 6;'><br />Temporal Rage<br />2 KP<span class='tooltiptext fgc bgc_second'>Increases the strength of Temporal Anger</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 30em; top: 25em; z-index: 7;'><br />Temporal Absence<br />2 KP<span class='tooltiptext fgc bgc_second'>Increases the strength of Temporal Slow</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 44em; top: 28em; z-index: 8;'><br />LOOT III?<br />2 KP<span class='tooltiptext fgc bgc_second'>TODO: TOOLTIP</span></div>");

                        /* Connecting lines */
                        color = event_flags["skills"][SKILL_QUICK_MANA] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 12em; top: 27em; transform: rotate(80deg);'></div>");
                        color = event_flags["skills"][SKILL_COMBAT_STRONG] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 24em; top: 15em; transform: rotate(40deg);'></div>");
                        color = event_flags["skills"][SKILL_NONCOMBAT_STRONG] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 34em; top: 30em; transform: rotate(140deg);'></div>");
                        color = event_flags["skills"][SKILL_LOOT_III] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:150px;height: 280px;position: absolute; left: 54em; top: 27em; transform: rotate(100deg);'></div>");

                        /* Tier 5 */
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 5em; top: 37em; z-index: 2;'><br />Magic Tomes<br />2 KP<span class='tooltiptext fgc bgc_second'>Gain twice the KP when sacrificing libraries.</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 23em; top: 33em; z-index: 3;'><br />Foresight<br />3 KP<span class='tooltiptext fgc bgc_second'>Allows you to change your fate</span></div>");
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 42em; top: 37em; z-index: 4;'><br />Advanced Artificing<br />2 KP<span class='tooltiptext fgc bgc_second'>Allows you to craft mithril cloth by using void. It has magical duplication properties.</span></div>");

                        /* Connecting Lines */
                        color = event_flags["skills"][SKILL_LIBRARY] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:200px;height: 280px;position: absolute; left: 18em; top: 26em; transform: rotate(40deg);'></div>");
                        color = event_flags["skills"][SKILL_MAKE_PERM_BAG] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:200px;height: 280px;position: absolute; left: 37em; top: 41em; transform: rotate(145deg);'></div>");
                        color = event_flags["skills"][SKILL_FORESIGHT] != undefined ? "blue" : "gray";
                        $("#skill_tree").append("<div style='border-bottom: 5px solid " + color + ";width:100px;height: 280px;position: absolute; left: 34.5em; top: 33em; transform: rotate(90deg);'></div>");


                        /* Ultimate Skill */
                        $("#skill_tree").append("<div class='skill_box bgc_second tooltip' style='position: absolute; left: 23em; top: 42em; z-index: 1;'><br />Super Skill<br />4 KP<span class='tooltiptext fgc bgc_second'>TODO: TOOLTIP</span></div>");
                        $("#events_content").append("<br /><br />");

                        for (let i = 0; i < event_flags["skills"].length; i++) {
                            if (event_flags["skills"][i] != undefined) {
                                $("#skill_tree .skill_box").eq(i).addClass("purchased");
                            } else {
                                const COSTS = [
                                    1,
                                    1, 1, 1,
                                    1, 1, 1, 1,
                                    2, 2, 2, 2,
                                    2, 3, 2,
                                    4
                                ];
                                const REQUIREMENTS = [
                                    [], /* No requirement for artificing.*/
                                    [SKILL_MAKE_BAG],/* All of these take artificing*/
                                    [SKILL_MAKE_BAG],
                                    [SKILL_MAKE_BAG],
                                    [SKILL_BETTER_REFINE], /* Tier 3 spells*/
                                    [SKILL_EVENTS],
                                    [SKILL_EVENTS],
                                    [SKILL_LOOT],
                                    [SKILL_MANA_FORMULA], /* Tier 4. */
                                    [SKILL_COMBAT],
                                    [SKILL_NONCOMBAT],
                                    [SKILL_OMNIVISION], 
                                    [SKILL_QUICK_MANA], /* Tier 5. */
                                    [SKILL_COMBAT_STRONG, SKILL_NONCOMBAT_STRONG],
                                    [SKILL_LOOT_III],
                                    [SKILL_LIBRARY, SKILL_FORESIGHT, SKILL_MAKE_PERM_BAG] /* Final skill */
                                ];
                                function prereqs_satisfied(skill) {
                                    for (let i = 0; i < REQUIREMENTS[skill].length; i++) {
                                        if (event_flags["skills"][REQUIREMENTS[skill][i]] == undefined) {
                                            return false;
                                        }
                                    }
                                    return true;
                                }
                                let index = i;

                                if (event_flags["know_pts"] >= COSTS[index] && prereqs_satisfied(index)) { /* Have enough KP */
                                    $("#skill_tree .skill_box").eq(index).click(function () {
                                        event_flags["skills"][index] = true;
                                        event_flags["know_pts"] -= COSTS[index];
                                        study();
                                    });
                                    $("#skill_tree .skill_box").eq(index).addClass("buyable");
                                }

                            }
                        }
                    } else if (event_flags["wanderer_knowledge"] == "alchemy") {
                        if (event_flags["alchemist_ingredients"] == undefined) {
                            $("#events_content").append("There's not much here... try becoming an inventor or mage. Or check back in a few weeks. Maybe months. <br />");
                            $("#events_content").append("<span class='clickable'>Reset</span> class choice<br />");
                            $("#events_content span").last().click(function () {
                                buildings["library"].free += 50;
                                delete event_flags["wanderer_knowledge"];
                                $("#events").addClass("hidden");
                                $("#character").addClass("hidden");
                                force_event(12);
                            });

                            $("#events_content").append("<span class='clickable'>Unlock</span> the secrets of cheese! (Makes cheese available to get somewhere in adventure, but you won't be able to back out of alchemist using the above button)");
                            $("#events_content span").last().click(function () {
                                event_flags["alchemist_ingredients"] = { "cheese": true };
                            });
                        } else {
                            let UNLOCKS = [
                                { name: "etherium", cost: 30},
                            ];

                            UNLOCKS.forEach(function (ingredient) {
                                if (event_flags["alchemist_ingredients"][ingredient.name] == undefined) {
                                    $("#events_content").append("<span class='clickable'>Unlock</span> the secrets of " + ingredient.name + "! (Costs " + format_num(ingredient.cost) + " KP)");
                                    $("#events_content span").last().click(function () {
                                        if (event_flags["know_pts"] >= ingredient.cost) {
                                            event_flags["alchemist_ingredients"][ingredient.name] = true;
                                            study();
                                        } else {
                                            $("#events_content").prepend("Oops, you can't get that");
                                        }
                                    });
                                }
                            });
                        }

                    } else if (event_flags["wanderer_knowledge"] == "inventor") {
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

                        $("#events_content").append("<span class='clickable'>Make</span> a Book Recycler (Costs 1 KP)<br />");
                        
                        $("#events_content > span").last().click(function () {
                            if (event_flags["know_pts"]) {
                                let build_state = buildings["book_boost"].on;
                                if (build_state) {
                                    toggle_building_state("book_boost");
                                }
                            
                                /* Give a free magnet. */
                                buildings["book_boost"].amount++;
                                if (build_state) { /* Only turn on if it already was on */
                                    toggle_building_state("book_boost");
                                }
                            
                                /* Spend costs. */
                                event_flags["know_pts"]--;
                                /* Redraw. */
                                study();
                                purchase_building("book_boost", 0);
                            } else {
                                $("#events_content").prepend("Not enough Knowledge Points. Build more libraries.<br />");
                            }
                        }); /* End building books. */

                        if (buildings["steel_smelter"].amount > 1) {
                            $("#events_content").append("<span class='clickable'>Upgrade</span> a Steel Foundry (Costs 1 KP)<br />");
                            $("#events_content > span").last().click(function () {
                                if (buildings["steel_smelter"].amount > 1) {
                                    if (event_flags["know_pts"]) {
                                        /* Remove a steel foundry, give a mithril forge. */
                                        let build_state = buildings["steel_smelter"].on;
                                        if (build_state) {
                                            toggle_building_state("steel_smelter");
                                        }

                                        buildings["steel_smelter"].amount--;
                                        buildings["steel_smelter"].free--;
                                        if (build_state) { /* Only turn on if it already was on */
                                            toggle_building_state("steel_smelter");
                                        }

                                        /* Giving the forge. */
                                        build_state = buildings["mithril_smelter"].on;
                                        if (build_state) {
                                            toggle_building_state("mithril_smelter");
                                        }

                                        buildings["mithril_smelter"].amount++;
                                        if (build_state) { /* Only turn on if it already was on */
                                            toggle_building_state("mithril_smelter");
                                        }
                                        /* Spend knowledge point. */
                                        event_flags["know_pts"]--;

                                        /* Redraw amounts. */
                                        study();
                                        purchase_building("steel_smelter", 0);
                                        purchase_building("mithril_smelter", 0);
                                    } else {
                                        $("#events_content").prepend("Not enough Knowledge Points. Build more libraries.<br />");
                                    }
                                } else {
                                    $("#events_content").prepend("You need another Steel Foundry.<br />");
                                    study();
                                }
                            });
                        }

                        if (buildings["mana_purifier"].amount > 0 && event_flags["know_pts"] > 10) {
                            if (event_flags["buildings_fortified"] == undefined) {
                                event_flags["buildings_fortified"] = 0;
                            }
                            let cost = 1000 * (event_flags["buildings_fortified"] + 1) * (event_flags["buildings_fortified"] + 1);
                            $("#events_content").append("You could fortify a building for " + cost.toString() + " steel and 10 KP<br />");
                            Object.keys(buildings).forEach(function (build) {
                                if (SPELL_BUILDINGS.indexOf(build) == -1 && buildings[build].amount > 10 && buildings[build]["prefix"] == undefined) { /* Regular building, they have a bunch of them, and not already upgrades. */
                                    $("#events_content").append("<span class='clickable'>Fortify</span> your " + $("#building_" + build + " .building_name").text() + "<br />");
                                    $("#events_content > span").last().click(function () {
                                        if (resources["steel_beam"].amount > cost && event_flags["know_pts"] >= 10) {
                                            resources["steel_beam"].amount -= cost; /* Spend everything */
                                            event_flags["know_pts"] -= 10;
                                            event_flags["buildings_fortified"]++; /* Next fortify costs more. */

                                            buildings[build]["prefix"] = "Fortified"; /* Give it the prefix */
                                            $("#building_" + build + " .building_prefix").html("Fortified ");

                                            let build_state = buildings[build].on;
                                            if (build_state) {
                                                toggle_building_state(build);

                                            }

                                            /* Double all production of it. */
                                            Object.keys(buildings[build].generation).forEach(function (res) {
                                                buildings[build].generation[res] *= 2;
                                            });

                                            if (build_state) { /* Only turn on if it already was on */
                                                toggle_building_state(build);
                                            }

                                            study(); /* Refresh display. */
                                        }
                                    });
                                }
                            });
                        }
                    } /* End Inventor*/
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
