({
    "unlocked": function () {
        /* Must have warp gate unlocked  */
        return !!adventure_data["warp_locations"];
    },
    "go_again_text": "Relax",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": [],
            "weight": 0,
            "title": "A Deep Blue Sea",
            "run_encounter": function () {
                if (adventure_data["warp_locations"].indexOf("sharks/haven") == -1) {
                    adventure_data["warp_locations"].push("sharks/haven");
                }
                $("#events_content").html("Science sharks congregate off to the side. What are they working on?<br />");
                $("#events_content").append("<span class='clickable'>Ask</span><br />");
                $("#events_content > span").last().click(function () {
                    $("#events_content").html("You go over and ask them. They seem to be doing something with a few glass bottles.<br />");
                    if (resources["glass_bottle"].amount < 5) {
                        $("#events_content").append("Hmm... maybe you could join them if you had some bottles of your own.<br/>" + exit_button("Okay"));
                    } else {
                        $("#events_content").append("Would you like to <span class='clickable'>refine</span> ingredients, ");
                        $("#events_content > span").last().click(function () {
                            alert("You have nothing to refine. Yet. Come back when major version is 3. Also, if you got here, message fuzzything44 on discord."); return;
                            /* Check alchemy stuff to see if refined ingredient table exists, and if not make it.*/
                            if (adventure_data["alchemy_ingredients"] == undefined) {
                                adventure_data["alchemy_ingredients"] = {};
                            }
                            /* At this point alchemy will probably deserve its own file. Maybe? Still not sure on internal organization.
                                But basically, you can refine stuff into materials. Materials can be used on potions then.
                                Each material has a major attribute - what it does, a time attribute - how long it lasts, and a potency - how strong it is.
                                You need one material for each slot. And no reuse of materials.
                            */
                        });
                        $("#events_content").append("<span class='clickable'>make</span> potions, or ");
                        $("#events_content > span").last().click(() => alert("You have nothing to make."));
                        $("#events_content").append(exit_button("Leave") + "?");

                    }
                });
                if (adventure_data["groupings_unlocked"] == undefined) {
                    $("#events_content").append("There are machines here. They weave in complex patterns. It's mesmerizing. <span class='clickable'>Watch</span>");
                    $("#events_content > span").last().click(function () {
                        $("#production_box").parent().removeClass("hidden");
                        adventure_data["groupings_unlocked"] = true;
                        $("#events_content").html("You watch them. They're in perfect rhythm. Not a single beat is missed. Better than your buildings. You can learn from these.<br/>");
                        $("#events_content").append(exit_button("Wow"));
                    });
                }
                $("#events_content").append(exit_button("Done"));
            }
        }),
    ],
    "connects_to": ["warpgate"],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "Haven",
})