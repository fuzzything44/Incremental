/*
List of all warp locations:
    home
    kittens/cath


*/
({
    "unlocked": function () { return adventure_data["warp_locations"]; },
    "go_again_text": "Warp",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [""],
            "weight": 0,
            "title": "Enter the Gate",
            "run_encounter": function () {
                /* Lets them warp to many different places. */
                $("#events_content").html("The warpgate lies before you. Where will you go?<br />");
                adventure_data["warp_locations"].forEach(function (loc) {
                    let place = get_location(loc);
                    $("#events_content").append("<span class='clickable'>" + place.name + "</span><br />");
                    $("#events_content > span").last().click(function () {
                        adventure_data.current_location = loc;
                        start_adventure();
                    });
                });
            },
        }),
    ],
    "connects_to": [],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "Warpgate",
});
//# sourceMappingURL=warpgate.js.map