﻿({
    "unlocked": function () { return true; },
    "go_again_text": "Terminate!",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": ["noncombat"],
            "weight": 7,
            "title": "Brrrr....",
            "run_encounter": function () {
                $("#events_content").html("Wow, this planet is cold. You need to constantly keep your engines running to keep warm. <br />");
                $("#events_content").append("<span class='clickable'>Run Them! (2)</span>");
                $("#events_content > span").last().click(function () {
                    if (adventure_data.inventory_fuel >= 2) {
                        adventure_data.inventory_fuel -= 2;
                        resources["water"].amount += 30000;
                        update_inventory();
                        $("#events_content").html("You run the engines and manage to keep warm. Oh, it looks like you melted some ice. <br /> Gained 30000 water.<br />");

                    } else {
                        $("#events_content").html("You don't have enough fuel... you sit in the cold and almost freeze. You should get out of here!<br/>");
                    }
                    $("#events_content").append(exit_button("Done"));
                });
                $("#events_content").append("<span class='clickable'>Don't</span>");
                $("#events_content > span").last().click(function () {
                    $("#events_content").html("You freeze to death. Well, not quite but it isn't fun. <br />" + exit_button("Done"));
                });
            },
        }), /* Freeze/melt ice for water */
        ({
            "condition": function () { return true; },
            "types": ["combat"],
            "weight": 3,
            "title": "Ice Giant on the ice giant.",
            "run_encounter": function () {
                $("#events_content").html("This planet is an ice giant. It also has an ice giant on it. Good luck. <br><span class='clickable'>Fight!</span>");
                $("#events_content").children().last().click(function () {
                    setup_combat(
                        {
                            "shields": 6, /* Actually does stuff */
                            "actions_per_turn": 1, /* Actually does stuff */
                            "energy": 5, /* As of writing this, does nothing but I guess if there's a player weapon that steals energy...*/
                            "energy_left": 5,
                        },
                        function () {
                            resources["water"].amount += 20000;
                            if (event_flags["skills"] && event_flags["skills"][3]) {
                                resources["water"].amount += 20000;
                                $("#events_content").html("You beat the ice giant. There's a ton of water here. <br/>Gained 40000 water.<br/>");
                            } else {
                                $("#events_content").html("You beat the ice giant. You collect the ice shards and melt them. <br/>Gained 20000 water.<br/>");
                            }
                            $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Done</span>")
                        },
                        function () {
                            enemy_data["actions_left"] -= 1;
                            player_data["shields"] -= 1;
                            $("#combat_log").html("It smashes your ship, doing 1 damage to your shields.");
                        } /* Our enemy does 1 damage. */
                    );
                    start_turn(player_data);
                });
            },
        }), /* Obligatory combat */

        ({
            "condition": function () { return adventure_data["has_cryostorage"] == undefined; },
            "types": ["noncombat"],
            "weight": 2,
            "title": "Cryostorage",
            "run_encounter": function () {
                $("#events_content").html("You find some strange blueprints here showing how to freeze things, making them take up less space. You can now store 5 more items. <br />");
                adventure_data["has_cryostorage"] = true;
                adventure_data.inventory_size += 5;
                update_inventory();
                $("#events_content").append(exit_button("Done"));

            },
        }), /* Ship storage boost */
        ({
            "condition": function () { return adventure_data["cath_discovery"] == undefined; },
            "types": ["noncombat"],
            "weight": 3,
            "title": "Small Probe...",
            "run_encounter": function () {
                $("#events_content").html("There's a small probe crashed into the planet here. Where did it come from? <br />");
                adventure_data["cath_discovery"] = 0;
                $("#events_content").append(exit_button("Interesting"));
            },
        }), /* Start quest for Cath */
        ({
            "condition": function () { return adventure_data["cath_discovery"] != undefined && adventure_data["cath_discovery"] < 3; },
            "types": ["noncombat"],
            "weight": 10,
            "title": "Investigating the probe",
            "run_encounter": function () {
                if (adventure_data["cath_discovery"] == 0) {
                    $("#events_content").html("Wow, there's a ton of probes over at this area! They all seem to be the same design as the last one. You salvage them for fuel.<br />Gained 30 fuel<br />");
                    resources["fuel"].amount += 30;
                } else if (adventure_data["cath_discovery"] == 1) {
                    $("#events_content").html("While investigating the crashed probes you find an abandoned observatory. You can see the sky! <br />");
                } else if (adventure_data["cath_discovery"] == 2) {
                    $("#events_content").html("Analyzing the trajectory of the probes, you look where you think they came from using an undamaged telescope in the observatory. Oh wow, you can see a planet there! <br /><em>Cath unlocked!</em><br />");
                }
                adventure_data["cath_discovery"] += 1;
                $("#events_content").append(exit_button("Continue onwards."));
            },
        }), /* Continue/end quest for Cath. No clue why it's 2 different encounters but whatever. */

        ({
            "condition": function () { return event_flags["alchemist_ingredients"] != undefined && event_flags["alchemist_ingredients"]["etherium"] && Math.random() > 0.95; },
            "types": ["noncombat"],
            "weight": 1,
            "title": "Huh, that's weird",
            "run_encounter": function () {
                $("#events_content").html("Hmm, that ice crystal doesn't look normal. <br /><span class='clickable'>Investigate</span>");
                $("#events_content > span").last().click(() => {
                    $("#events_content").html("Oh huh, looks like it's not ice. It's actually the incredibly rare ETHERIUM! <br /><span class='clickable' onclick='start_adventure()'>Yay!</span>");
                    adventure_data["alchemy_ingredients"]["Etherium"]++;
                });

            },
        }), /* End etherium */

    ],
    "connects_to": ["moon", "kittens/cath", "kittens/piscine"],
    "enter_cost": 3,
    "leave_cost": 3,
    "name": "Terminus",
})