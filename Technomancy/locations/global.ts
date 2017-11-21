({
    "unlocked": function () { return true; },
    "go_again_text": "ERROR - You shouldn't be here.",
    "encounters": [
        ({
            "condition": function () { return Math.random() > 0.9; },
            "types": ["combat", "global", "wanderer"],
            "weight": 0,
            "title": "A Wild Turkey",
            "run_encounter": function () {
                $("#events_content").html("There's a wild turkey here! <br><span class='clickable'>Kill</span> it for dinner!");
                $("#events_content").children().last().click(function () {
                    setup_combat(
                        {
                            "shields": 4, /* Actually does stuff */
                            "actions_per_turn": 1, /* Actually does stuff */
                            "energy": 5, /* As of writing this, does nothing but I guess if there's a player weapon that steals energy...*/
                            "energy_left": 5,
                        },
                        function () {
                            adventure_data.warehouse.push({ name: "turkey_leg" });
                            $("#events_content").html("You beat the turkey. You take it's leg for dinner.<br/>");
                            $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Done</span>")
                        },
                        function () {
                            enemy_data["actions_left"] -= 1;
                            if (Math.random() > .66) {
                                $("#combat_log").html("The turkey runs in a circle.");
                            } else {
                                let pecks = 1;
                                while (Math.random() > pecks / player_data["max_shields"]) { pecks++; }
                                player_data["shields"] -= pecks;
                                $("#combat_log").html("It pecks you " + pecks.toString() + " times. Ow!");
                            }
                        } /* Peck up to max_shields times. It hurts! */
                    );
                    start_turn(player_data);
                });
            },

        }),
    ],
    "connects_to": [],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "How did you see this?",
})