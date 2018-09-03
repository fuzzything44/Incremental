/* 
  Here we start going from kittens to sharks.
*/
({
    "unlocked": function () { return adventure_data["piscine_unlocked"]; },
    "go_again_text": "Swim",
    "encounters": [
        ({
            "condition": function () { return adventure_data.ship.engine == null || adventure_data.ship.engine.name == "basic_engine"; }, /* Just need any better engine */
            "types": [],
            "weight": 0,
            "title": "Something Seems Fishy",
            "run_encounter": function () {
                $("#events_content").html("Oh no! This planet is covered with dangerous methane! Your engines can't function in this atmosphere.<br/>");
                $("#events_content").append("Get better engines and come back...<br />Maybe you could build a different engine somehow.<br/>");
                $("#events_content").append(exit_button("Okay"));

                adventure_data.inventory_fuel += 1; /* They spent a fuel to get in, so it gets refunded. */
            }
        }), /* Engine failure - can't adventure here. */
        ({
            "condition": function () { return adventure_data["science_level"] == undefined; },
            "types": [],
            "weight": 1,
            "title": "What do you sea?",
            "run_encounter": function () {
                $("#events_content").html("You explore the deep blue sea.<br/>");
                if (adventure_data["science_level"] == undefined && Math.random() > .8) {
                    $("#events_content").append("Oh look, a shark. It wants to teach you science!<br/><span class='clickable'>Learn</span><br />");
                    $("#events_content > span").last().click(function () {
                        adventure_data["science_level"] = 1;
                        start_adventure();
                    });
                }
                $("#events_content").append(exit_button("Done"));
            }
        }), /* Learn from sharks */
        ({
            "condition": function () { return adventure_data["science_level"]; },
            "types": [],
            "weight": 4,
            "title": "Nothing else here.",
            "run_encounter": function () {
                $("#events_content").html("The sharks have nothing else to teach you right now.<br/>");
                $("#events_content").append(exit_button("Done"));
            }
        }), /* Finished shark stuff here. */
        ({
            "condition": function () {
                return adventure_data.alchemy_ingredients != undefined &&
                    adventure_data.alchemy_ingredients["Carrot"] > 0
             }, /* Just need any better engine */
            "types": [],
            "weight": 1,
            "title": "Even Better Gardening",
            "run_encounter": function () {
                $("#events_content").html("Oh man oh man oh man!<br/>");
                $("#events_content").append("So you planted your carrot and it turned into a SPACE CARROT!");
                $("#events_content").append(exit_button("YAY!"));
                adventure_data.alchemy_ingredients["Carrot"]--;
                adventure_data.alchemy_ingredients["Space Carrot"]++;
                adventure_data.inventory_fuel = 0;
                update_inventory();
            }
        }), /* Carrot upgrade */

    ],
    "connects_to": ["kittens/terminus", "sharks/maze/0"],
    "enter_cost": 3,
    "leave_cost": 1,
    "name": "Piscine",
})