/* 
  Here we start going from kittens to sharks.
*/
({
    "unlocked": function () { return adventure_data["piscine_unlocked"]; },
    "go_again_text": "Swim",
    "encounters": [
        ({
            "condition": function () { return adventure_data.ship.engine.name == "basic_engine"; }, /* Just need any better engine */
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
            "condition": function () { return true; },
            "types": [],
            "weight": 1,
            "title": "Whoops!",
            "run_encounter": function () {
                $("#events_content").html("Something went wrong. You shouldn't see this. <br/>");
                $("#events_content").append(exit_button("Okay"));
                adventure_data.inventory_fuel += 1; /* They spent a fuel to get in, so it gets refunded. */
            }
        }),
    ],
    "connects_to": ["kittens/terminus"],
    "enter_cost": 1,
    "leave_cost": 2,
    "name": "Piscine",
})