/* 
  Here we start going from kittens to demons.
*/
({
    "unlocked": function () { return true; },
    "go_again_text": "Rove",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": ["noncombat"],
            "weight": 0,
            "title": "A dry, dusty planet",
            "run_encounter": function () {
                resources["sand"].amount += 10000000;
                $("#events_content").html("This is Mars. It's a barren, dusty planet with nothing really useful. At least you can get some sand here. <br/>");
                $("#events_content").append(exit_button("Done"));
            }
        }),
    ],
    "connects_to": ["moon", "demons/ulgathor"],
    "enter_cost": 100,
    "leave_cost": 25,
    "name": "Mars",
})