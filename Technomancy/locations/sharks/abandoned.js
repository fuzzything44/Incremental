({
    "unlocked": function () {
        /* Must have groupings unlocked  */
        return !!adventure_data["groupings_unlocked"] && adventure_data["alchemy_ingredients"] != undefined;
    },
    "go_again_text": "Explore",
    "encounters": [
        ({
            "condition": function () { return true; },
            "types": ["noncombat"],
            "weight": 7,
            "title": "A Dying World",
            "run_encounter": function () {
                $("#events_content").html("The tar here is choking out all life.<br />");
                $("#events_content").append("Only machines will remain. All will be lost.<br/><br/>");
                $("#events_content").append("There is nothing you can do. Only watch.<br/>");
                if (resources_per_sec["mana"] < 50 && adventure_data["auto_events"] == undefined) {
                    $("#events_content").append("Maybe if you had more free mana you could learn something.<br/>");
                }
                if (resources_per_sec["mana"] >= 50 && adventure_data["rules_unlocked"] == undefined) {
                    $("#events_content").append("<span class='clickable'>Watch</span> the machines. <i>This will destroy some of your mana stones and your engines. Click with care. </i><br/>");
                    $("#events_content span").last().click(function () {
                        /* Remove mana. */
                        resources_per_sec["mana"] -= 50;
                        buildings["s_manastone"].amount -= 50;
                        /* Redraw manastone amount. */
                        $("#building_s_manastone > .building_amount").html(format_num(buildings["s_manastone"].amount, false));
                        /* And unlock production control...*/
                        adventure_data["rules_unlocked"] = true;
                        $("#pc_box").parent().removeClass("hidden");
                        $("#events_content").html("The machines continue their functions, even as the tar in the ocean grows and obscures them from your view and clogs your engine.");
                        adventure_data["ship"].engine = null;
                        update_inventory();
                    });
                }
                if (resources_per_sec["mana"] >= 50 && adventure_data["rules_unlocked"] != undefined && adventure_data["auto_events"] == undefined) {
                    $("#events_content").append("<span class='clickable'>Watch</span> the machines. <i>This will destroy more of your mana stones and your shields. Click with care. </i><br/>");
                    $("#events_content span").last().click(function () {
                        /* Remove mana. */
                        resources_per_sec["mana"] -= 50;
                        buildings["s_manastone"].amount -= 50;
                        /* Redraw manastone amount. */
                        $("#building_s_manastone > .building_amount").html(format_num(buildings["s_manastone"].amount, false));
                        /* And unlock production control...*/
                        adventure_data["auto_events"] = true;
                        $("#pc_box").parent().removeClass("hidden");
                        $("#events_content").html("The machines continue their functions, even as the tar in the ocean grows and obscures them from your view and rusts your shields.<br />");
                        $("#events_content").append("<i>Note: you have unlocked event automation. Set the option number to 0 to instantly close an event. Otherwise, if an event matches it will close after 1 second.</i>");
                        adventure_data["ship"].shield = null;
                        update_inventory();
                        setup_rules();
                    });
                }
                $("#events_content").append("<br />" + exit_button("Leave"));
            }
        }),
        ({
            "condition": function () { return false; },
            "types": ["noncombat"],
            "weight": 3,
            "title": "Self-Replication",
            "run_encounter": function () {
                if (adventure_data["repl_time"] == undefined) {
                    adventure_data["repl_time"] = Date.now();
                }
                let num_machines = Math.pow(1.00001, Date.now() - adventure_data["repl_time"]);
                if (num_machines == Infinity) {
                    $("#events_content").html("The replicators are everywhere. <br />");
                    $("#events_content").append("<span class='clickable'>Take</span> one.");
                    $("#events_content span").click(function () {
                        $("#events_content").html("You take one. But where are the rest of them?<br />");
                        $("#events_content").append(exit_button("Leave"));
                        adventure_data["repl_time"] = Date.now();
                        adventure_data["warehouse"].push({ name: "replicator" });
                    });
                }
                else {
                    $("#events_content").html("There are currently " + format_num(num_machines, true) + " replicators here.<br />");
                    $("#events_content").append(exit_button("leave"));
                }
            },
        }),
    ],
    "connects_to": ["sharks/marine", "sharks/haven"],
    "enter_cost": 8,
    "leave_cost": 3,
    "name": "Abandoned World",
});
//# sourceMappingURL=abandoned.js.map