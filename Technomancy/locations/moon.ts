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
                $("#events_content").children().last().click(() => { setup_combat({}); start_turn(player_data); });
            },
        }), /* End space squid encounter */
        ({
            "condition": function () { return true; },
            "types": ["combat"],
            "weight": 1,
            "title": "TEST ENCOUNTER",
            "run_encounter": function () {
                $("#events_content").html("This is an encounter test. It does things. <br><span class='clickable'>Yay things!</span>");
                $("#events_content").children().last().click(() => { alert("Haha no. There's no use to it."); start_adventure(); });
            },
        }), /* End test encounter */
    ], /* End encounters */
    "connects_to": [],
    "enter_cost": 1,
    "leave_cost": 1,
    "name": "The Moon",
})

