({
    "unlocked": function () { return true; },
    "go_again_text": "Moon that Planet",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": ["combat"],
            "weight": 1,
            "title": "A Space... what?",
            "run_encounter": function () {
                $("#events_content").html("While traveling to the moon, you encounter a space squid. It's not happy. <br><span class='clickable'>Fight!</span>");
                $("#events_content").children().last().click(function () {
                    setup_combat(
                        {
                            "shields": 3, /* Actually does stuff */
                            "actions_per_turn": 2, /* Actually does stuff */
                            "energy": 5, /* As of writing this, does nothing but I guess if there's a player weapon that steals energy...*/
                            "energy_left": 5,
                        },
                        function () {
                            resources["ink"].amount += 10000;
                            $("#events_content").html("You beat the squid! It turns out space squids have a lot of ink.<br/>Gained 10000 ink.<br/>");
                            $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Done</span>")
                        },
                        function () {
                            enemy_data["actions_left"] -= 1;
                            if (Math.random() > .5) {
                                $("#combat_log").html("The squid flails, doing nothing.");
                            } else {
                                player_data["shields"] -= 2;
                                $("#combat_log").html("The squid flails and manages to damage your shields!");
                            }
                        } /* Our enemy does nothing or 2 damage randomly. */
                    );
                    start_turn(player_data);
                });
            },
        }), /* End space squid encounter */
        ({
            "condition": function () { return true; },
            "types": ["combat"],
            "weight": 1,
            "title": "Hydrogen mining",
            "run_encounter": function () {
                $("#events_content").html("Oh huh. This rock on the moon has a lot of hydrogen in it. You can refine some of it! <br><span class='clickable'>Refine</span>");
                $("#events_content").children().last().click(() => {
                    $("#events_content").html("You manage to find 30000 hydrogen. <br /><span class='clickable' onclick='start_adventure()'>Done</span>");
                    resources["hydrogen"].amount += 30000;
                });
            },
        }), /* End test encounter */
    ], /* End encounters */
    "connects_to": ["kittens/terminus"],
    "enter_cost": 1,
    "leave_cost": 1,
    "name": "The Moon",
})

