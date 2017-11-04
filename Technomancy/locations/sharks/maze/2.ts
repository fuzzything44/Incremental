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
                $("#events_content").html("You enter a well-lit section of the dust cloud.");

                /* Toggle place if only previous is on. */
                if (!adventure_data["maze_progress"][0] && adventure_data["maze_progress"][1]) {
                    if (adventure_data["maze_progress"][2]) {
                        $("#events_content").append(" It gets darker.<br />");
                    } else {
                        $("#events_content").append(" It gets brighter.<br />");
                    }

                    adventure_data["maze_progress"][2] = !adventure_data["maze_progress"][2];
                } else {
                    $("#events_content").append("<br />");
                }

                /* Show progress */
                let progress = [];
                let progress_values = [0, 1, 3];
                let progress_text = ["swirling dust", "a pillar of fire", "a bright light", " some dust glittering"];
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
                    let last = progress.pop();
                    let text = progress.join(", ");
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
    "connects_to": ["sharks/maze/1", "sharks/maze/3", "sharks/maze/0"],
    "enter_cost": 0,
    "leave_cost": 1,
    "name": "Bright Cloud of Dust",
})