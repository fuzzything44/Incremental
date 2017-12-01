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
                /* Add this as a warp location. */
                if (adventure_data["warp_locations"].indexOf("sharks/haven") == -1) {
                    adventure_data["warp_locations"].push("sharks/haven");
                }
                $("#events_content").html("<a href='http://cirri.al/sharks/#' target='_blank' style='text-decoration: none;' class='fgc'>Science sharks</a> congregate off to the side. What are they working on?<br />");

                /* Talk with science sharks */
                $("#events_content").append("<span class='clickable'>Ask</span><br />");
                $("#events_content > span").last().click(function () {
                    $("#events_content").html("You go over and ask them. They seem to be doing something with a few glass bottles.<br />");
                    if (resources["glass_bottle"].amount < 5) {
                        $("#events_content").append("Hmm... maybe you could join them if you had some bottles of your own.<br/>" + exit_button("Okay"));
                    } else {
                        $("#events_content").append("Would you like to <span class='clickable'>refine</span> ingredients, ");
                        $("#events_content > span").last().click(function () {
                            /* Check alchemy stuff to see if refined ingredient table exists, and if not make it.*/
                            if (adventure_data["alchemy_ingredients"] == undefined) {
                                adventure_data["alchemy_ingredients"] = {};
                            }
                            alchemy_ingredients();
                        });
                        $("#events_content").append("<span class='clickable'>make</span> potions, or ");
                        $("#events_content > span").last().click(function () {
                            /* Check alchemy stuff to see if refined ingredient table exists, and if not make it.*/
                            if (adventure_data["alchemy_ingredients"] == undefined) {
                                adventure_data["alchemy_ingredients"] = {};
                            }
                            alchemy_mix();
                        });
                        $("#events_content").append(exit_button("Leave") + "?");

                    }
                });

                /* Unlock groupings*/
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
    "connects_to": ["kittens/piscine", "sharks/abandoned", "warpgate"],
    "enter_cost": 0,
    "leave_cost": 0,
    "name": "Haven",
})