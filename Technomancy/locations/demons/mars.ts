/* 
  Here we start going from kittens to demons.
*/
({
    "unlocked": function () { return buildings["s_manastone"].amount > 250; },
    "go_again_text": "Rove",
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
    "connects_to": ["moon"],
    "enter_cost": 1,
    "leave_cost": 2,
    "name": "Mars",
})