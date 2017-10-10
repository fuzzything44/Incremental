/*
* List of locations
* Each location has a name and some various encounters that can happen.
* An encounter consists of the following:
*   condition(): Can the encounter actually happen? If not, removed from the options when selecting an encounter.
*   run_encounter(): Actually runs the encounter.
*   weight: How relatively likely it is to happen. Note that 0 weight is treated specially - it WILL happen. Other than that, all weights are added and rolled for the encounter.
*   title: what the top gets set to.
*   types: What types of encounter so some ones can be selectively removed. List of string types. Current types are:
*       combat              noncombat
*
*/
var locations = {
    "moon": [
        ({
            condition: function () { return true; },
            types: ["combat"],
            weight: 1,
            title: "A Space... what?",
            run_encounter: function () {
                $("#events_content").html("While traveling to the moon, you encounter a space squid. It's not happy. <br><span class='clickable'>Fight!</span>");
                $("#events_content").children().last().click(function () { setup_combat({}); start_turn(player_data); });
            },
        }),
        ({
            condition: function () { return true; },
            types: ["combat"],
            weight: 1,
            title: "TEST ENCOUNTER",
            run_encounter: function () {
                $("#events_content").html("This is an encounter test. It does things. <br><span class='clickable'>Yay things!</span>");
                $("#events_content").children().last().click(function () { alert("Haha no. There's no use to it."); start_adventure(); });
            },
        }),
    ],
};
//# sourceMappingURL=location_data.js.map