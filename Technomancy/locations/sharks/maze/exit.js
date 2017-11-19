({
    "unlocked": function () {
        /* Previous unlocked, nothing else is.  */
        return !adventure_data["maze_progress"][0] && !adventure_data["maze_progress"][1] && !adventure_data["maze_progress"][2] && adventure_data["maze_progress"][3];
    },
    "go_again_text": "Yay",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "Finally!",
            "run_encounter": function () {
                $("#events_content").html("You finally made it out of the dust cloud.<br />");
                $("#events_content").append("Something unseen says,<br/>");
                $("#events_content").append("What is to come?");
                $("#events_content").append(exit_button("Done"));
            }
        }),
    ],
    "connects_to": ["sharks/haven", "kittens/piscine"],
    "enter_cost": 0,
    "leave_cost": 1,
    "name": "A Small Cloud of Dust",
});
//# sourceMappingURL=exit.js.map