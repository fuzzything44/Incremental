/*
  Here we start going from kittens to sharks.
*/
({
    "unlocked": function () { return adventure_data["piscine_unlocked"]; },
    "go_again_text": "Swim",
    "encounters": [
        ({
            "condition": function () { return adventure_data.ship.engine.name == "basic_engine"; },
            "types": [],
            "weight": 0,
            "title": "Something Seems Fishy",
            "run_encounter": function () {
                $("#events_content").html("Oh no! This planet is covered with dangerous methane! Your engines can't function in this atmosphere.<br/>");
                $("#events_content").append("Get better engines and come back...<br />");
                $("#events_content").append(exit_button("Okay"));
                adventure_data.inventory_fuel += 1; /* They spent a fuel to get in, so it gets refunded. */
            }
        }),
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
        }),
        ({
            "condition": function () { return adventure_data["science_level"]; },
            "types": [],
            "weight": 1,
            "title": "Nothing else here.",
            "run_encounter": function () {
                $("#events_content").html("The sharks have nothing else to teach you right now.<br/>");
                $("#events_content").append(exit_button("Done"));
            }
        }),
    ],
    "connects_to": ["kittens/terminus", "sharks/maze/0"],
    "enter_cost": 1,
    "leave_cost": 2,
    "name": "Piscine",
});
//# sourceMappingURL=piscine.js.map