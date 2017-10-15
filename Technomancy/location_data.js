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
    "home": {
        "unlocked": function () { return true; },
        "encounters": [{
                "condition": function () { return true; },
                "types": [],
                "weight": 0,
                "title": "Adventure!",
                "run_encounter": function () {
                    $("#events_content").html("<span class='clickable'>Add</span> or <span class='clickable'>Remove</span> items from your ship.<br />");
                    /* Somehow we handle adding of items to ship inventory. */
                    $("#events_content > span").last().prev().click(function () {
                        $("#events_topbar").html("Stock Your Ship");
                        $("#events_content").html("<span>Add Fuel: <input id='add_fuel' type='number' min='1'/><span class='clickable'>Add!</span></span><br />");
                        $("#events_content > span > span").last().click(function () {
                            var fuel_to_add = parseInt($("#add_fuel").val());
                            /* Check to make sure the ship has enough space. Space is total size - used space. */
                            var ship_space = adventure_data.inventory_size - (adventure_data.inventory_fuel + adventure_data.inventory.length);
                            if (ship_space < fuel_to_add) {
                                fuel_to_add = ship_space;
                            }
                            if (resources["fuel"].amount > fuel_to_add) {
                                adventure_data.inventory_fuel += fuel_to_add;
                                update_inventory();
                            }
                            else {
                                alert("Not enough fuel.");
                            }
                        });
                        $("#events_content").append("<span class='clickable' onclick='run_adventure(\"home\");'>Go Back</span>");
                    });
                    /* Somehow we handle removing items from ship inventory */
                    $("#events_content > span").last().click(function () {
                        alert('Sorry, not ready yet.');
                    });
                    $("#events_content").append("<span class='clickable' onclick='start_adventure();'>Go Back</span>");
                }
            }],
        "connects_to": ["moon"],
        "enter_cost": 0,
        "leave_cost": 0,
        "name": "Home Planet",
    },
    "moon": {
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
        "connects_to": ["home"],
        "enter_cost": 1,
        "leave_cost": 0,
        "name": "The Moon",
    },
};
//# sourceMappingURL=location_data.js.map