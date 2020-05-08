({
    "unlocked": function () { return true; },
    "go_again_text": "Stay",
    "encounters": [
        ({
            "condition": function () { return adventure_data["mavrith"] === undefined; },
            "types": ["noncombat"],
            "weight": 0,
            "title": "The Final Temple",
            "run_encounter": function () {
                $("#events_content").html("This is the final temple of the demon race. It was built to contain an incredible power, one rumored to have created the entire universe.<br/>");
                $("#events_content").append("Before you lies a grand marble hall, dimly lit by some unknown light source. At the end of the hall is a golden throne.<br/>");
                $("#events_content").append("Someone seems to have been chained to the throne. You can't quite make out who they are though.<br/>");
                $("#events_content").append("<button class='fgc bgc_second'>Approach</button> the throne");
                $("#events_content button").last().click(() => {
                    $("#events_content").html("You approach the man on the throne and finally catch a glimpse of their sunken, gaunt face.<br/>");
                    $("#events_content").append("This is the face of Mavrith, an ancient wizard of legends. The one who is rumored to have created fire. Not just lighting a fire, but changing reality itself so that fire could even exist.<br/>");
                    $("#events_content").append("If you wish, you could free him from these chains. But maybe he's here for a reason...<br/>");
                    $("#events_content").append("<button class='fgc bgc_second'>Free</button> him");
                    $("#events_content button").last().click(() => {
                        adventure_data["mavrith"] = true;
                        $("#events_content").html("You break the chains and free Mavrith.<br/>");
                        $("#events_content").append("As soon as he's free, an earthquake hits the temple. Chunks of rubble fall down.<br/>");
                        $("#events_content").append("You run for safety, but once the earthquake passes you can find no traces of Mavrith.<br/>");
                        $("#events_content").append("Hey, at least these rocks are intensely magical, due to having been next to Mavrith for so long.<br/>");
                        $("#events_content").append(exit_button("Leave"));
                    });
                    $("#events_content").append(exit_button("Leave"));
                });
            }
        }),
        ({
            "condition": function () { return adventure_data["mavrith"] === true; },
            "types": ["noncombat"],
            "weight": 0,
            "title": "The Final Temple",
            "run_encounter": function () {
                $("#events_content").html("There is nothing left here for you. Mavrith has left.<br/>");
                $("#events_content").append(exit_button("Leave"));
            }
        })
    ],
    "connects_to": [],
    "enter_cost": 666,
    "leave_cost": 666,
    "name": "The Temple",
});
//# sourceMappingURL=final.js.map