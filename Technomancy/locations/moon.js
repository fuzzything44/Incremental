({
    "unlocked": function () { return true; },
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
            "title": "TEST ENCOUNTER",
            "run_encounter": function () {
                $("#events_content").html("This is an encounter test. It does things. <br><span class='clickable'>Yay things!</span>");
                $("#events_content").children().last().click(function () { alert("Haha no. There's no use to it."); start_adventure(); });
            },
        }),
    ],
    "connects_to": [],
    "enter_cost": 1,
    "leave_cost": 1,
    "name": "The Moon",
});
//# sourceMappingURL=moon.js.map