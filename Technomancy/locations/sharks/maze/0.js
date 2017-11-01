({
    "unlocked": function () { return adventure_data["science_level"]; },
    "go_again_text": "Explore",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "Swirling Dust",
            "run_encounter": function () {
                /* Init maze. */
                if (adventure_data["maze_progress"] == undefined) {
                    adventure_data["maze_progress"] = [false, false, false, false];
                }
                $("#events_content").html("You enter a dark section of the dust cloud.");
                /* Show toggling on/off */
                if (adventure_data["maze_progress"][0]) {
                    $("#events_content").append(" Some swirls of dust dissipate.<br />");
                }
                else {
                    $("#events_content").append(" Some dust swirls around your ship.<br />");
                }
                /* Toggle place */
                adventure_data["maze_progress"][0] = !adventure_data["maze_progress"][0];
                /* Show progress */
                var progress = [];
                var progress_values = [1, 2, 3];
                var progress_text = ["swirling dust", "a pillar of fire", "a bright light", " some dust glittering"];
                progress_values.forEach(function (val) {
                    if (adventure_data["maze_progress"][val]) {
                        if (Math.random() > .5) {
                            progress.reverse();
                        }
                        progress.push(progress_text[val]);
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
    "connects_to": ["sharks/maze/1", "sharks/maze/3", "sharks/maze/2", "kittens/piscine"],
    "enter_cost": 0,
    "leave_cost": 1,
    "name": "Dark Cloud of Dust",
});
//# sourceMappingURL=0.js.map