({
    "unlocked": function () { return true; },
    "go_again_text": "Moon that Planet",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": ["combat"],
            "weight": 1,
            "title": "A Space... what?",
            "run_encounter": function () {
                $("#events_content").html("While traveling to the moon, you encounter a space squid. It's not happy. <br><span class='clickable'>Fight!</span>");
                $("#events_content").children().last().click(function () {
                    setup_combat({
                        "shields": 3,
                        "actions_per_turn": 2,
                        "energy": 5,
                        "energy_left": 5,
                    }, function () {
                        resources["ink"].amount += 10000;
                        $("#events_content").html("You beat the squid! It turns out space squids have a lot of ink.<br/>Gained 10000 ink.<br/>");
                        $("#events_content").append("<span class='clickable' onclick='start_adventure()'>Done</span>");
                    }, function () {
                        enemy_data["actions_left"] -= 1;
                        if (Math.random() > .5) {
                            $("#combat_log").html("The squid flails, doing nothing.");
                        }
                        else {
                            player_data["shields"] -= 2;
                            $("#combat_log").html("The squid flails and manages to damage your shields!");
                        }
                    } /* Our enemy does nothing or 2 damage randomly. */);
                    start_turn(player_data);
                });
            },
        }),
        ({
            "condition": function () { return true; },
            "types": ["noncombat"],
            "weight": 1,
            "title": "Hydrogen mining",
            "run_encounter": function () {
                $("#events_content").html("Oh huh. This rock on the moon has a lot of hydrogen in it. You can <span class='clickable'>refine</span> some of it!<br />");
                $("#events_content > span").last().click(function () {
                    $("#events_content").html("You manage to find 30000 hydrogen. <br /><span class='clickable' onclick='start_adventure()'>Done</span>");
                    resources["hydrogen"].amount += 30000;
                });
                /* If they have a machine part, they can build a mine. */
                if (count_item("machine_part")) {
                    $("#events_content").append("Or, you could <span class='clickable'>build</span> a mine on here with that machine part.");
                    $("#events_content > span").last().click(function () {
                        /* Remove the machine part that they have. */
                        adventure_data.inventory.splice(find_item("machine_part"), 1);
                        $("#events_content").html("You set up a hydrogen mine on the moon. <br /><span class='clickable' onclick='start_adventure()'>Done</span>");
                        /* Give them a mine on prestige too. Weird if to check for undefined. */
                        if (adventure_data["hydrogen_mines"]) {
                            adventure_data["hydrogen_mines"]++;
                        }
                        else {
                            adventure_data["hydrogen_mines"] = 1;
                        }
                        var comp_state = buildings["hydrogen_mine"].on;
                        if (comp_state) {
                            toggle_building_state("hydrogen_mine");
                        }
                        buildings["hydrogen_mine"].amount += 1;
                        if (comp_state) {
                            toggle_building_state("hydrogen_mine");
                        }
                        $("#building_hydrogen_mine > .building_amount").html(buildings["hydrogen_mine"].amount.toString());
                        update_inventory();
                    });
                }
            },
        }),
        ({
            "condition": function () { return event_flags["wanderer_knowledge"] == "alchemy" && adventure_data["alchemy_ingredients"]["Cheese"] != undefined; },
            "types": ["noncombat"],
            "weight": 1,
            "title": "This isn't right...",
            "run_encounter": function () {
                $("#events_content").html("Everyone knows the moon is made of cheese. But now that you're at the moon, you can't find cheese anywhere. Just some boring rocks. <br /><span class='clickable'>Fine</span>");
                $("#events_content > span").last().click(function () {
                    $("#events_content").html("You're an alchemist! You don't have to take this abuse! You transute some of the moon to cheese. A nice gouda, actually. <br /><span class='clickable' onclick='start_adventure()'>Yay!</span>");
                    adventure_data["alchemy_ingredients"]["Cheese"]++;
                });
            },
        }),
    ],
    "connects_to": ["kittens/terminus"],
    "enter_cost": 1,
    "leave_cost": 1,
    "name": "The Moon",
});
//# sourceMappingURL=moon.js.map