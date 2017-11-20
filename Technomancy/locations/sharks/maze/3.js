({
    "unlocked": function () { return true; },
    "go_again_text": "Explore",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "Swirling Dust",
            "run_encounter": function () {
                $("#events_content").html("You enter a glimmering section of the dust cloud.");
                /* Toggle place if only previous on. */
                if (!adventure_data["maze_progress"][0] && !adventure_data["maze_progress"][1] && adventure_data["maze_progress"][2]) {
                    if (adventure_data["maze_progress"][3]) {
                        $("#events_content").append(" Some sparkling dust disappears.<br />");
                    }
                    else {
                        $("#events_content").append(" You notice a bit of highly reflective dust.<br />");
                    }
                    adventure_data["maze_progress"][3] = !adventure_data["maze_progress"][3];
                }
                else {
                    if (adventure_data["maze_progress"][3]) {
                        $("#events_content").append(" It's very sparkly here.<br />");
                    }
                    else {
                        $("#events_content").append("<br />");
                    }
                }
                /* Show progress */
                var progress = [];
                var progress_values = [0, 1, 2];
                var progress_text = ["swirling dust", "a pillar of fire", "a bright light", " some dust glittering"];
                progress_values.forEach(function (val) {
                    if (adventure_data["maze_progress"][val]) {
                        progress.push(progress_text[val]);
                        if (Math.random() > .5) {
                            progress.reverse();
                        }
                    }
                });
                /* They have some progress. */
                if (progress.length) {
                    var last = progress.pop();
                    var text = progress.join(", ");
                    $("#events_content").append("In the distance you see " + text);
                    if (text) {
                        $("#events_content").append(" and ");
                    }
                    $("#events_content").append(last + ".<br />");
                }
                $("#events_content").append(exit_button("Done"));
            }
        }),
    ],
    "connects_to": ["sharks/maze/2", "sharks/maze/1", "sharks/maze/0", "sharks/maze/exit"],
    "enter_cost": 0,
    "leave_cost": 1,
    "name": "Sparkling Cloud of Dust",
});
//# sourceMappingURL=3.js.map