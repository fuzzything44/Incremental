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
                $("#events_content").children().last().click(function () { setup_combat({}); start_turn(player_data); });
            },
        }),
        ({
            "condition": function () { return true; },
            "types": ["combat"],
            "weight": 1,
            "title": "Hydrogen mining",
            "run_encounter": function () {
                $("#events_content").html("Oh huh. This rock on the moon has a lot of hydrogen in it. You can refine some of it! <br><span class='clickable'>Refine</span>");
                $("#events_content").children().last().click(function () {
                    $("#events_content").html("You manage to find 30000 hydrogen. <br /><span class='clickable' onclick='start_adventure()'>Done</span>");
                    resources["hydrogen"].amount += 30000;
                });
            },
        }),
    ],
    "connects_to": ["kittens/terminus"],
    "enter_cost": 1,
    "leave_cost": 1,
    "name": "The Moon",
});
//# sourceMappingURL=moon.js.map