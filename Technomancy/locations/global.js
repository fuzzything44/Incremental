({
    "unlocked": function () { return true; },
    "go_again_text": "ERROR - You shouldn't be here.",
    "encounters": [
        ({
            "condition": function () { return false && Math.random() > 0.9; },
            "types": ["combat", "global", "wanderer"],
            "weight": 0,
            "title": "A Wild Turkey",
            "run_encounter": function () {
                $("#events_content").html("There's a wild turkey here! <br><span class='clickable'>Kill</span> it for dinner!");
                $("#events_content").children().last().click(function () {
                    setup_combat({
                        "shields": 4,
                        "actions_per_turn": 1,
                        "energy": 5,
                        "energy_left": 5,
                    }, function () {
                        adventure_data.warehouse.push({ name: "turkey_leg" });
                        $("#events_content").html("You beat the turkey. You take it's leg for dinner.<br/>");
                        $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Done</span>");
                    }, function () {
                        enemy_data["actions_left"] -= 1;
                        if (Math.random() > .66) {
                            $("#combat_log").html("The turkey runs in a circle.");
                        }
                        else {
                            var pecks = 1;
                            while (Math.random() > pecks / player_data["max_shields"]) {
                                pecks++;
                            }
                            player_data["shields"] -= pecks;
                            $("#combat_log").html("It pecks you " + pecks.toString() + " times. Ow!");
                        }
                    } /* Peck up to max_shields times. It hurts! */);
                    start_turn(player_data);
                });
            },
        }),
        ({
            "condition": function () { return Math.random() > 0.9; },
            "types": ["noncombat", "global"],
            "weight": 0,
            "title": "Trick or Treat!",
            "run_encounter": function () {
                $("#events_content").html("You arrive at a house with it's lights on. And you even remembered your plastic pumpkin bucket!<br/>");
                $("#events_content").append("<span class='clickable'>Trick or Treat!</span>");
                $("#events_content").children().last().click(function () {
                    var candy = Math.floor(Math.random() * 10 + 2);
                    $("#events_content").html("You got a nice handful of " + format_num(candy) + " pieces of candy!");
                    var candy_loc = find_item("candy", adventure_data.warehouse);
                    if (candy_loc == -1) {
                        adventure_data["warehouse"].push({ "name": "candy", "amount": candy });
                    }
                    else {
                        adventure_data["warehouse"][candy_loc].amount += candy;
                    }
                });
            },
        }),
    ],
    "connects_to": [],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "How did you see this?",
});
//# sourceMappingURL=global.js.map